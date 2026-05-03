import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, LeaveRequest, RequestStatus, RequestCategory } from './types.ts';
import PortalSelection from './components/PortalSelection.tsx';
import AuthForm from './components/AuthForm.tsx';
import StudentDashboard from './components/StudentDashboard.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import StudentProfilePage from './components/StudentProfilePage.tsx';
import { LogOut, LayoutDashboard, Settings2, User as UserIcon } from 'lucide-react';
import { api } from './services/api.ts';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePortal, setActivePortal] = useState<UserRole | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');
  const isInitialLoadRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Initial user check on mount
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setActivePortal(user.role);
      // Don't fetch here - let the useEffect handle it after currentUser is set
    }
    setLoading(false);
  }

  // Polling for updates
  useEffect(() => {
    if (!currentUser) {
      setRequests([]); // Clear requests when no user
      return;
    }

    isInitialLoadRef.current = true; // Reset for new user
    fetchRequests(); // Initial fetch

    const interval = setInterval(() => {
      fetchRequests(); // Polling updates
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser]); // Depend on currentUser changes

  async function fetchRequests() {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    const isInitialLoad = isInitialLoadRef.current;
    
    if (isInitialLoad) {
      setRequestsLoading(true);
    }
    
    try {
      let data;
      if (currentUser?.role === UserRole.ADVISOR) {
        // For advisors, first get their advisor record, then fetch requests assigned to them
        try {
          const advisor = await api.advisors.getByUserId(currentUser.id);
          if (advisor && advisor.id) {
            data = await api.requests.getByAdvisor(advisor.id);
          } else {
            data = [];
          }
        } catch (error) {
          console.error('Failed to fetch advisor requests:', error);
          data = [];
        }
      } else {
        // For other roles (HOD, Principal), fetch all requests
        data = await api.requests.getAll();
      }
      
      setRequests(data || []);
      if (isInitialLoad) {
        setRequestsLoading(false);
        isInitialLoadRef.current = false;
      }
    } finally {
      isFetchingRef.current = false;
    }
  }

  const handleLogin = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setActivePortal(user.role);
    // Don't fetch here - useEffect will handle it when currentUser updates
  };

  const handleLogout = async () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActivePortal(null);
    setRequestsLoading(false); // Reset loading state
    isInitialLoadRef.current = true; // Reset initial load state
    isFetchingRef.current = false; // Reset fetching state
  };

  const addRequest = async (req: LeaveRequest) => {
    const formData = new FormData();
    if (currentUser?.id) {
      formData.append('userId', currentUser.id.toString());
    }
    formData.append('category', req.category);
    formData.append('reason', req.purpose);
    formData.append('fromDate', req.fromDate);
    formData.append('toDate', req.toDate);
    if (req.advisorId) {
      formData.append('advisorId', req.advisorId);
    }

    try {
      const responseMsg = await api.requests.create(formData);

      if (responseMsg.startsWith("Error")) {
        alert("Submission Failed: " + responseMsg);
      } else {
        alert("Success: " + responseMsg);
        fetchRequests();
      }
    } catch (e) {
      console.error("Failed to add request", e);
      alert("Failed to send request. \n\n1. Check if the Backend Server is running.\n2. Check console logs for details.");
    }
  };

  const updateRequestStatus = async (requestId: string, approverRole: UserRole, action: string, comment?: string) => {
    // Determine status string
    let nextStatus = RequestStatus.PENDING_HOD; // Default fallback action

    if (action === 'Rejected') {
      nextStatus = RequestStatus.REJECTED;
    } else if (action === 'Finalize') {
      // Immediate Approval (e.g. Advisor grants Permission directly)
      nextStatus = RequestStatus.APPROVED;
    } else {
      // Standard Forwarding Chain
      if (approverRole === UserRole.ADVISOR) nextStatus = RequestStatus.PENDING_HOD;
      else if (approverRole === UserRole.HOD) nextStatus = RequestStatus.PENDING_PRINCIPAL;
      else if (approverRole === UserRole.PRINCIPAL) nextStatus = RequestStatus.APPROVED;
    }

    await api.requests.updateStatus(requestId, nextStatus, comment);
    fetchRequests();
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const responseMsg = await api.requests.delete(id);
      if (responseMsg.startsWith("Error")) {
        alert("Deletion Failed: " + responseMsg);
      } else {
        alert("Success: " + responseMsg);
        fetchRequests();
      }
    } catch (e) {
      console.error("Failed to delete request", e);
      alert("Failed to delete request.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Initializing Secure Connection...</p>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {!activePortal ? (
        <motion.div key="portal" exit={{ opacity: 0, y: -20 }}>
          <PortalSelection onSelect={setActivePortal} />
        </motion.div>
      ) : !currentUser ? (
        <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <AuthForm role={activePortal} onAuthSuccess={handleLogin} onBack={() => setActivePortal(null)} />
        </motion.div>
      ) : (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f8fafc]">
          <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-20 items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
                    <LayoutDashboard className="text-white w-6 h-6" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight uppercase">Event Tracker</h1>
                    <p className="text-[10px] text-indigo-600 font-black tracking-[0.2em] uppercase">{currentUser.role} Control Panel</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {currentUser.role === UserRole.STUDENT && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${
                          currentView === 'dashboard' 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="hidden sm:block text-sm font-bold">Dashboard</span>
                      </button>
                      <button
                        onClick={() => setCurrentView('profile')}
                        className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 ${
                          currentView === 'profile' 
                            ? 'bg-indigo-50 text-indigo-600' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <UserIcon className="w-5 h-5" />
                        <span className="hidden sm:block text-sm font-bold">Profile</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 pl-6 border-l border-slate-100">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{currentUser.rollNumber || currentUser.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {currentUser.role === UserRole.STUDENT ? (
              currentView === 'dashboard' ? (
                <StudentDashboard 
                  user={currentUser} 
                  requests={requests.filter(r => r.studentId === currentUser.id)} 
                  onAddRequest={addRequest} 
                  onDeleteRequest={handleDeleteRequest} 
                />
              ) : (
                <StudentProfilePage user={currentUser} />
              )
            ) : (
              <AdminDashboard
                user={currentUser}
                requests={requests}
                onAction={updateRequestStatus}
                loading={requestsLoading}
              />
            )}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
