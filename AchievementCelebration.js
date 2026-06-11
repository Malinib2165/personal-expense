import React, { useEffect, useState, useRef, useMemo } from 'react';
import './AchievementCelebration.css';

/**
 * AchievementCelebration Component
 * Renders a full-screen celebration for reaching financial goals.
 * @param {string} userName - The name of the user to congratulate.
 * @param {Function} onClose - Callback to close the celebration screen.
 * @param {string} goalLevel - The tier of the achievement ('bronze', 'silver', 'gold', 'emerald').
 */
const AchievementCelebration = ({ userName = "User", goalLevel = "target", onClose }) => {
  const [typedText, setTypedText] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const audioCtx = useRef(null);

  // Configuration mapping for different goal levels
  const goalConfigs = {
    bronze: {
      gif: "/assets/robot_happy.gif",
      message: `🎉 Great start, ${userName}! You've earned the Bronze Achievement! Your first savings milestone is reached.`,
      badge: "BRONZE SAVER",
    },
    silver: {
      gif: "/assets/robot_excited.gif",
      message: `🚀 Silver status unlocked, ${userName}! You are showing serious financial discipline.`,
      badge: "SILVER SAVER",
    },
    gold: {
      gif: "/assets/robot_celebrate.gif",
      message: `👑 Gold Tier reached, ${userName}! UNBELIEVABLE! You are a financial master!`,
      badge: "GOLD SAVER",
    },
    emerald: {
      gif: "/assets/robot_emerald.gif",
      message: `💎 EMERALD STATUS! ${userName}, your savings journey is legendary and inspiring!`,
      badge: "EMERALD LEGEND",
    },
    target: {
      gif: "/assets/robot.gif",
      message: `🎉 Congratulations ${userName}, You made it!`,
      badge: "TARGET REACHED",
    },
  };

  const currentConfig = goalConfigs[goalLevel] || goalConfigs.target;

  // Initialize Audio Context for synthesized victory sounds
  const playVictorySound = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtx.current) {
        audioCtx.current = new AudioContextClass();
      }
      
      if (audioCtx.current.state === 'suspended') {
        await audioCtx.current.resume();
      }

      const now = audioCtx.current.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, i) => {
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05);
        osc.connect(gain).connect(audioCtx.current.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } catch (err) {
      console.warn("Audio playback blocked:", err);
    }
  };

  useEffect(() => {
    playVictorySound();

    // Typing Effect Logic
    let currentPos = 0;
    const typingInterval = setInterval(() => {
      if (currentPos <= currentConfig.message.length) {
        setTypedText(currentConfig.message.substring(0, currentPos));
        currentPos++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);

    return () => {
      clearInterval(typingInterval);
      if (audioCtx.current && audioCtx.current.state !== 'closed') {
        audioCtx.current.close();
      }
    };
  }, [userName, goalLevel]);

  const handleClose = () => {
    setIsClosing(true);
    if (onClose) setTimeout(onClose, 800);
  };

  // Memoize confetti to prevent expensive recalculations during the typing effect
  const confettiData = useMemo(() => {
    const p = [];
    for (let i = 0; i < 50; i++) {
      p.push({
        '--delay': `${Math.random() * 3}s`,
        '--x': `${Math.random() * 100}vw`,
        '--duration': `${2 + Math.random() * 2}s`,
        '--color': `hsl(${Math.random() * 360}, 80%, 60%)`,
        '--size': `${Math.random() * 10 + 5}px`,
      });
    }
    return p;
  }, []);

  return (
    <div className={`achievement-overlay ${isClosing ? 'exit' : ''}`}>
      {confettiData.map((style, i) => (
        <div key={i} className="confetti" style={style} />
      ))}
      
      <div className="achievement-card">
        <div className="glow-ring"></div>
        
        <div className="robot-assistant">
          {/* Replace with your actual asset path */}
          <img 
            src={currentConfig.gif} 
            alt="Financial Assistant" 
            className="robot-gif" 
            onError={(e) => { e.target.src = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6bXN3ZzZ4eXN6eXN6eXN6eXN6eXN6eXN6eXN6eXN6eXN6ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKMGpxV73B1m5yM/giphy.gif"}} 
          />
        </div>

        <div className="terminal-container">
          <div className="terminal-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="terminal-title">{goalLevel.toUpperCase()}_GOAL.EXE</span>
          </div>
          <div className="terminal-body">
            <span className="prompt">{'>'}</span> {typedText}
            <span className="cursor">_</span>
          </div>
        </div>

        <div className="achievement-badge">
          <div className="badge-icon">🏆</div>
          <div className="badge-text">{currentConfig.badge}</div>
        </div>

        <button className="continue-btn" onClick={handleClose}>
          CONTINUE JOURNEY
        </button>
      </div>

      <div className="background-grid"></div>
    </div>
  );
};

export default AchievementCelebration;
