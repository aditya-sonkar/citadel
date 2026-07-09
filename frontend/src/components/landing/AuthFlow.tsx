import React, { useState, useEffect, useRef } from 'react';
import CornerMarkers from './CornerMarkers';

interface EvalStep {
  label: string;
  desc: string;
}

const EVAL_STEPS: EvalStep[] = [
  { label: 'Request Received', desc: 'Incoming authorization request with user, action, and resource' },
  { label: 'User Policies', desc: 'Evaluate directly attached UserPolicyAttachment statements' },
  { label: 'Group Policies', desc: 'Evaluate inherited GroupPolicyAttachment from UserGroupMembership' },
  { label: 'Boundary Check', desc: 'Apply UserBoundary ceiling — caps maximum allowed permissions' },
  { label: 'Deny Precedence', desc: 'Explicit Deny overrides any Allow from user or group policies' },
  { label: 'Final Decision', desc: 'Typed outcome logged to immutable AuditLog with full metadata' },
];

const REQUEST_EXAMPLE = {
  user: "alice",
  action: "reports:read",
  resource: "report/quarterly-2026",
  sourceIp: "10.0.1.42"
};

const RESPONSE_EXAMPLE = {
  decision: "ALLOW_MATCH",
  effect: "Allow",
  matchedPolicy: "AnalystReadAccess",
  evaluationTimeMs: 0.04,
  auditLogId: "aud_7f3a9b2e"
};

const AuthFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveStep(0);

    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step >= EVAL_STEPS.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsAnimating(false);
        return;
      }
      setActiveStep(step);
    }, 700);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section id="auth-flow" aria-label="Authorization Flow" className="w-full bg-black py-[100px] md:py-[140px] transition-colors duration-300">
      <div className="mx-auto max-w-[1512px] px-6 md:px-[120px] flex flex-col gap-12">
        
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">03 • EVALUATION PIPELINE</span>
            <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight text-white mt-2 leading-tight">
              Authorization Evaluation Flow
            </h2>
          </div>
          <div className="flex flex-col gap-4 justify-center">
            <p className="text-zinc-400 text-sm md:text-base font-semibold leading-relaxed max-w-sm">
              Every request passes through a multi-stage pipeline. Deny always wins.
            </p>
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className={`w-fit inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
                isAnimating 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-[#DE4E1A] text-white hover:bg-[#c4441a] cursor-pointer'
              }`}
            >
              <span className={`inline-block transition-transform ${isAnimating ? 'animate-spin' : ''}`}>▶</span>
              {isAnimating ? 'Evaluating...' : 'Run Evaluation'}
            </button>
          </div>
        </div>

        {/* Flow content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Pipeline Steps */}
          <div className="lg:col-span-5 relative border border-dashed border-zinc-800 rounded-2xl p-6 md:p-8 bg-black/20">
            <CornerMarkers />
            <div className="flex flex-col gap-0">
              {EVAL_STEPS.map((step, idx) => {
                const isActive = idx <= activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <div key={idx} className="flex gap-4 items-start relative">
                    {/* Vertical connector line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div 
                        className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-[#DE4E1A] border-[#DE4E1A] shadow-[0_0_12px_rgba(222,78,26,0.4)]' 
                            : isActive 
                              ? 'bg-[#00c582] border-[#00c582]' 
                              : 'bg-zinc-900 border-zinc-700'
                        }`} 
                      />
                      {idx < EVAL_STEPS.length - 1 && (
                        <div className={`w-[2px] h-12 transition-colors duration-300 ${
                          idx < activeStep ? 'bg-[#00c582]/40' : 'bg-zinc-800'
                        }`} />
                      )}
                    </div>
                    
                    {/* Step content */}
                    <div className={`pb-6 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-wider">STEP {idx + 1}</span>
                        {isCurrent && isAnimating && (
                          <span className="text-[8px] font-mono font-bold text-[#DE4E1A] bg-[#DE4E1A]/10 border border-[#DE4E1A]/20 px-1.5 py-0.5 rounded-full animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{step.label}</h4>
                      <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Request / Response JSON */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Request Card */}
            <div className="relative border border-dashed border-zinc-800 rounded-2xl p-6 bg-black/20">
              <CornerMarkers />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-widest uppercase">REQUEST</span>
                <span className="text-[9px] font-mono font-bold text-[#00c582] bg-[#00c582]/5 border border-[#00c582]/15 px-2 py-0.5 rounded-full">
                  POST /v1/authorize
                </span>
              </div>
              <pre className="bg-zinc-950/60 border border-zinc-850 rounded-lg p-4 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto">
                <code>{JSON.stringify(REQUEST_EXAMPLE, null, 2)}</code>
              </pre>
            </div>

            {/* Response Card */}
            <div className={`relative border border-dashed rounded-2xl p-6 transition-all duration-500 ${
              activeStep >= EVAL_STEPS.length - 1 
                ? 'border-[#00c582]/30 bg-[#00c582]/5' 
                : 'border-zinc-800 bg-black/20'
            }`}>
              <CornerMarkers />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-widest uppercase">RESPONSE</span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all duration-500 ${
                  activeStep >= EVAL_STEPS.length - 1
                    ? 'text-[#00c582] bg-[#00c582]/5 border-[#00c582]/15'
                    : 'text-zinc-600 bg-zinc-900 border-zinc-800'
                }`}>
                  {activeStep >= EVAL_STEPS.length - 1 ? '200 OK' : 'PENDING'}
                </span>
              </div>
              <pre className={`bg-zinc-950/60 border border-zinc-850 rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto transition-opacity duration-500 ${
                activeStep >= EVAL_STEPS.length - 1 ? 'text-zinc-300' : 'text-zinc-600'
              }`}>
                <code>
                  {activeStep >= EVAL_STEPS.length - 1 
                    ? JSON.stringify(RESPONSE_EXAMPLE, null, 2) 
                    : '{\n  "decision": "...",\n  "effect": "...",\n  "evaluationTimeMs": "..."\n}'
                  }
                </code>
              </pre>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AuthFlow;
