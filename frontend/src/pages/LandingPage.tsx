import React, { useState, useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import WhyCitadel from '../components/landing/WhyCitadel';
import UseCases from '../components/landing/UseCases';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';
import Background from '../components/landing/Background';

const LandingPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('SECURE YOUR PERIMETER');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('citadel_token'));
    document.documentElement.classList.add('dark');
    
    // Intersection Observer to track visible sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.getAttribute('data-section-name');
            if (sectionName) {
              setActiveSection(sectionName);
            }
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of section is visible
    );

    const elements = document.querySelectorAll('[data-section-name]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen bg-transparent text-zinc-900 dark:text-white font-display select-none antialiased relative">
      
      {/* ── Global Animated Background ── */}
      <Background />

      {/* ── Fixed Navbar ── */}
      <Navbar isLoggedIn={isLoggedIn} activeSection={activeSection} />

      {/* ── Main Content ── */}
      <main className="relative z-10 w-full flex flex-col">
        <div id="hero" data-section-name="SECURE YOUR PERIMETER">
          <Hero />
        </div>
        <div id="what-we-do" data-section-name="WHAT WE DO">
          <WhyCitadel />
        </div>
        <div id="use-cases" data-section-name="USE CASES">
          <UseCases />
        </div>
        <div id="faq" data-section-name="KNOWLEDGE BASE">
          <FAQ />
        </div>
        <div id="cta" data-section-name="GET STARTED">
          <CTA />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;
