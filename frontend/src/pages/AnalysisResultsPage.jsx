import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import ScoreCard from '../components/ScoreCard';
import { SkillPieChart, SkillBarChart } from '../components/SkillChart';
import LoadingScreen from '../components/LoadingScreen';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
  FileText, Shield, Target, TrendingUp, Users, Zap, BookOpen,
  ChevronLeft, CheckCircle, XCircle, AlertCircle, Lightbulb,
  Calendar, Code, MessageSquare, Edit3, Star, ArrowRight,
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'review', label: 'Resume Review', icon: FileText },
  { id: 'ats', label: 'ATS Analysis', icon: Shield },
  { id: 'skills', label: 'Skill Gap', icon: Code },
  { id: 'roadmap', label: 'Roadmap', icon: Calendar },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'rewrite', label: 'Resume Rewrite', icon: Edit3 },
  { id: 'resources', label: 'Learning', icon: BookOpen },
];

function TabContent({ activeTab, data }) {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab data={data} />;
    case 'review':
      return <ResumeReviewTab data={data.resumeReview} />;
    case 'ats':
      return <AtsTab data={data.atsAnalysis} />;
    case 'skills':
      return <SkillGapTab data={data.skillGap} />;
    case 'roadmap':
      return <RoadmapTab data={data.careerRoadmap} />;
    case 'interview':
      return <InterviewTab data={data.interviewQuestions} />;
    case 'rewrite':
      return <RewriteTab data={data.rewrittenResume} />;
    case 'resources':
      return <LearningTab data={data.learningResources} />;
    default:
      return null;
  }
}

// ── Overview Tab ──────────────────────────────────────────────
function OverviewTab({ data }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScoreCard title="Resume Score" score={data.resumeReview?.resumeScore || 0} icon={FileText} subtitle="Overall quality" />
        <ScoreCard title="ATS Score" score={data.atsAnalysis?.atsScore || 0} icon={Shield} subtitle="ATS compatibility" />
        <ScoreCard title="Job Match" score={data.skillGap?.matchPercentage || 0} icon={Target} subtitle="Skill alignment" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <SkillPieChart matchedSkills={data.skillGap?.matchedSkills} missingSkills={data.skillGap?.missingSkills} />
        <SkillBarChart missingSkills={data.skillGap?.missingSkills} />
      </div>
      <div className="glass-card p-5">
        <h3 className="section-title mb-3"><CheckCircle size={16} className="text-emerald-400" /> Key Strengths</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {(data.resumeReview?.strengths || []).map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-emerald-500 mt-0.5 text-xs">✓</span> {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Resume Review Tab ─────────────────────────────────────────
function ResumeReviewTab({ data }) {
  if (!data) return <EmptyState />;
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Score */}
      <div className="flex items-center gap-4 glass-card p-4">
        <div className="text-5xl font-extrabold gradient-text">{data.resumeScore}</div>
        <div>
          <p className="text-white font-semibold">Resume Quality Score</p>
          <p className="text-slate-500 text-sm">Out of 100 points</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
            <CheckCircle size={14} /> Strengths
          </h3>
          <ul className="space-y-2">
            {(data.strengths || []).map((s, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
            <XCircle size={14} /> Weaknesses
          </h3>
          <ul className="space-y-2">
            {(data.weaknesses || []).map((w, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-rose-500 mt-0.5">•</span> {w}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
            <Lightbulb size={14} /> Improvements
          </h3>
          <ul className="space-y-2">
            {(data.improvements || []).map((imp, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-indigo-500 mt-0.5">→</span> {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── ATS Tab ───────────────────────────────────────────────────
function AtsTab({ data }) {
  if (!data) return <EmptyState />;
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4 glass-card p-4">
        <div className="text-5xl font-extrabold text-cyan-400">{data.atsScore}</div>
        <div>
          <p className="text-white font-semibold">ATS Compatibility Score</p>
          <p className="text-slate-500 text-sm">Simulated ATS parsing result</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-emerald-400 mb-3">✓ Keywords Found</h3>
          <div className="flex flex-wrap gap-1.5">
            {(data.keywordsFound || []).map((k) => <span key={k} className="skill-badge-green">{k}</span>)}
          </div>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-rose-400 mb-3">✗ Keywords Missing</h3>
          <div className="flex flex-wrap gap-1.5">
            {(data.keywordsMissing || []).map((k) => <span key={k} className="skill-badge-red">{k}</span>)}
          </div>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-1.5"><AlertCircle size={13} /> Issues</h3>
          <ul className="space-y-2">
            {(data.issues || []).map((issue, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-rose-400 mt-0.5">!</span> {issue}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-1.5"><Lightbulb size={13} /> Recommendations</h3>
          <ul className="space-y-2">
            {(data.recommendations || []).map((rec, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">→</span> {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Skill Gap Tab ─────────────────────────────────────────────
function SkillGapTab({ data }) {
  if (!data) return <EmptyState />;
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="text-5xl font-extrabold text-violet-400">{data.matchPercentage}%</div>
        <div>
          <p className="text-white font-semibold">Skill Match Rate</p>
          <p className="text-slate-500 text-sm">{data.matchedSkills?.length || 0} matched · {data.missingSkills?.length || 0} missing</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <SkillPieChart matchedSkills={data.matchedSkills} missingSkills={data.missingSkills} />
        <SkillBarChart missingSkills={data.missingSkills} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-emerald-400 mb-3">Matched Skills ({data.matchedSkills?.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {(data.matchedSkills || []).map((s) => <span key={s} className="skill-badge-green">{s}</span>)}
          </div>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm font-bold text-rose-400 mb-3">Missing Skills ({data.missingSkills?.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {(data.missingSkills || []).map((s) => <span key={s} className="skill-badge-red">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Roadmap Tab ────────────────────────────────────────────────
function RoadmapTab({ data }) {
  if (!data) return <EmptyState />;
  const months = [
    { key: 'month1', label: 'Month 1', color: 'indigo', data: data.month1 },
    { key: 'month2', label: 'Month 2', color: 'violet', data: data.month2 },
    { key: 'month3', label: 'Month 3', color: 'cyan', data: data.month3 },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {months.map(({ key, label, color, data: month }) => (
        <div key={key} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
              <Calendar size={18} className={`text-${color}-400`} />
            </div>
            <div>
              <h3 className="font-bold text-white">{label}</h3>
              <p className={`text-${color}-400 text-sm`}>{month?.focus}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Topics</p>
              <ul className="space-y-1">
                {(month?.topics || []).map((t, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span className={`text-${color}-400`}>▸</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Tasks</p>
              <ul className="space-y-1">
                {(month?.tasks || []).map((t, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <CheckCircle size={10} className="text-emerald-500 flex-shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Resources</p>
              <ul className="space-y-1">
                {(month?.resources || []).map((r, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <BookOpen size={10} className="text-violet-400 flex-shrink-0" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Interview Tab ─────────────────────────────────────────────
function InterviewTab({ data }) {
  const [activeLevel, setActiveLevel] = useState('easy');
  if (!data) return <EmptyState />;

  const levels = [
    { id: 'easy', label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'hard', label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  const categoryColor = (cat) => ({
    Technical: 'skill-badge-indigo',
    HR: 'skill-badge-green',
    Project: 'text-violet-400 bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 rounded-lg text-xs font-medium',
  })[cat] || 'skill-badge-indigo';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Level tabs */}
      <div className="flex gap-2">
        {levels.map(({ id, label, color, bg }) => (
          <button
            key={id}
            onClick={() => setActiveLevel(id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              activeLevel === id ? `${bg} ${color}` : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            )}
          >
            {label} ({(data[id] || []).length})
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {(data[activeLevel] || []).map((q, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-white flex-1">{i + 1}. {q.question}</p>
              <span className={categoryColor(q.category)}>{q.category}</span>
            </div>
            {q.hint && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                <Lightbulb size={11} className="text-yellow-500" />
                Hint: {q.hint}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rewrite Tab ────────────────────────────────────────────────
function RewriteTab({ data }) {
  if (!data) return <EmptyState />;
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Professional Summary */}
      {data.professionalSummary && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-3"><Star size={16} className="text-yellow-400" /> Improved Professional Summary</h3>
          <p className="text-slate-300 text-sm leading-relaxed bg-white/3 p-4 rounded-xl border border-white/8 font-mono">
            {data.professionalSummary}
          </p>
        </div>
      )}

      {/* Projects */}
      {(data.improvedProjects || []).length > 0 && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-3"><Edit3 size={16} className="text-indigo-400" /> Improved Project Descriptions</h3>
          <div className="space-y-3">
            {data.improvedProjects.map((proj, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/8">
                <span className="text-indigo-400 text-xs font-mono mt-0.5">{String(i + 1).padStart(2, '0')}.</span>
                <p className="text-slate-300 text-sm">{proj}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {data.improvedSkillsSection && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-3"><Code size={16} className="text-cyan-400" /> Improved Skills Section</h3>
          <p className="text-slate-300 text-sm font-mono bg-white/3 p-4 rounded-xl border border-white/8">
            {data.improvedSkillsSection}
          </p>
        </div>
      )}

      {/* Additional Tips */}
      {(data.additionalTips || []).length > 0 && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-3"><Lightbulb size={16} className="text-yellow-400" /> Additional Tips</h3>
          <ul className="space-y-2">
            {data.additionalTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <ArrowRight size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" /> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Learning Resources Tab ─────────────────────────────────────
function LearningTab({ data }) {
  if (!data || data.length === 0) return <EmptyState />;
  return (
    <div className="space-y-4 animate-fade-in">
      {data.map((item, i) => (
        <div key={i} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <BookOpen size={16} className="text-violet-400" />
            </div>
            <h3 className="font-bold text-white">{item.skill}</h3>
          </div>

          {item.whatToLearn && (
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{item.whatToLearn}</p>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Learning Order</p>
              <ol className="space-y-1">
                {(item.learningOrder || []).map((step, j) => (
                  <li key={j} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-violet-400 font-mono">{j + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Resources</p>
              <ul className="space-y-1">
                {(item.beginnerResources || []).map((r, j) => (
                  <li key={j} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-cyan-400">🔗</span> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Mini Projects</p>
              <ul className="space-y-1">
                {(item.miniProjects || []).map((proj, j) => (
                  <li key={j} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-emerald-400">⚡</span> {proj}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-card p-10 text-center">
      <p className="text-slate-500">No data available for this section.</p>
    </div>
  );
}

// ── Main Results Page ──────────────────────────────────────────
export default function AnalysisResultsPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data } = await api.get(`/analysis/${id}`);
        if (data.status === 'completed') {
          setAnalysis(data.data);
        } else if (data.status === 'failed') {
          toast.error(`Analysis failed: ${data.error}`);
        } else {
          toast.error('Analysis is still processing. Please wait.');
        }
      } catch {
        toast.error('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <LoadingScreen message="Loading analysis results..." />;
  if (!analysis) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400 mb-4">Analysis not available.</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in-up">
          <Link to="/dashboard" className="btn-ghost">
            <ChevronLeft size={16} />
            Dashboard
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              Analysis: <span className="gradient-text">{analysis.targetRole}</span>
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {new Date(analysis.createdAt).toLocaleString()} ·{' '}
              {analysis.processingTime}s processing time
            </p>
          </div>
          <Link to="/upload" className="btn-primary text-xs px-4 py-2">
            New Analysis
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0',
                activeTab === id
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div key={activeTab} className="animate-fade-in">
          <TabContent activeTab={activeTab} data={analysis} />
        </div>
      </div>
    </div>
  );
}
