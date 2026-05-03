
import React, { useState } from 'react';
import { UserRole, User } from '../types.ts';
import { ArrowLeft, User as UserIcon, Lock, Hash, Loader2, Phone, Mail } from 'lucide-react';
import { api } from '../services/api.ts';

interface Props {
  role: UserRole;
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

const AuthForm: React.FC<Props> = ({ role, onAuthSuccess, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    parentPhoneNumber: '',
    email: '', // Supabase requires an email for real auth
    password: ''
  });
  const [error, setError] = useState('');

  const isStudent = role === UserRole.STUDENT;
  const isAdvisor = role === UserRole.ADVISOR;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For this student project, we'll create a dummy email if only roll number is provided
      // e.g., 2021CS101@college.edu
      const authIdentifier = isStudent
        ? formData.rollNumber
        : isAdvisor
          ? formData.email
          : (role === UserRole.HOD ? 'hod' :
            role === UserRole.PRINCIPAL ? 'principal' :
              formData.email);

      if (isSignUp && isStudent) {
        // 1. Sign up the user via API
        const user = await api.auth.signup({
          username: authIdentifier,
          password: formData.password,
          role: UserRole.STUDENT,
          name: formData.name,
          rollNumber: formData.rollNumber,
          parentPhoneNumber: formData.parentPhoneNumber,
          email: formData.email
        } as any);

        if (user) {
          onAuthSuccess({
            id: user.id || 'temp-id',
            name: formData.name, // Backend User might not return name, use form data
            rollNumber: formData.rollNumber,
            role: UserRole.STUDENT
          });
        }
      } else if (isSignUp && isAdvisor) {
        // Advisor signup
        const user = await api.auth.advisorSignup(
          formData.name,
          formData.email,
          formData.password
        );

        if (user) {
          onAuthSuccess({
            id: user.id || 'temp-id',
            name: formData.name,
            role: UserRole.ADVISOR,
            email: formData.email
          });
        }
      } else {
        // Login Logic
        const user = await api.auth.login(authIdentifier, formData.password, isStudent ? formData.parentPhoneNumber : undefined);

        if (user) {
          onAuthSuccess({
            id: user.id,
            name: user.name || user.username,
            rollNumber: isStudent ? (user.registerNumber || user.username) : undefined,
            parentPhoneNumber: user.parentPhoneNumber,
            role: user.role as UserRole
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <button
        onClick={onBack}
        className="mb-8 flex items-center text-slate-600 hover:text-indigo-600 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Portal Selection
      </button>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {isStudent ? (isSignUp ? 'Student Sign Up' : 'Student Login') :
              isAdvisor ? (isSignUp ? 'Advisor Sign Up' : 'Advisor Login') :
                `${role} Login`}
          </h2>
          <p className="text-slate-500">
            {isSignUp ? `Create your ${isStudent ? 'student' : 'advisor'} account` : 'Enter your credentials to continue'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {isAdvisor && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="e.g. advisor@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {isStudent && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="email"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="e.g. student@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Parent's Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="tel"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="e.g. 9876543210"
                        value={formData.parentPhoneNumber}
                        onChange={e => setFormData({ ...formData, parentPhoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {isStudent && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. 21CS101"
                  value={formData.rollNumber}
                  onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                />
              </div>
            </div>
          )}

          {!isStudent && !isSignUp && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {isAdvisor ? 'Email Address' : 'Admin Email'}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder={isAdvisor ? "advisor@example.com" : "admin@college.edu"}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                required
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
            )}
          </button>
        </form>

        {(isStudent || isAdvisor) && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              {isSignUp ? 'Already have an account? Log In' : `New ${isStudent ? 'student' : 'advisor'}? Sign Up`}
            </button>
          </div>
        )}
      </div>
    </div >
  );
};

export default AuthForm;
