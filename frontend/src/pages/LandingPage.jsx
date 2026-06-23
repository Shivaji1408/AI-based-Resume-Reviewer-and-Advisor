import { Link } from 'react-router-dom';
import { Brain, FileText, Target, Zap, TrendingUp, Users, Shield, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: FileText, title: 'Resume Score', desc: 'Get an AI-powered score analyzing quality, formatting, and impact of your resume.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: Shield, title: 'ATS Analysis', desc: 'Simulate how Applicant Tracking Systems parse your resume with keyword matching.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Target, title: 'Skill Gap Analysis', desc: 'Compare your skills vs job requirements and discover exactly what you\'re missing.', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: TrendingUp, title: '3-Month Roadmap', desc: 'Personalized learning roadmap tailored to your target role and skill gaps.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Users, title: 'Interview Prep', desc: 'AI-generated Easy, Medium, and Hard interview questions based on your profile.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Zap, title: 'Resume Rewriter', desc: 'Get an AI-rewritten resume tailored specifically for your target role.', color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const stats = [
  { value: '7', label: 'AI Agents' },
  { value: '98%', label: 'Accuracy' },
  { value: '<2min', label: 'Analysis Time' },
  { value: 'RAG', label: 'Powered' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-fade-in-up">
            <Sparkles size={12} />
            Powered by Groq Llama + RAG Technology
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Land Your Dream Job With{' '}
            <span className="gradient-text">AI-Powered</span>{' '}
            Career Intelligence
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Upload your resume and job description. Our 7 AI agents analyze skill gaps,
            score your ATS compatibility, and create a personalized roadmap to get you hired.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link to="/upload" className="btn-primary text-base px-8 py-4">
                <Brain size={18} />
                Start Analysis
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-4">
                  <Brain size={18} />
                  Get Started Free
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {['Resume Score', 'ATS Check', 'Skill Gap', 'Roadmap', 'Interview Prep'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-slate-500 text-xs">
                <CheckCircle size={12} className="text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="relative max-w-3xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card p-6 gradient-border">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Resume Score', value: '87', color: 'text-emerald-400' },
                { label: 'ATS Score', value: '81', color: 'text-cyan-400' },
                { label: 'Job Match', value: '72%', color: 'text-violet-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-slate-500 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full animate-pulse-slow" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-slate-400 text-xs">AI agents processing your profile...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/8 bg-white/2">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-extrabold gradient-text mb-1">{value}</div>
                <div className="text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Everything You Need to <span className="gradient-text">Get Hired</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              7 specialized AI agents work together to give you a complete career advantage
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div key={title} className="glass-card-hover p-5 animate-fade-in-up" style={{ opacity: 0 }}>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-white/8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-slate-400 mb-12">From upload to insights in under 2 minutes</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Upload PDFs', desc: 'Upload your resume and the job description PDF' },
              { step: '02', title: 'AI Analyzes', desc: '7 AI agents analyze your documents using RAG technology' },
              { step: '03', title: 'Get Insights', desc: 'Receive detailed scores, gaps, roadmap, and interview prep' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card p-6 text-center">
                <div className="text-4xl font-extrabold gradient-text mb-3">{step}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link to={user ? '/upload' : '/register'} className="btn-primary text-base px-10 py-4">
              <Brain size={18} />
              {user ? 'Analyze My Resume' : 'Start For Free'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-4 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={14} className="text-indigo-400" />
          <span className="text-white font-semibold">AI Resume & Career Advisor</span>
        </div>
        <p>Powered by Groq Llama • LangChain RAG • FAISS Vector Store</p>
      </footer>
    </div>
  );
}
