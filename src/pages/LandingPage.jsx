import React, { useState, useEffect } from 'react';
import SyncoraLogo from '../components/SyncoraLogo';

/**
 * 3D Animated Light Landing Page for Syncora
 * Featuring continuous 3D rotation, floating bounce, ambient aura,
 * and typewriter tagline with glowing blue blinking cursor.
 */
export default function LandingPage({ onContinue = () => { } }) {
  // Phrases to loop in typing animation
  const phrases = [
    'One Space. Every Voice. Aligned Action.',
    'Turn Discussions into Traceable Decisions.',
    'Where Meeting Intelligence Meets Aligned Execution.',
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(70);

  // Typewriter Loop Effect
  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        setTypingSpeed(65);

        // Reached end of current phrase
        if (displayText.length + 1 >= currentPhrase.length) {
          setIsDeleting(true);
          setTypingSpeed(2200); // Pause before deleting
        }
      } else {
        // Deleting characters
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        setTypingSpeed(32);

        // Finished deleting
        if (displayText.length <= 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(450); // Pause before starting next phrase
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, typingSpeed, phrases]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#eaf2ff] via-[#f4f7ff] to-[#edf3ff] text-slate-900 select-none px-4 py-8">
      {/* Dynamic Keyframe Styles */}
      <style>{`
        @keyframes syncoraFloatBounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes syncora3DRotate {
          0% {
            transform: perspective(900px) rotateY(-20deg) rotateX(10deg);
          }
          50% {
            transform: perspective(900px) rotateY(20deg) rotateX(-8deg);
          }
          100% {
            transform: perspective(900px) rotateY(-20deg) rotateX(10deg);
          }
        }

        @keyframes syncoraAuraPulse {
          0%, 100% {
            opacity: 0.45;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.18);
          }
        }

        @keyframes syncoraBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
@keyframes syncoraSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-syncora-spin {
  animation: syncoraSpin 8s linear infinite;
}
        .animate-syncora-float {
          animation: syncoraFloatBounce 4.5s ease-in-out infinite;
        }

        .animate-syncora-3d {
          animation: syncora3DRotate 7.5s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .animate-syncora-aura {
          animation: syncoraAuraPulse 3.8s ease-in-out infinite;
        }

        .animate-syncora-cursor {
          animation: syncoraBlink 0.9s step-end infinite;
        }
      `}</style>

      {/* Atmospheric Ambient Lighting / Gradients */}
      <div
        className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-purple-200/35 rounded-full blur-3xl pointer-events-none translate-x-1/3"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-1/2 w-[600px] h-[300px] bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -translate-x-1/2"
        aria-hidden="true"
      />

      {/* Center Content Stack */}
      <main className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto my-auto py-6 sm:py-10">

        {/* 1. 3D Animated Petal Logo with Floating Bounce and Ambient Aura */}
        <div className="relative mb-6 sm:mb-8 group">
          {/* Ambient Glowing Aura */}
          <div
            className="absolute -inset-6 sm:-inset-10 rounded-full bg-gradient-to-tr from-indigo-400/30 via-sky-300/35 to-teal-300/30 blur-2xl animate-syncora-aura pointer-events-none"
            aria-hidden="true"
          />

          {/* Floating & 3D Rotating Logo Container */}
          <div className="relative animate-syncora-float">
            <div className="animate-syncora-3d flex items-center justify-center">
              <SyncoraLogo
                withBackground={false}
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44"
              />
            </div>
          </div>
        </div>

        {/* 2. SYNCORA Title with Wide Tracking */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.25em] text-slate-900 uppercase">
          SYNCORA
        </h1>

        {/* 3. Subtext: Discussions · Decisions · Workflows · Notifications */}
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-semibold tracking-wide text-slate-500 sm:tracking-wider">
          Discussions &middot; Decisions &middot; Workflows &middot; Notifications
        </p>

        {/* 4. Typing Tagline Animation with Blue Blinking Cursor */}
        <div className="mt-8 sm:mt-10 min-h-[44px] flex items-center justify-center px-4">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-medium text-slate-800 tracking-tight leading-snug">
            <span>{displayText}</span>
            <span className="text-sky-500 font-light animate-syncora-cursor ml-0.5 select-none text-xl sm:text-2xl md:text-3xl">
              |
            </span>
          </h2>
        </div>

        {/* 5. Primary Action Button: Continue to Workspace */}
        <div className="mt-8 sm:mt-10">
          <button
            onClick={() => {
              if (typeof onContinue === 'function') {
                onContinue();
              }
            }}
            className="group px-8 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-[#0b1120] hover:bg-[#1a2333] active:scale-95 text-white font-medium text-sm sm:text-base shadow-xl shadow-slate-900/15 hover:shadow-2xl hover:shadow-slate-900/25 transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
          >
            <span>Continue to Workspace</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1 font-semibold text-slate-300 group-hover:text-white">
              &rarr;
            </span>
          </button>
        </div>
      </main>

      {/* Subtle Bottom Credit / Version Note */}
      <footer className="relative z-10 mt-auto py-3 text-[11px] font-mono text-slate-400 text-center tracking-wide">
        SYNCORA &bull; AI-POWERED MEETING INTELLIGENCE &bull; v1.0
      </footer>
    </div>
  );
}

