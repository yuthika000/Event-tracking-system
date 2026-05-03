import React, { useState, useMemo, useEffect } from 'react';
import { User, LeaveRequest, RequestCategory, RequestStatus, UserRole } from '../types.ts';
import { Plus, Clock, CheckCircle2, XCircle, FileText, Calendar, Sparkles, Loader2, CalendarDays, PieChart as PieChartIcon, TrendingUp, AlertTriangle, Trash2, LayoutGrid } from 'lucide-react';
import { refinePurpose } from '../services/gemini.ts';
import { api } from '../services/api.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  user: User;
  requests: LeaveRequest[];
  onAddRequest: (req: LeaveRequest, file?: File | null) => void;
  onDeleteRequest: (id: string) => void;
}

const StudentDashboard: React.FC<Props> = ({ user, requests, onAddRequest, onDeleteRequest }) => {
  const [showForm, setShowForm] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    category: RequestCategory.LEAVE,
    purpose: '',
    fromDate: '',
    toDate: '',
    advisorId: ''
  });

  // Fetch advisors on component mount
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const advisorsData = await api.advisors.getAll();
        setAdvisors(advisorsData);
      } catch (error) {
        console.error('Failed to fetch advisors:', error);
      }
    };
    fetchAdvisors();
  }, []);

  // Helper to calculate days between two dates (inclusive)
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Leave Balance & Analytics Logic
  const TOTAL_LEAVE = 15;
  const analyticsData = useMemo(() => {
    const totals = {
      [RequestCategory.LEAVE]: 0,
      [RequestCategory.MEDICAL_LEAVE]: 0,
      [RequestCategory.OD]: 0,
      [RequestCategory.PERMISSION]: 0
    };

    requests.forEach(req => {
      if (req.status === RequestStatus.APPROVED) {
        const days = calculateDays(req.fromDate, req.toDate);
        if (totals[req.category] !== undefined) {
          totals[req.category] += days;
        }
      }
    });

    return [
      { name: 'Leave', value: totals[RequestCategory.LEAVE], color: '#6366f1' }, // Indigo
      { name: 'Medical', value: totals[RequestCategory.MEDICAL_LEAVE], color: '#f43f5e' }, // Rose
      { name: 'OD', value: totals[RequestCategory.OD], color: '#10b981' }, // Emerald
      { name: 'Permission', value: totals[RequestCategory.PERMISSION], color: '#f59e0b' } // Amber
    ].filter(item => item.value > 0);
  }, [requests]);

  const leaveStats = useMemo(() => {
    let used = 0;
    requests.forEach(req => {
      const isLeaveType = req.category === RequestCategory.LEAVE || req.category === RequestCategory.MEDICAL_LEAVE;
      const isApproved = req.status === RequestStatus.APPROVED;
      if (isLeaveType && isApproved) {
        used += calculateDays(req.fromDate, req.toDate);
      }
    });
    return {
      total: TOTAL_LEAVE,
      used,
      remaining: Math.max(0, TOTAL_LEAVE - used)
    };
  }, [requests]);


  const handleRefineWithAI = async () => {
    if (!formData.purpose) return;
    setLoadingAI(true);
    const refined = await refinePurpose(formData.category, formData.purpose);
    setFormData({ ...formData, purpose: refined });
    setLoadingAI(false);
  };

  // Get today's date in local YYYY-MM-DD format
  const today = new Date().toLocaleDateString('en-CA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.fromDate < today) {
      alert("Error: Start date cannot be in the past.");
      return;
    }
    if (formData.toDate < formData.fromDate) {
      alert("Error: End date cannot be before start date.");
      return;
    }

    const newRequest: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      studentName: user.name,
      rollNumber: user.rollNumber || '',
      category: formData.category,
      purpose: formData.purpose,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      advisorId: formData.advisorId,
      status: RequestStatus.PENDING_ADVISOR,
      createdAt: new Date().toISOString(),
      history: [{ role: user.role, action: 'Submitted', timestamp: new Date().toISOString() }]
    };
    onAddRequest(newRequest);
    setShowForm(false);
    setFormData({ category: RequestCategory.LEAVE, purpose: '', fromDate: '', toDate: '', advisorId: '' });
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case RequestStatus.REJECTED: return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    }
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: return <CheckCircle2 className="w-4 h-4" />;
      case RequestStatus.REJECTED: return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRejectionDetails = (request: LeaveRequest) => {
    const rejection = [...request.history].reverse().find(h => h.action === 'Rejected');
    return rejection ? { role: rejection.role, comment: rejection.comment } : null;
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24">
      {/* Leave Balance - Linear Format */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden"
      >
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Annual Leave Quota</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Academic Year 2025-2026 • Parent Contact: {user.parentPhoneNumber || 'Not Provided'}</p>
          </div>
          <div className="text-right">
            {/* User requested to remove the specific 'used' number display */}
          </div>
        </div>

        <div className="relative h-6 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(leaveStats.used / leaveStats.total) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${leaveStats.remaining < 3 ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${leaveStats.remaining < 3 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <span className={`text-xs font-black uppercase tracking-widest ${leaveStats.remaining < 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {leaveStats.remaining} Days Remaining
            </span>
          </div>
        </div>
      </motion.div>

      {/* Analytics Section */}
      {analyticsData.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="w-full h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {analyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '20px',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900">{analyticsData.reduce((a, b) => a + b.value, 0)}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Days</span>
              </div>
            </div>

            <div className="w-full space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Activity Analytics</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Leave Category Distribution</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {analyticsData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-black text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">{item.value} {item.value === 1 ? 'Day' : 'Days'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <TrendingUp className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                <LayoutGrid className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-2xl font-black tracking-tight mb-2">Workflow Score</h4>
              <p className="text-slate-400 text-xs font-bold leading-relaxed">
                Your leave applications are processed with 100% digital verification.
              </p>
            </div>
            <div className="mt-12 space-y-2 relative z-10">
              <div className="text-4xl font-black tracking-tighter">Elite State</div>
              <div className="flex items-center space-x-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Verification</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-1"
        >
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Academic Workflow</h2>
          <p className="text-slate-500 font-medium flex items-center space-x-2">
            <span>Manage requests for</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold uppercase tracking-wider">OD</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-bold uppercase tracking-wider">Leave</span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-xs font-bold uppercase tracking-wider">Permission</span>
          </p>
        </motion.div>
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`group flex items-center space-x-3 px-8 py-4 rounded-2xl font-black transition-all duration-300 shadow-xl overflow-hidden relative ${showForm
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
            }`}
        >
          {showForm ? <XCircle className="w-5 h-5 relative z-10" /> : <Plus className="w-5 h-5 relative z-10" />}
          <span className="uppercase tracking-[0.15em] text-xs relative z-10">{showForm ? 'Cancel Application' : 'Create Request'}</span>
          {!showForm && <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden"
          >
            <div className="bg-slate-50/80 backdrop-blur-sm px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl tracking-tight">Digital Application Form</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Automated Approval Tracking</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Request Type</label>
                    <select
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700 transition-all cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as RequestCategory })}
                    >
                      {Object.values(RequestCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Advisor</label>
                    <select
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-slate-700 transition-all cursor-pointer"
                      value={formData.advisorId}
                      onChange={e => setFormData({ ...formData, advisorId: e.target.value })}
                      required
                    >
                      <option value="">Choose an advisor...</option>
                      {advisors.map(advisor => (
                        <option key={advisor.id} value={advisor.id}>
                          {advisor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 space-y-8">
                  <div className="flex items-center space-x-3 mb-2">
                    <CalendarDays className="w-5 h-5 text-indigo-500" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Duration</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Starts From</label>
                      <input
                        required
                        type="date"
                        min={today}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all"
                        value={formData.fromDate}
                        onChange={e => setFormData({ ...formData, fromDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ends At</label>
                      <input
                        required
                        type="date"
                        min={formData.fromDate || today}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all"
                        value={formData.toDate}
                        onChange={e => setFormData({ ...formData, toDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4 pt-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Purpose & Justification</label>
                    <button
                      type="button"
                      onClick={handleRefineWithAI}
                      disabled={loadingAI || !formData.purpose}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 tracking-[0.1em] uppercase transition-all"
                    >
                      {loadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Formalize with AI</span>
                    </button>
                  </div>
                  <textarea
                    required
                    className="w-full px-8 py-7 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-50 h-40 resize-none font-bold text-slate-700 leading-relaxed placeholder:text-slate-300 transition-all"
                    placeholder="Provide a clear reason for your absence or activity..."
                    value={formData.purpose}
                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  <button
                    type="submit"
                    className="w-full py-6 bg-slate-900 text-white font-black text-lg rounded-[1.5rem] shadow-2xl shadow-slate-200 hover:bg-black transition-all hover:scale-[1.01] active:scale-[0.99] uppercase tracking-[0.2em]"
                  >
                    Confirm & Send Request
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        className="space-y-8"
      >
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-40 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 shadow-sm flex flex-col items-center"
          >
            <div className="bg-slate-50/50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3">
              <FileText className="text-slate-200 w-16 h-16" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Workspace Empty</h3>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Your approval history will grow as you apply</p>
          </motion.div>
        ) : (
          requests.map((req, i) => {
            const rejection = getRejectionDetails(req);
            return (
              <motion.div
                key={req.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white p-10 rounded-[3.5rem] shadow-[0_15px_60px_rgba(0,0,0,0.02)] border border-slate-50 hover:shadow-[0_30px_90px_rgba(79,70,229,0.12)] transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                  <div className="flex flex-col sm:flex-row items-start gap-8">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg ${getStatusColor(req.status)} group-hover:rotate-2 transition-transform duration-500`}>
                      <FileText className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center flex-wrap gap-4">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{req.category}</span>
                        <div className="h-1 w-8 bg-slate-100 rounded-full"></div>
                        <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100">#{req.id}</span>
                      </div>
                      <p className="text-slate-500 font-bold text-lg max-w-xl leading-relaxed italic opacity-90 group-hover:opacity-100 transition-opacity">
                        "{req.purpose}"
                      </p>
                      <div className="flex items-center space-x-8 pt-2">
                        <div className="flex items-center space-x-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="p-1.5 bg-slate-100 rounded-lg"><CalendarDays className="w-4 h-4 text-indigo-500" /></div>
                          <span>{new Date(req.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — {new Date(req.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-5 shrink-0">
                    <div className={`px-10 py-4 rounded-[1.75rem] text-xs font-black border flex items-center space-x-3 tracking-[0.2em] uppercase shadow-sm transition-all group-hover:scale-105 ${getStatusColor(req.status)}`}>
                      {getStatusIcon(req.status)}
                      <span>{req.status}</span>
                    </div>

                    {req.status === RequestStatus.PENDING_ADVISOR && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this leave request?")) {
                            onDeleteRequest(req.id);
                          }
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-black">Withdraw</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {req.status === RequestStatus.REJECTED && rejection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-12 p-10 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-start space-x-8"
                  >
                    <div className="bg-white p-5 rounded-3xl text-rose-500 shrink-0 shadow-sm border border-rose-100/50">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-rose-900 uppercase tracking-[0.2em]">
                        Application Refined by <span className="underline decoration-indigo-500/30 underline-offset-8">{rejection.role}</span>
                      </h4>
                      <p className="text-lg text-rose-800 font-bold italic leading-relaxed">
                        Feedback: {rejection.comment || 'Request does not meet institutional guidelines.'}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="mt-14 pt-14 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-10 px-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Institutional Flow State</h4>
                  </div>
                  <div className="relative flex items-center justify-between px-6 sm:px-14">
                    <div className="absolute left-0 top-[2rem] -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>

                    {[
                      { label: 'Academic Advisor', role: UserRole.ADVISOR },
                      { label: 'Department Head', role: UserRole.HOD },
                      { label: 'College Principal', role: UserRole.PRINCIPAL }
                    ].map((step, idx) => {
                      const hist = req.history.find(h => h.role === step.role);
                      const isRejected = hist?.action === 'Rejected';
                      const isApproved = hist?.action === 'Approved';

                      let state = 'upcoming';
                      if (isApproved) state = 'completed';
                      else if (isRejected) state = 'failed';
                      else if (
                        (step.role === UserRole.ADVISOR && req.status === RequestStatus.PENDING_ADVISOR) ||
                        (step.role === UserRole.HOD && req.status === RequestStatus.PENDING_HOD) ||
                        (step.role === UserRole.PRINCIPAL && req.status === RequestStatus.PENDING_PRINCIPAL)
                      ) state = 'active';

                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center bg-white px-4">
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: state === 'active' ? 1.1 : 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className={`w-16 h-16 rounded-3xl flex items-center justify-center border-4 transition-all duration-1000 mb-5 shadow-sm ${state === 'completed' ? 'bg-slate-900 border-slate-100' :
                              state === 'failed' ? 'bg-rose-500 border-rose-100' :
                                state === 'active' ? 'bg-white border-indigo-600' : 'bg-white border-slate-50'
                              }`}>
                            {state === 'completed' && <CheckCircle2 className="w-7 h-7 text-white" />}
                            {state === 'failed' && <XCircle className="w-7 h-7 text-white" />}
                            {state === 'active' && <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.5)]" />}
                          </motion.div>
                          <span className={`text-[11px] font-black tracking-widest uppercase text-center ${state === 'upcoming' ? 'text-slate-200' :
                            state === 'active' ? 'text-indigo-600' : 'text-slate-900'
                            }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
