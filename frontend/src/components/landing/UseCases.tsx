import React, { useState } from 'react';

const scenarios = [
  {
    label: '01',
    title: 'FINE-GRAINED ABAC',
    tag: 'ALLOW',
    desc: 'Create granular permissions based on user attributes—such as department, job role, and environment—using Citadel\'s attribute-based policy matching.',
    code: { Effect: "Allow", Action: ["reports:Update"], Resource: ["*"] }
  },
  {
    label: '02',
    title: 'MULTI-TENANT ISOLATION',
    tag: 'ALLOW',
    desc: 'Securely partition workspace environments and assign dedicated developer access boundaries across multiple external client organizations.',
    code: { Effect: "Allow", Action: ["alerts:Acknowledge"], Resource: ["*"] }
  },
  {
    label: '03',
    title: 'PREVENTATIVE GUARDRAILS',
    tag: 'DENY',
    desc: 'Enforce service control policies and global permission boundaries. Explicit Deny statements override any Allow, preventing privilege escalation.',
    code: { Effect: "Deny", Action: ["iam:DeleteUserBoundary"], Resource: ["*"] }
  },
  {
    label: '04',
    title: 'COMPLIANCE AUDITING',
    tag: 'ALLOW',
    desc: 'Log every policy evaluation decision, token handshake, and administrative change to an immutable audit trail for security compliance.',
    code: { Effect: "Allow", Action: ["audit:List", "audit:Read"], Resource: ["*"] }
  }
];

// Render JSON with colored keys
const ColoredJSON = ({ data }: { data: Record<string, any> }) => {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return (
    <pre className="whitespace-pre-wrap leading-relaxed">
      {lines.map((line, i) => {
        // Match "key": value pattern
        const keyMatch = line.match(/^(\s*)"([^"]+)"(:.*)/);
        if (keyMatch) {
          return (
            <span key={i}>
              {keyMatch[1]}
              <span className="text-blue-600 dark:text-blue-400">"{keyMatch[2]}"</span>
              {keyMatch[3]}
              {'\n'}
            </span>
          );
        }
        return <span key={i}>{line}{'\n'}</span>;
      })}
    </pre>
  );
};

const UseCases: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  return (
    <section className="w-full relative px-6 lg:px-10 py-32 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-16 lg:gap-24 w-full">

        {/* Left: Big headline */}
        <div className="flex flex-col justify-between max-w-xl lg:max-w-2xl shrink-0 lg:sticky lg:top-32 h-fit">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/60 dark:text-white/60 mb-6 block">
              USE CASES
            </span>
            <h2
              className="font-extrabold uppercase tracking-[-0.03em] leading-[0.9] text-black dark:text-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}
            >
              ARCHITECTURAL<br />
              SCENARIOS.
            </h2>
          </div>

          <div className="mt-12 lg:mt-32">
            <div className="flex flex-wrap gap-3 mb-6">
              {['RBAC ↗', 'BOUNDARIES ↗', 'AUDIT ↗'].map((tag, idx) => (
                <div key={idx} className="px-3 py-1.5 border border-black/20 dark:border-white/20 text-[9px] font-mono tracking-[0.2em] text-black/70 dark:text-white/60 hover:border-black/40 dark:hover:border-white/40 cursor-pointer transition-colors">
                  {tag}
                </div>
              ))}
            </div>
            <p className="text-black/70 dark:text-white/70 text-[15px] md:text-[17px] leading-[1.5] font-medium font-sans max-w-md">
              Deploy Citadel access boundaries to isolate, govern, and audit developer operations at scale. Each scenario maps to a real policy evaluation in the engine.
            </p>
          </div>
        </div>

        {/* Right: Stacked scenario cards */}
        <div className="flex flex-col gap-2 w-full lg:w-[480px] shrink-0 self-start">
          {scenarios.map((scene, i) => {
            const isOpen = activeIdx === i;
            return (
              <div
                key={i}
                className={`border transition-all duration-200 ${
                  isOpen
                    ? 'bg-[#e4e4e4] dark:bg-[#161616] border-black/30 dark:border-white/[0.06]'
                    : 'bg-[#ebebeb] dark:bg-[#121212] border-black dark:border-white/[0.02]'
                }`}
              >
                <button
                  onClick={() => setActiveIdx(isOpen ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#e0e0e0] dark:hover:bg-[#1a1a1a] transition-colors group text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-black/30 dark:text-white/20 tracking-widest">{scene.label}</span>
                    <span className="text-[10px] font-mono tracking-[0.2em] text-black/80 dark:text-white/80 group-hover:text-black dark:group-hover:text-white uppercase">
                      {scene.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-mono tracking-[0.15em] px-2 py-0.5 ${
                      scene.tag === 'DENY'
                        ? 'text-red-700 dark:text-red-400 bg-red-500/10'
                        : 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                    }`}>
                      {scene.tag}
                    </span>
                    <span className="text-[10px] font-mono text-black/50 dark:text-white/30">
                      ( {isOpen ? '−' : '+'} )
                    </span>
                  </div>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen ? '400px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="px-5 pb-5">
                    <p className="text-[12px] text-black/55 dark:text-white/50 leading-relaxed font-sans mb-4 max-w-sm">
                      {scene.desc}
                    </p>

                    {/* Code block */}
                    <div className="w-full bg-[#f4f4f4] dark:bg-[#0a0a0a] border border-black/10 dark:border-white/[0.04] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] font-mono tracking-[0.2em] text-black/30 dark:text-white/25 uppercase">POLICY STATEMENT</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(JSON.stringify(scene.code, null, 2));
                          }}
                          className="text-[8px] font-mono tracking-[0.15em] text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors uppercase cursor-pointer"
                        >
                          COPY ↗
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-black/60 dark:text-white/55">
                        <ColoredJSON data={scene.code} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default UseCases;
