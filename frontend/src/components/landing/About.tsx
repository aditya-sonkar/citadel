import React from 'react';
import CornerMarkers from './CornerMarkers';

interface AboutProps {
  scrollProgress: number;
}

const About: React.FC<AboutProps> = ({ scrollProgress }) => {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Quote Section */}
      <section id="quote" aria-label="Quote" className="relative w-full bg-white dark:bg-black py-[80px] md:py-[100px] transition-colors duration-300">
        <div className="mx-auto grid w-full max-w-[1512px] grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-[120px]">
          
          {/* Quote Graphic block — Decision Types Card */}
          <div className="p-4 flex justify-center lg:justify-start">
            <div className="relative block aspect-[525/292] w-full max-w-[525px] overflow-hidden bg-black rounded-lg shadow-sm border border-zinc-700 flex flex-col justify-between p-6">
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 font-bold">
                <span>EVALUATION: RUNNING</span>
                <span>ID: CT-8849</span>
              </div>
              
              <div className="my-auto text-left pl-6 border-l border-[#DE4E1A]/40 flex flex-col gap-2.5">
                <span className="text-[#DE4E1A] font-mono text-[9px] font-extrabold tracking-widest uppercase bg-[#DE4E1A]/5 border border-[#DE4E1A]/15 px-2.5 py-0.5 rounded-full w-fit">
                  DENY PRECEDENCE ACTIVE
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {['ALLOW_MATCH', 'EXPLICIT_DENY', 'BOUNDARY_DENY', 'DELEGATION_DENY', 'ROOT_BYPASS', 'NO_MATCH'].map((decision) => (
                    <span 
                      key={decision}
                      className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${
                        decision === 'ALLOW_MATCH' 
                          ? 'text-[#00c582] bg-[#00c582]/5 border-[#00c582]/15' 
                          : decision.includes('DENY') 
                            ? 'text-[#DE4E1A] bg-[#DE4E1A]/5 border-[#DE4E1A]/15' 
                            : 'text-zinc-400 bg-zinc-400/5 border-zinc-400/15'
                      }`}
                    >
                      {decision}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-zinc-500 font-bold">
                <span>0.04 ms</span>
                <span>6 DECISION TYPES</span>
              </div>
            </div>
          </div>

          {/* Quote text block */}
          <div className="flex flex-col gap-6 text-left max-w-[620px]">
            <blockquote className="relative text-3xl md:text-[38px] font-serif font-medium tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              <span aria-hidden="true" className="absolute right-full top-0 pr-[0.15em] text-zinc-500 font-serif">"</span>
              Every authorization request produces a typed decision. If your systems cannot distinguish between a boundary deny and an explicit deny, you cannot trust your audit trail.
            </blockquote>
            <figcaption className="flex flex-col gap-1 text-xs">
              <div className="font-bold text-zinc-900 dark:text-zinc-100">Citadel Evaluation Engine</div>
              <div className="text-zinc-500 font-semibold">6 typed outcomes · Deny precedence · Immutable logging</div>
            </figcaption>
          </div>

        </div>
      </section>

      {/* Dashed Section Separator */}
      <hr className="m-0 w-full border-0 border-t border-dashed border-zinc-400 dark:border-zinc-800" />

      {/* 2. Manifesto Section (The Precedence Gap Chart & drop-cap paragraph) */}
      <section id="manifesto" aria-label="Manifesto" className="w-full bg-white dark:bg-black py-[90px] md:py-[120px] transition-colors duration-300">
        <div className="mx-auto grid w-full max-w-[1512px] grid-cols-1 items-start gap-12 px-6 md:grid-cols-2 md:gap-16 md:px-[120px]">
          
          {/* SVG Chart representation */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[560px] aspect-[680/520] relative flex flex-col justify-between p-6 border border-dashed border-zinc-400 dark:border-zinc-800 rounded-2xl bg-white/10 dark:bg-black/10 shadow-sm">
              <CornerMarkers />
              
              <div className="flex justify-between text-[9px] font-mono font-bold text-zinc-500">
                <span>CHART.VIEW [PRECEDENCE GAP]</span>
                <span>COMPLEXITY RATIO</span>
              </div>

              {/* Graphic Plot */}
              <div className="my-auto h-[240px] w-full relative border-l border-b border-zinc-400/80 dark:border-zinc-800/80">
                {/* Exponential Line */}
                <svg className="absolute inset-0 w-full h-full" overflow="visible">
                  {/* Linear background guide line */}
                  <line x1="0" y1="200" x2="480" y2="160" stroke="currentColor" className="text-zinc-400/20 dark:text-zinc-800/40" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Linear green line (What your team can hold) */}
                  <path 
                    d="M 0 200 L 480 160" 
                    fill="none" 
                    stroke="#00c582" 
                    strokeWidth="2.5" 
                    strokeDasharray="480"
                    strokeDashoffset={480 - scrollProgress * 480}
                    className="transition-all duration-300"
                  />

                  {/* Exponential red line (Understanding needed) */}
                  <path 
                    d="M 0 200 Q 180 190 320 120 T 480 20" 
                    fill="none" 
                    stroke="#DE4E1A" 
                    strokeWidth="2.5" 
                    strokeDasharray="600"
                    strokeDashoffset={600 - scrollProgress * 600}
                    className="transition-all duration-300"
                  />
                  
                  {/* Arrow indicating representational gap */}
                  {scrollProgress > 0.4 && (
                    <g className="animate-fade-in text-zinc-900 dark:text-zinc-100">
                      <line x1="450" y1="162" x2="450" y2="28" stroke="currentColor" strokeWidth="1.5" />
                      <polygon points="450,22 446,32 454,32" fill="currentColor" />
                      <polygon points="450,168 446,158 454,158" fill="currentColor" />
                    </g>
                  )}
                </svg>

                {/* Plot Labels */}
                <span className="absolute right-2 top-2 text-[9px] font-mono font-extrabold text-[#DE4E1A] bg-[#DE4E1A]/5 border border-[#DE4E1A]/10 px-2 py-0.5 rounded">
                  IAM Complexity scale
                </span>
                <span className="absolute right-2 bottom-16 text-[9px] font-mono font-extrabold text-[#00c582] bg-[#00c582]/5 border border-[#00c582]/10 px-2 py-0.5 rounded">
                  Human brain threshold
                </span>
                {scrollProgress > 0.4 && (
                  <span className="absolute right-20 top-24 text-[9px] font-mono font-extrabold text-black dark:text-white bg-white dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-700 px-2 py-0.5 rounded shadow-sm animate-fade-in">
                    Precedence Gap
                  </span>
                )}
              </div>

              <div className="flex justify-between text-[8px] font-mono font-bold text-zinc-400">
                <span>Y_AXIS: ENTITIES</span>
                <span>X_AXIS: CLOUD GROWTH</span>
              </div>
            </div>
          </div>

          {/* Paragraph Text with Custom Dashed Drop Cap */}
          <div className="flex flex-col gap-6 text-left text-sm md:text-base text-zinc-700 dark:text-zinc-400 leading-relaxed font-semibold max-w-[580px]">
            <p>
              <span className="relative border border-dashed border-zinc-400 dark:border-zinc-800 float-left mr-3 flex h-[2.2lh] w-[2.2lh] items-center justify-center bg-white/30 dark:bg-zinc-900/30 rounded shadow-sm">
                <span className="font-serif text-[42px] leading-none text-[#DE4E1A] font-extrabold">I</span>
                <CornerMarkers />
              </span>
              dentity architecture, as practiced in modern enterprises, is breaking. Users accumulate group memberships, policies attach at multiple levels, and permission boundaries create layered ceilings that static analysis cannot resolve. When a UserPolicyAttachment conflicts with a GroupPolicyAttachment, which wins?
            </p>
            <p>
              Citadel's evaluation engine resolves this with a deny-precedence pipeline: explicit denies override allows, boundary constraints cap delegated permissions, and every decision — from ROOT_BYPASS to NO_MATCH — is logged to an immutable audit trail with actor, action, target, and decision metadata.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
