import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import {
  User, Mail, Brain, BarChart2, Calendar, Edit3, Save, X,
  FileText, Shield, Target, Award, TrendingUp,
} from 'lucide-react';

const TARGET_ROLES = [
  'MERN Stack Developer',
  'Frontend Developer (React)',
  'Backend Developer (Node.js)',
  'Full Stack Developer',
  'Java Developer',
  'Python Developer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'DevOps Engineer',
  'Cloud Engineer (AWS)',
  'Android Developer',
  'iOS Developer',
  'UI/UX Designer',
  'Software Engineer (General)',
];

function StatCard({ icon: Icon, label, value, color = 'text-indigo-400', bg = 'bg-indigo-500/10' }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    targetRole: user?.targetRole || 'MERN Stack Developer',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser({ name: data.user.name, targetRole: data.user.targetRole });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', targetRole: user?.targetRole || 'MERN Stack Developer' });
    setEditing(false);
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
            <User size={36} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {user?.name || 'Your Profile'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
          <div className="animate-fade-in-up opacity-0">
            <StatCard
              icon={BarChart2}
              label="Total Analyses"
              value={user?.analysisCount || 0}
              color="text-indigo-400"
              bg="bg-indigo-500/10"
            />
          </div>
          <div className="animate-fade-in-up opacity-0">
            <StatCard
              icon={Brain}
              label="AI Agents Used"
              value={`${(user?.analysisCount || 0) * 7}`}
              color="text-violet-400"
              bg="bg-violet-500/10"
            />
          </div>
          <div className="animate-fade-in-up opacity-0">
            <StatCard
              icon={Calendar}
              label="Member Since"
              value={new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              color="text-cyan-400"
              bg="bg-cyan-500/10"
            />
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 animate-fade-in-up mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Edit3 size={18} className="text-indigo-400" />
              Profile Details
            </h2>
            {!editing ? (
              <button
                id="edit-profile-btn"
                onClick={() => setEditing(true)}
                className="btn-ghost text-xs"
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  id="cancel-edit-btn"
                  onClick={handleCancel}
                  className="btn-ghost text-xs text-slate-400"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  id="save-profile-btn"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary text-xs px-4 py-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User size={12} /> Full Name
              </label>
              {editing ? (
                <input
                  id="profile-name-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Your full name"
                />
              ) : (
                <p className="text-white font-medium bg-white/5 px-4 py-3 rounded-xl border border-white/8">
                  {user?.name || '—'}
                </p>
              )}
            </div>

            {/* Email (non-editable) */}
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Mail size={12} /> Email Address
              </label>
              <p className="text-slate-400 font-medium bg-white/3 px-4 py-3 rounded-xl border border-white/5 flex items-center gap-2">
                {user?.email || '—'}
                <span className="text-xs text-slate-600 ml-auto">Cannot be changed</span>
              </p>
            </div>

            {/* Target Role */}
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Target size={12} /> Target Role
              </label>
              {editing ? (
                <select
                  id="profile-role-select"
                  value={form.targetRole}
                  onChange={(e) => setForm((prev) => ({ ...prev, targetRole: e.target.value }))}
                  className="input-field"
                >
                  {TARGET_ROLES.map((role) => (
                    <option key={role} value={role} className="bg-slate-900 text-white">
                      {role}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-white font-medium bg-white/5 px-4 py-3 rounded-xl border border-white/8">
                  {user?.targetRole || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="glass-card p-6 animate-fade-in-up">
          <h2 className="font-bold text-white text-lg flex items-center gap-2 mb-4">
            <Award size={18} className="text-yellow-400" />
            Achievements
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                label: 'First Analysis',
                desc: 'Completed your first AI resume analysis',
                unlocked: (user?.analysisCount || 0) >= 1,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                icon: FileText,
              },
              {
                label: 'AI Power User',
                desc: 'Ran 5+ analyses to optimize your resume',
                unlocked: (user?.analysisCount || 0) >= 5,
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
                icon: Brain,
              },
              {
                label: 'ATS Expert',
                desc: 'Used ATS analysis to improve your resume',
                unlocked: (user?.analysisCount || 0) >= 1,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
                icon: Shield,
              },
              {
                label: 'Career Planner',
                desc: 'Generated a 3-month learning roadmap',
                unlocked: (user?.analysisCount || 0) >= 1,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
                icon: TrendingUp,
              },
            ].map(({ label, desc, unlocked, color, bg, icon: Icon }) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                  unlocked
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/2 border-white/5 opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${unlocked ? bg : 'bg-white/5'} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={unlocked ? color : 'text-slate-600'} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-slate-600'}`}>
                    {label} {unlocked ? '✓' : '🔒'}
                  </p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
