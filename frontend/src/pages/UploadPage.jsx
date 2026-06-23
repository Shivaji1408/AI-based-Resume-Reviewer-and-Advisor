import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Upload, FileText, Briefcase, Brain, ArrowRight, CheckCircle, X, Sparkles } from 'lucide-react';
import clsx from 'clsx';

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

function DropZone({ label, icon: Icon, file, onDrop, fieldName, accept = { 'application/pdf': ['.pdf'] } }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDropRejected: () => toast.error('Only PDF files up to 5MB are allowed'),
  });

  return (
    <div
      {...getRootProps()}
      id={`dropzone-${fieldName}`}
      className={clsx(
        'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300',
        isDragActive
          ? 'border-indigo-500 bg-indigo-500/10 scale-105'
          : file
          ? 'border-emerald-500/50 bg-emerald-500/5'
          : 'border-white/15 bg-white/3 hover:border-indigo-500/50 hover:bg-white/5'
      )}
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="flex flex-col items-center gap-2">
          <CheckCircle size={36} className="text-emerald-400" />
          <p className="font-semibold text-emerald-400 text-sm">{file.name}</p>
          <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Icon size={26} className="text-indigo-400" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{label}</p>
            <p className="text-slate-500 text-xs mt-1">
              {isDragActive ? 'Drop it here!' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-slate-600 text-xs mt-0.5">PDF only • Max 5MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UploadPage() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [targetRole, setTargetRole] = useState('MERN Stack Developer');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleResumeDrop = useCallback((files) => {
    if (files[0]) setResumeFile(files[0]);
  }, []);

  const handleJdDrop = useCallback((files) => {
    if (files[0]) setJdFile(files[0]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jdFile) {
      toast.error('Please upload both Resume and Job Description PDFs');
      return;
    }

    try {
      // Step 1: Upload files
      setUploading(true);
      toast.loading('Uploading files...', { id: 'upload' });

      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jdFile);

      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Files uploaded!', { id: 'upload' });
      setUploading(false);

      const { resume, jobDescription } = uploadRes.data.files;

      // Step 2: Start analysis
      setAnalyzing(true);
      toast.loading('AI agents are analyzing your documents...', { id: 'analyze' });

      const analysisRes = await api.post('/analysis/run', {
        resumeFilename: resume.filename,
        jdFilename: jobDescription.filename,
        targetRole,
      });

      const { analysisId } = analysisRes.data;
      toast.success('Analysis started!', { id: 'analyze' });

      // Step 3: Poll for completion
      toast.loading('Processing with AI (this takes ~60-90 seconds)...', { id: 'poll' });
      
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max
      
      const poll = async () => {
        if (attempts >= maxAttempts) {
          toast.error('Analysis timed out. Please try again.', { id: 'poll' });
          setAnalyzing(false);
          return;
        }
        attempts++;

        const statusRes = await api.get(`/analysis/status/${analysisId}`);
        const { status } = statusRes.data;

        if (status === 'completed') {
          toast.success('Analysis complete! 🎉', { id: 'poll' });
          navigate(`/results/${analysisId}`);
        } else if (status === 'failed') {
          toast.error(`Analysis failed: ${statusRes.data.errorMessage}`, { id: 'poll' });
          setAnalyzing(false);
        } else {
          setTimeout(poll, 3000); // Poll every 3 seconds
        }
      };

      poll();
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.error || 'Something went wrong. Please try again.');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const isLoading = uploading || analyzing;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-4">
            <Sparkles size={12} />
            7 AI Agents Ready
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Upload Your Documents</h1>
          <p className="text-slate-400 text-sm">
            Upload your resume and the job description, then let our AI do the magic.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Resume Drop */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">
              <FileText size={14} className="inline mr-1.5 text-indigo-400" />
              Your Resume
            </label>
            <DropZone
              label="Upload Resume PDF"
              icon={FileText}
              file={resumeFile}
              onDrop={handleResumeDrop}
              fieldName="resume"
            />
          </div>

          {/* JD Drop */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">
              <Briefcase size={14} className="inline mr-1.5 text-violet-400" />
              Job Description
            </label>
            <DropZone
              label="Upload Job Description PDF"
              icon={Briefcase}
              file={jdFile}
              onDrop={handleJdDrop}
              fieldName="jd"
            />
          </div>

          {/* Target Role */}
          <div>
            <label className="text-slate-300 text-sm font-semibold block mb-2">
              <Brain size={14} className="inline mr-1.5 text-cyan-400" />
              Target Role
            </label>
            <select
              id="target-role-select"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="input-field"
              disabled={isLoading}
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role} className="bg-dark-900 text-white">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="analyze-btn"
            disabled={isLoading || !resumeFile || !jdFile}
            className="btn-primary w-full py-4 text-base mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {uploading ? 'Uploading files...' : 'AI agents processing...'}
              </>
            ) : (
              <>
                <Brain size={18} />
                Analyze My Resume
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Processing info */}
          {analyzing && (
            <div className="glass-card p-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-white">AI Agents Working...</span>
              </div>
              <div className="space-y-1.5">
                {[
                  'Building RAG vector store from PDFs...',
                  'Resume Reviewer Agent analyzing quality...',
                  'Skill Gap Analyzer comparing requirements...',
                  'ATS Score Agent checking compatibility...',
                  'Career Advisor generating roadmap...',
                  'Interview Coach preparing questions...',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1 h-1 bg-indigo-500/60 rounded-full" />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
