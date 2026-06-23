import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import ScoreCard from '../components/ScoreCard';
import { SkillPieChart, SkillBarChart } from '../components/SkillChart';
import toast from 'react-hot-toast';
import {
  FileText, Shield, Target, Plus, Clock, ChevronRight,
  TrendingUp, Brain, BarChart2
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

function HistoryCard({ analysis }) {
  const score = analysis.resumeReview?.resumeScore || 0;
  const ats = analysis.atsAnalysis?.atsScore || 0;
  const match = analysis.skillGap?.matchPercentage || 0;
  const statusColor = analysis.status === 'completed' ? 'text-emerald-400' : analysis.status === 'failed' ? 'text-red-400' : 'text-yellow-400';

  return (
    <RouterLink
      to={analysis.status === 'completed' ? `/results/${analysis._id}` : '#'}
      className="glass-card-hover p-4 flex items-center gap-4 group"
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
        <FileText size={18} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{analysis.targetRole}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-slate-500">
            {new Date(analysis.createdAt).toLocaleDateString()}
          </span>
          <span className={`text-xs font-medium capitalize ${statusColor}`}>
            {analysis.status}
          </span>
        </div>
      </div>
      {analysis.status === 'completed' && (
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold">{score}</span>
          <span className="text-cyan-400 font-semibold">{ats}</span>
          <span className="text-violet-400 font-semibold">{match}%</span>
        </div>
      )}
      <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
    </RouterLink>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/analysis/history');
        setHistory(data.data || []);

        // Get the latest completed analysis for the dashboard view
        const latest = data.data?.find((a) => a.status === 'completed');
        if (latest) {
          const { data: full } = await api.get(`/analysis/${latest._id}`);
          setLatestAnalysis(full.data);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scoreCards = latestAnalysis ? [
    {
      title: 'Resume Score',
      score: latestAnalysis.resumeReview?.resumeScore || 0,
      icon: FileText,
      subtitle: `${(latestAnalysis.resumeReview?.strengths || []).length} strengths found`,
    },
    {
      title: 'ATS Score',
      score: latestAnalysis.atsAnalysis?.atsScore || 0,
      icon: Shield,
      subtitle: `${(latestAnalysis.atsAnalysis?.keywordsFound || []).length} keywords matched`,
    },
    {
      title: 'Job Match',
      score: latestAnalysis.skillGap?.matchPercentage || 0,
      icon: Target,
      subtitle: `${(latestAnalysis.skillGap?.missingSkills || []).length} missing skills`,
    },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {history.length > 0
                ? `${history.length} analysis${history.length > 1 ? 'es' : ''} completed`
                : 'Upload your first resume to get started'}
            </p>
          </div>
          <Link to="/upload" className="btn-primary self-start">
            <Plus size={16} />
            New Analysis
          </Link>
        </div>

        {latestAnalysis ? (
          <>
            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
              {scoreCards.map((card) => (
                <div key={card.title} className="animate-fade-in-up opacity-0">
                  <ScoreCard {...card} />
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <SkillPieChart
                matchedSkills={latestAnalysis.skillGap?.matchedSkills || []}
                missingSkills={latestAnalysis.skillGap?.missingSkills || []}
              />
              <SkillBarChart missingSkills={latestAnalysis.skillGap?.missingSkills || []} />
            </div>

            {/* Quick Stats Row */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {/* Strengths */}
              <div className="glass-card p-4">
                <h3 className="section-title mb-3 text-sm">
                  <span className="text-emerald-400">✓</span> Top Strengths
                </h3>
                <ul className="space-y-1.5">
                  {(latestAnalysis.resumeReview?.strengths || []).slice(0, 4).map((s, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Matched Skills */}
              <div className="glass-card p-4">
                <h3 className="section-title mb-3 text-sm">
                  <span className="text-cyan-400">◈</span> Matched Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(latestAnalysis.skillGap?.matchedSkills || []).slice(0, 8).map((skill) => (
                    <span key={skill} className="skill-badge-green">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="glass-card p-4">
                <h3 className="section-title mb-3 text-sm">
                  <span className="text-rose-400">◈</span> Missing Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(latestAnalysis.skillGap?.missingSkills || []).slice(0, 8).map((skill) => (
                    <span key={skill} className="skill-badge-red">{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* View Full Results CTA */}
            <div className="glass-card p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <BarChart2 size={18} className="text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Full Analysis Available</p>
                  <p className="text-slate-500 text-xs">Interview questions, roadmap, resume rewrite & more</p>
                </div>
              </div>
              <Link to={`/results/${latestAnalysis._id}`} className="btn-primary text-xs px-4 py-2">
                View All Results
                <ChevronRight size={14} />
              </Link>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="glass-card p-12 text-center mb-6 animate-scale-in">
            <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
              <Brain size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Ready to Analyze Your Resume?</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Upload your resume and job description to get AI-powered insights, scores, and a personalized career roadmap.
            </p>
            <Link to="/upload" className="btn-primary mx-auto">
              <Plus size={16} />
              Upload Resume
            </Link>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="section-title mb-4">
              <Clock size={16} className="text-slate-500" />
              Analysis History
            </h2>
            <div className="space-y-2">
              {history.map((analysis) => (
                <HistoryCard key={analysis._id} analysis={analysis} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
