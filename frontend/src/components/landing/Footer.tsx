import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-black/[0.06] dark:border-white/[0.06] bg-transparent">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-20 pb-6 flex flex-col w-full">

        {/* ── Services columns — spaced evenly across layout ── */}
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-16 mb-20 w-full">
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-mono tracking-[0.2em] text-black/30 dark:text-white/25 uppercase mb-2">SERVICES</span>
            <a href="/login" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">IAM Dashboard</a>
            <a href="/login" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Policy Simulator</a>
            <a href="/login" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">JSON Policy Builder</a>
            <a href="/login" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Audit Logs Viewer</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-mono tracking-[0.2em] text-black/30 dark:text-white/25 uppercase mb-2">SECURITY</span>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Zero Trust Access</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Permission Boundaries</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Role-Based Access Control</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Multi-Factor Auth (MFA)</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-mono tracking-[0.2em] text-black/30 dark:text-white/25 uppercase mb-2">DEVELOPERS</span>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">SDKs & API Reference</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">CLI Tools</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Policy Schema</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">GitHub Repository</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[9px] font-mono tracking-[0.2em] text-black/30 dark:text-white/25 uppercase mb-2">RESOURCES & SUPPORT</span>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Site Terms of Use</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Privacy Policy</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Cookie Preferences</a>
            <a href="#" className="text-sm text-black/60 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors font-sans">Customer Feedback</a>
          </div>
        </div>

        {/* ── Lama Lama style bottom strip ── */}
        <div className="w-full border-t border-black/[0.06] dark:border-white/[0.06] pt-6 flex flex-wrap justify-between items-center text-[9.5px] font-mono uppercase tracking-[0.18em] text-black/60 dark:text-white/60 gap-4 mt-auto">
          <span>20+ DIGITAL FREAKS</span>
          <span className="hidden sm:inline">INDIA BASED</span>
          
          <span className="hidden md:inline">FOLLOW US</span>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">INSTAGRAM +</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">LINKEDIN +</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
