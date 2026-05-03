import React, { useState } from 'react';
import { User, UserRole, LeaveRequest, RequestStatus } from '../types.ts';
import { Check, X, FileText, Calendar, User as UserIcon, Inbox, MessageSquare, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  user: User;
  requests: LeaveRequest[];
  onAction: (id: string, role: UserRole, action: string, comment?: string) => void;
  loading?: boolean;
}

const AdminDashboard: React.FC<Props> = ({ user, requests, onAction, loading = false }) => {
  const [comment, setComment] = useState<{ [key: string]: string }>({});

  const getActionButtons = (req: LeaveRequest) => {
    const isAdvisor = user.role === UserRole.ADVISOR;
    const isHod = user.role === UserRole.HOD;
    const isPrincipal = user.role === UserRole.PRINCIPAL;

    const cat = req.category.toLowerCase();
    const isPermission = cat.includes('permission');

    return (
      <div className="flex flex-col gap-3">
        {/* Top Row: Reject and Primary Action */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(req.id, user.role, 'Rejected', comment[req.id])}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-white border-2 border-rose-500 text-rose-500 font-bold rounded-2xl hover:bg-rose-50 transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Reject</span>
          </motion.button>

          {isPrincipal && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(req.id, user.role, 'Finalize', comment[req.id])}
              className="flex-[2] flex items-center justify-center space-x-2 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
            >
              <Check className="w-5 h-5" />
              <span>Finalize & Approve</span>
            </motion.button>
          )}

          {isHod && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(req.id, user.role, 'Forward', comment[req.id])}
              className="flex-[2] flex items-center justify-center space-x-2 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              <Check className="w-5 h-5" />
              <span>Forward to Principal</span>
            </motion.button>
          )}

          {isAdvisor && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction(req.id, user.role, isPermission ? 'Finalize' : 'Forward', comment[req.id])}
              className="flex-[2] flex items-center justify-center space-x-2 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              <Check className="w-5 h-5" />
              <span>{isPermission ? 'Approve' : 'Forward to HOD'}</span>
            </motion.button>
          )}
        </div>

        {/* Bottom Row: Direct Approval for Advisor/HOD */}
        {(isAdvisor || isHod) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAction(req.id, user.role, 'Finalize', comment[req.id])}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>Direct Approval</span>
          </motion.button>
        )}
      </div>
    );
  };

  const today = new Date().toLocaleDateString('en-CA');

  const pendingRequests = requests.filter(r => {
    if (user.role === UserRole.ADVISOR) return r.status === RequestStatus.PENDING_ADVISOR;
    if (user.role === UserRole.HOD) return r.status === RequestStatus.PENDING_HOD;
    if (user.role === UserRole.PRINCIPAL) return r.status === RequestStatus.PENDING_PRINCIPAL;
    return false;
  });

  const activeLeaves = requests.filter(r => {
    return r.status === RequestStatus.APPROVED &&
      today >= r.fromDate &&
      today <= r.toDate;
  });

  return (
    <div className="space-y-12">
      {/* Current Absentees / On Leave Today Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">On Leave Today</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {activeLeaves.length} Student{activeLeaves.length !== 1 ? 's' : ''} currently away
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeLeaves.length === 0 ? (
            <div className="col-span-full py-10 bg-white rounded-[2rem] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active leaves records for today</p>
            </div>
          ) : (
            activeLeaves.map((req) => (
              <motion.div
                key={`active-${req.id}`}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center space-x-5"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-base font-black text-slate-900 truncate uppercase tracking-tight">{req.studentName}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{req.rollNumber}</p>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">{req.category}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <div className="h-px bg-slate-100 mx-10" />

      {/* Pending Approvals Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Pending Approvals</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {pendingRequests.length} Request{pendingRequests.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        layout
        className="grid grid-cols-1 gap-6"
      >
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-[3rem] border border-slate-200"
          >
            <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-8 h-8 text-slate-300 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Loading Requests...</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Fetching your pending verifications</p>
          </motion.div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {pendingRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">All Clear!</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">No pending verifications at this time</p>
              </motion.div>
            ) : (
              pendingRequests.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="p-10">
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{req.studentName}</h4>
                          <div className="flex items-center space-x-3 text-sm text-slate-500">
                            <span>Roll: {req.rollNumber}</span>
                            {req.parentPhoneNumber && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center text-indigo-600 font-semibold">
                                  <Phone className="w-3.5 h-3.5 mr-1" />
                                  Parent: {req.parentPhoneNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Category</p>
                          <p className="text-sm font-semibold text-slate-900">{req.category}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Duration</p>
                          <div className="flex items-center space-x-1 text-sm font-semibold text-slate-900">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Purpose</p>
                        <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl text-sm leading-relaxed border-l-4 border-indigo-400 italic">
                          "{req.purpose}"
                        </p>
                      </div>

                      {req.attachmentName && (
                        <div className="flex items-center space-x-2 text-indigo-600 text-sm font-semibold">
                          <FileText className="w-4 h-4" />
                          <span className="underline cursor-pointer">View Attachment: {req.attachmentName}</span>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-80 flex flex-col justify-between">
                      <div className="space-y-4 mb-6">
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                          <textarea
                            placeholder="Add a remark (optional)"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none text-sm"
                            value={comment[req.id] || ''}
                            onChange={(e) => setComment({ ...comment, [req.id]: e.target.value })}
                          />
                        </div>
                      </div>

                      {getActionButtons(req)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
