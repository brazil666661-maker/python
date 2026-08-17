import React from 'react';
import {
  Code2,
  Play,
  Sparkles,
  Terminal,
  ShieldAlert,
  Globe,
  ArrowRight,
  Zap,
  CheckCircle2,
  Laptop,
} from 'lucide-react';
import { AppLanguage } from '../types';
import { getLocale } from '../locales';

interface LandingPageProps {
  onStartCoding: () => void;
  onTryExample: (exampleCode?: string) => void;
  language: AppLanguage;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCoding,
  onTryExample,
  language,
}) => {
  const t = getLocale(language);

  return (
    <div
      id="ilmhub-landing-page"
      className="flex flex-col min-h-screen w-full bg-[#071A2F] text-white selection:bg-[#FFD43B] selection:text-[#071A2F]"
    >
      {/* Top Navbar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-[#1E3A5F] px-6 lg:px-12 bg-[#071A2F]/90 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B2747] border border-[#FFD43B]/40 shadow-inner">
            <Code2 className="h-5 w-5 text-[#FFD43B]" />
          </div>
          <div className="flex items-baseline font-mono font-black text-2xl tracking-tight">
            <span>ILM</span>
            <span className="text-[#FFD43B]">HUB</span>
          </div>
        </div>

        <button
          onClick={onStartCoding}
          className="flex items-center space-x-2 rounded-xl bg-[#FFD43B] hover:bg-amber-300 px-5 py-2 text-sm font-bold text-[#071A2F] shadow-lg transition active:scale-95"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>{t.landing.startCoding}</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#FFD43B]/30 bg-[#0B2747]/80 px-3.5 py-1 text-xs font-semibold text-[#FFD43B] mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ILMHUB Online Python Engine & AI Assistant</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-sans">
          {t.landing.heroTitle}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onStartCoding}
            className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl bg-[#FFD43B] hover:bg-amber-300 px-7 py-3.5 text-base font-bold text-[#071A2F] shadow-xl transition active:scale-95"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>{t.landing.startCoding}</span>
          </button>

          <button
            onClick={() => onTryExample()}
            className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl border border-[#1E3A5F] bg-[#0B2747] hover:bg-[#133863] px-7 py-3.5 text-base font-semibold text-white transition"
          >
            <span>{t.landing.tryExample}</span>
            <ArrowRight className="h-4 w-4 text-[#FFD43B]" />
          </button>
        </div>

        {/* Interactive Editor Mock / Preview */}
        <div className="mt-12 w-full rounded-2xl border border-[#1E3A5F] bg-[#050B14] shadow-2xl overflow-hidden text-left font-mono">
          <div className="flex h-9 items-center justify-between border-b border-[#1E3A5F] bg-[#071424] px-4 select-none">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 ml-2">main.py</span>
            </div>
            <button
              onClick={onStartCoding}
              className="flex items-center space-x-1.5 rounded-md bg-[#FFD43B] px-2.5 py-1 text-xs font-bold text-[#071A2F] hover:bg-amber-300 transition"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Run Code</span>
            </button>
          </div>
          <div className="p-4 text-xs sm:text-sm text-slate-300 leading-relaxed overflow-x-auto">
            <pre>
              <span className="text-[#FFD43B]">def</span>{' '}
              <span className="text-sky-300">calculate_fibonacci</span>(n: <span className="text-emerald-400">int</span>):{'\n'}
              {'    '}series = [0, 1]{'\n'}
              {'    '}<span className="text-[#FFD43B]">for</span> _ <span className="text-[#FFD43B]">in</span>{' '}
              <span className="text-sky-300">range</span>(2, n):{'\n'}
              {'        '}series.append(series[-1] + series[-2]){'\n'}
              {'    '}<span className="text-[#FFD43B]">return</span> series{'\n\n'}
              print(<span className="text-emerald-300">"🚀 Fibonacci:"</span>, calculate_fibonacci(10))
            </pre>
          </div>
        </div>

        {/* 4 Feature Pillars */}
        <section className="mt-20 w-full text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-8">
            {t.landing.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#1E3A5F] bg-[#0B2747]/60 p-5 hover:border-[#FFD43B]/40 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD43B]/10 text-[#FFD43B] mb-3">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{t.landing.feature1Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.landing.feature1Desc}</p>
            </div>

            <div className="rounded-2xl border border-[#1E3A5F] bg-[#0B2747]/60 p-5 hover:border-rose-400/40 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 mb-3">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{t.landing.feature2Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.landing.feature2Desc}</p>
            </div>

            <div className="rounded-2xl border border-[#1E3A5F] bg-[#0B2747]/60 p-5 hover:border-amber-400/40 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{t.landing.feature3Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.landing.feature3Desc}</p>
            </div>

            <div className="rounded-2xl border border-[#1E3A5F] bg-[#0B2747]/60 p-5 hover:border-sky-400/40 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 mb-3">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{t.landing.feature4Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.landing.feature4Desc}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E3A5F] py-6 text-center text-xs text-slate-500 font-mono">
        © 2026 ILMHUB. Online Python IDE and AI coding platform.
      </footer>
    </div>
  );
};
