import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, StudentProfile } from '../types.ts';
import { api } from '../services/api.ts';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  BookOpen, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  user: User;
}

const StudentProfilePage: React.FC<Props> = ({ user }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<StudentProfile | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    try {
      const profileData = await api.students.getProfile(user.id);
      setProfile(profileData);
      setEditForm(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditForm(profile);
  };

  const handleSave = async () => {
    if (!editForm) return;
    
    try {
      const updatedProfile = await api.students.updateProfile(user.id, editForm);
      setProfile(updatedProfile);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm(profile);
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const pictureUrl = await api.students.uploadProfilePicture(user.id, file);
      // Update profile with new picture URL
      const updatedProfile = { ...profile!, profilePictureUrl: pictureUrl };
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Loading Profile...</h3>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Profile Not Found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center overflow-hidden">
                    {profile.profilePictureUrl ? (
                      <img 
                        src={`http://localhost:8080${profile.profilePictureUrl}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <button
                    onClick={handleProfilePictureClick}
                    disabled={uploadingPicture}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50"
                  >
                    {uploadingPicture ? (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">{profile.name}</h1>
                  <p className="text-white/80 font-medium mt-1">Student Profile</p>
                </div>
              </div>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-[3rem] shadow-sm border border-slate-200 p-8 mb-8"
        >
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Personal Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm?.name || ''}
                      onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-700">{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Register Number</label>
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-700">{profile.registerNumber}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Department</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm?.department || ''}
                      onChange={(e) => setEditForm({ ...editForm!, department: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-700">{profile.department}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Year</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm?.year || ''}
                      onChange={(e) => setEditForm({ ...editForm!, year: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-700">{profile.year}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={editForm?.email || ''}
                      onChange={(e) => setEditForm({ ...editForm!, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-700">{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Parent Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editForm?.parentPhoneNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm!, parentPhoneNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-700">{profile.parentPhoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
          </motion.div>
        </div>
      </div>
    );
  };

export default StudentProfilePage;
