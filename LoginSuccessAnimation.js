import React, { useEffect, useState, useRef, useMemo } from 'react';
import './LoginSuccessAnimation.css';

/**
 * LoginSuccessAnimation component
 * Renders a realistic wallet animation that opens to reveal financial particles.
 * @param {Function} onComplete - Callback triggered when the animation sequence finishes.
 */
const LoginSuccessAnimation = ({ onComplete }) => {
  const [step, setStep] = useState('entering'); // phases: entering -> opening -> expanding -> finished
  const audioCtx = useRef(null);
  const isMounted = useRef(true);

  // Initialize or resume AudioContext (must be triggered after user interaction)
  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };
  
  const getSafeTime = () => audioCtx.current ? audioCtx.current.currentTime : 0;

  const playWhoosh = () => {
    initAudio();
    if (!audioCtx.current) return;

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = 'sine';
    const now = getSafeTime();
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.5);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.connect(gain).connect(audioCtx.current.destination);
    osc.start();
    osc.stop(now + 0.5);
  };

  const triggerHaptics = (pattern) => {
    // Check if the Vibration API is supported
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const playClick = () => {
    if (!audioCtx.current) return;

    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    const now = getSafeTime();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    osc.connect(gain).connect(audioCtx.current.destination);
    osc.start();
    osc.stop(now + 0.05);
  };

  const playJingle = () => {
    if (!audioCtx.current) return;

    const now = getSafeTime();
    [880, 1320, 1760].forEach((freq, i) => {
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = 'sine';
      const startOffset = i * 0.05;
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0, now + startOffset);
      gain.gain.linearRampToValueAtTime(0.1, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + startOffset + 0.3);
      osc.connect(gain).connect(audioCtx.current.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + 0.3);
    });
  };

  const handleShare = async () => {
    // Data to share - on mobile, this opens a tray with WhatsApp, Gmail, Telegram, etc.
    const shareData = {
      title: 'Expense Tracker',
      text: 'I just accessed my financial dashboard! Manage your expenses effortlessly.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Share failed:', err);
    }
  };

  useEffect(() => {
    playWhoosh();

    // Start opening after the wallet has appeared
    const openTimeout = setTimeout(() => {
      setStep('opening');
      playClick();
      playJingle();
      triggerHaptics(20); // Subtle 20ms pulse for the "click" effect
    }, 800);
    
    // Brief expansion effect before finishing
    const expandTimeout = setTimeout(() => {
      if (isMounted.current) setStep('expanding');
    }, 3000);

    // Notify parent to transition to dashboard after animation completes
    const completeTimeout = setTimeout(() => {
      if (isMounted.current) {
        setStep('finished');
        if (onComplete) onComplete();
      }
    }, 3800);

    return () => {
      isMounted.current = false;
      clearTimeout(openTimeout);
      clearTimeout(expandTimeout);
      clearTimeout(completeTimeout);
      if (audioCtx.current && audioCtx.current.state !== 'closed') {
        audioCtx.current.close();
      }
    };
  }, [onComplete]);

  // Stabilize particles using useMemo to prevent flickering during step transitions
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < 20; i++) {
      const typeId = i % 4;
      const type = typeId === 0 ? 'note' : typeId === 1 ? 'coin' : typeId === 2 ? 'icon-dollar' : 'icon-chart';
      p.push({
        type,
        '--delay': `${Math.random() * 0.7}s`,
        '--x': `${(Math.random() - 0.5) * 450}px`,
        '--y': `${-350 - Math.random() * 250}px`,
        '--rot': `${(Math.random() - 0.5) * 720}deg`,
      });
    }
    return p;
  }, []);

  return (
    <div className={`animation-overlay ${step === 'finished' ? 'fade-out' : ''}`}>
      <button className="share-button" onClick={handleShare} title="Share App">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="share-icon">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      </button>
      <div className={`wallet-container ${step}`}>
        <svg width="220" height="150" viewBox="0 0 220 150" className="wallet-svg">
          <defs>
            <radialGradient id="leatherGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="100%" stopColor="#3E2723" />
            </radialGradient>
            <radialGradient id="goldGradient" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#FFF280" />
              <stop offset="100%" stopColor="#D4AF37" />
            </radialGradient>
          </defs>
          {/* Wallet Base Layer */}
          <path d="M10 40 h200 v100 a10 10 0 0 1 -10 10 h-180 a10 10 0 0 1 -10 -10 z" fill="url(#leatherGradient)" />
          {/* Wallet Interior Pocket */}
          <path d="M10 40 h200 v15 a5 5 0 0 1 -5 5 h-190 a5 5 0 0 1 -5 -5 z" fill="#2D1B18" />
          
          {/* Animated Wallet Flap */}
          <g className="wallet-flap-group">
            <path d="M10 40 h200 v-30 a10 10 0 0 0 -10 -10 h-180 a10 10 0 0 0 -10 10 z" fill="#4E342E" stroke="#3E2723" strokeWidth="1" />
            {/* Golden Clasp */}
            <circle cx="110" cy="20" r="10" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="1" />
          </g>
        </svg>

        {(step === 'opening' || step === 'expanding') && (
          <div className="particles-emitter">
            {particles.map((p, i) => (
              <div key={i} className={`particle ${p.type}`} style={p} />
            ))}
          </div>
        )}
      </div>
      <div className="success-status">
        <h2>Secure Connection Established</h2>
        <p>Loading your financial dashboard...</p>
      </div>
    </div>
  );
};

export default LoginSuccessAnimation;