import { Brain } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950">
      {/* AI brain animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-glow-indigo animate-pulse-slow">
          <Brain size={36} className="text-white" />
        </div>
        {/* Orbit rings */}
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-spin-slow scale-125" />
        <div className="absolute inset-0 rounded-full border border-violet-500/10 animate-spin-slow scale-150" style={{ animationDirection: 'reverse' }} />
      </div>

      {/* Loading text */}
      <h2 className="text-xl font-bold text-white mb-2">{message}</h2>

      {/* Processing steps (shown during analysis) */}
      {message.includes('Analyz') && (
        <div className="mt-6 space-y-2 text-left max-w-xs w-full px-4">
          {[
            'Extracting PDF content...',
            'Building vector embeddings...',
            'Running AI agents...',
            'Generating insights...',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-400"
              style={{ animationDelay: `${i * 0.5}s` }}>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {step}
            </div>
          ))}
        </div>
      )}

      {/* Shimmer bar */}
      <div className="mt-8 w-48 h-1 rounded-full bg-dark-800 overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full shimmer" />
      </div>
    </div>
  );
}
