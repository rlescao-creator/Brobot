"use client";

import { useState, useEffect } from "react";
import { Swords, Target, Flame, Zap } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [intensity, setIntensity] = useState(0);
  const [dynamicTextIndex, setDynamicTextIndex] = useState(0);
  const [titleGlitch, setTitleGlitch] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [buttonParticles, setButtonParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const [showLetters, setShowLetters] = useState<boolean[]>(new Array(6).fill(false));
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration by only showing dynamic content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // PlayStation-style video intro
  useEffect(() => {
    setTimeout(() => setVideoLoaded(true), 100);
  }, []);

  // Staggered letter appearance animation with sword sound
  useEffect(() => {
    // Play sword sound on first letter
    const audio = new Audio();
    audio.volume = 0.3;
    // You can add a sword sound file to public folder
    // For now, we'll just trigger the animation
    
    const delays = [0, 100, 200, 300, 400, 500];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setShowLetters(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
        // Play swoosh sound on first letter
        if (index === 0) {
          try {
            // Uncomment when you add sword.mp3 to public folder
            // audio.src = '/sword.mp3';
            // audio.play().catch(e => console.log('Audio play failed:', e));
          } catch (e) {
            console.log('Audio not available');
          }
        }
      }, delay);
    });
  }, []);

  const dynamicTexts = [
    "build yourself",
    "inspire others", 
    "dominate everyday"
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIntensity(Math.random());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicTextIndex((prev) => (prev + 1) % dynamicTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Title glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setTitleGlitch(true);
        setTimeout(() => setTitleGlitch(false), 100);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, []);

  // Button particle effect
  const createParticles = () => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
    }));
    setButtonParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setButtonParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Aggressive Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `perspective(500px) rotateX(60deg) scale(2) translateY(-50%)`,
          }}
        />
      </div>

      {/* Intense Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 30}%, 
            rgba(249, 115, 22, 0.3) 0%, 
            rgba(220, 38, 38, 0.2) 20%, 
            transparent 60%)`,
        }}
      />

      {/* Animated Scan Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none scan-lines" />

      {/* Floating Energy Orbs - Only render after mount to avoid hydration issues */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full mix-blend-screen animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                background: i % 2 === 0 
                  ? 'rgba(249, 115, 22, 0.6)' 
                  : 'rgba(220, 38, 38, 0.6)',
                boxShadow: `0 0 ${Math.random() * 20 + 10}px currentColor`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-screen px-6 lg:px-12 gap-8 lg:gap-16 py-12">
        
        {/* Left Side - Content */}
        <div className="flex-1 max-w-2xl space-y-4 text-center lg:text-left">

          {/* Main Title - MASSIVE but Readable */}
          <div className="space-y-3">
            <div className="relative mb-4 overflow-visible">
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter">
                {/* Pulsing light rings */}
                <div className="absolute -inset-8 pointer-events-none">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-3xl animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Background glow - two-tone */}
                <span className="absolute inset-0 blur-lg opacity-40">
                  <span className="text-orange-500">BRO</span>
                  <span className="text-red-500">BOT</span>
                </span>
                
                {/* Main title with interactive letters and slash animations */}
                <span className="relative block">
                  {Array.from('BROBOT').map((letter, i) => {
                    const isHovered = hoveredLetter === i;
                    const isNearby = hoveredLetter !== null && Math.abs(hoveredLetter - i) === 1;
                    const isBRO = i < 3; // First 3 letters are "BRO"
                    const isVisible = showLetters[i];
                    
                    return (
                      <span 
                        key={i}
                        onMouseEnter={() => setHoveredLetter(i)}
                        onMouseLeave={() => setHoveredLetter(null)}
                        className={`relative inline-block transition-all duration-200 cursor-pointer ${isBRO ? 'text-orange-500' : 'text-red-500'} ${isVisible ? 'animate-slash-in' : 'opacity-0'}`}
                        style={{
                          transform: isHovered 
                            ? 'scale(1.15) translateY(-8px) rotate(-3deg)' 
                            : isNearby 
                            ? 'scale(1.05) translateY(-2px)'
                            : 'scale(1)',
                          filter: isHovered 
                            ? `drop-shadow(0 0 25px rgba(${isBRO ? '249, 115, 22' : '220, 38, 38'}, 1)) drop-shadow(0 0 50px rgba(${isBRO ? '220, 38, 38' : '249, 115, 22'}, 0.8)) drop-shadow(0 0 75px rgba(${isBRO ? '249, 115, 22' : '220, 38, 38'}, 0.6))`
                            : isNearby
                            ? `drop-shadow(0 0 15px rgba(${isBRO ? '249, 115, 22' : '220, 38, 38'}, 0.6))`
                            : `drop-shadow(0 0 8px rgba(${isBRO ? '249, 115, 22' : '220, 38, 38'}, 0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      >
                        {/* Slash trail effect on entry */}
                        {isVisible && (
                          <span 
                            className={`absolute inset-0 ${isBRO ? 'text-orange-400' : 'text-red-400'} blur-sm animate-slash-trail`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {letter}
                          </span>
                        )}
                        
                        {/* Light burst on hover */}
                        {isHovered && (
                          <>
                            <span className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 blur-xl animate-ping" />
                            <span className={`absolute inset-0 ${isBRO ? 'text-orange-300' : 'text-red-300'} blur-md animate-pulse-fast`}>
                              {letter}
                            </span>
                          </>
                        )}
                        
                        {/* Main letter */}
                        <span className="relative">
                          {letter}
                        </span>
                      </span>
                    );
                  })}
                </span>
              </h1>
            </div>
            
          </div>

          {/* Description - More Aggressive */}
          <div className="space-y-2">
            <p className="text-2xl md:text-3xl text-gray-200 font-black leading-tight max-w-xl mx-auto lg:mx-0"
              style={{ 
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}>
              Your AI bro for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 text-4xl md:text-5xl my-2"
                style={{ 
                  textShadow: '0 0 12px rgba(249, 115, 22, 0.4), 0 2px 8px rgba(0,0,0,0.9)',
                }}>
                CRUSHING LIFE
              </span>
            </p>
            <p className="text-lg md:text-xl text-gray-400 font-bold max-w-xl mx-auto lg:mx-0 capitalize">
              <span className="inline-block text-orange-400 font-black transition-all duration-500">
                {dynamicTexts[dynamicTextIndex]}.
              </span>
            </p>
          </div>

          {/* What Brobot Does */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3">
            {[
              { 
                icon: Target, 
                title: 'Track Goals', 
                desc: 'Set commitments, build streaks, crush your targets',
                color: 'orange' 
              },
              { 
                icon: Swords, 
                title: 'Talk About Anything', 
                desc: 'Relationships, feelings, life struggles - real talk',
                color: 'red' 
              },
              { 
                icon: Zap, 
                title: 'Get Real Advice', 
                desc: 'Build muscle, fitness, nutrition, physique ratings - no BS',
                color: 'orange' 
              },
            ].map((feature, i) => (
              <div 
                key={i}
                className="relative group"
              >
                {/* Subtle glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color === 'orange' ? 'from-orange-500/15 to-red-500/15' : 'from-red-500/15 to-orange-500/15'} rounded-xl blur-lg group-hover:blur-xl transition-all`} />
                
                {/* Card */}
                <div className={`relative p-5 bg-black/90 border-2 ${feature.color === 'orange' ? 'border-orange-500/40' : 'border-red-500/40'} rounded-xl group-hover:border-${feature.color}-500/70 transition-all backdrop-blur-sm group-hover:scale-105 transform h-full`}>
                  <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${feature.color === 'orange' ? 'from-orange-500 to-red-500' : 'from-red-500 to-orange-500'} rounded-t-xl`} />
                  
                  <feature.icon className={`w-7 h-7 ${feature.color === 'orange' ? 'text-orange-400' : 'text-red-400'} mb-3`} />
                  
                  <h3 className={`text-lg font-black text-white mb-2`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-sm text-gray-400 leading-relaxed`}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button - MASSIVE */}
          <div className="flex flex-col gap-3 justify-center lg:justify-start pt-2">
            <button
              onClick={onGetStarted}
              onMouseEnter={() => {
                setButtonHover(true);
                createParticles();
              }}
              onMouseLeave={() => setButtonHover(false)}
              className="group relative px-10 py-5 font-black text-xl md:text-2xl overflow-visible rounded-xl transition-all hover:scale-110 active:scale-95"
            >
              {/* Particle Explosions */}
              {buttonParticles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-500 rounded-full pointer-events-none animate-particle-explode"
                  style={{
                    transform: `translate(${particle.x}px, ${particle.y}px)`,
                  }}
                />
              ))}

              {/* Pulsing Background Layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl" />
              <div className={`absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl transition-opacity duration-300 ${buttonHover ? 'opacity-100 animate-pulse-fast' : 'opacity-0'}`} />
              
              {/* Animated Border */}
              <div className={`absolute inset-0 border-4 rounded-xl transition-all ${buttonHover ? 'border-white/70 animate-border-dance' : 'border-white/30'}`} />
              
              {/* Rotating Shine Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-xl transition-transform duration-700 ${buttonHover ? 'translate-x-full' : '-translate-x-full'}`} />
              
              {/* Corner Flares - Bigger on hover */}
              <div className={`absolute top-0 left-0 w-4 h-4 bg-white transform -translate-x-1 -translate-y-1 transition-all duration-300 ${buttonHover ? 'scale-[200%] opacity-80' : 'scale-100 opacity-60'}`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
              <div className={`absolute top-0 right-0 w-4 h-4 bg-white transform translate-x-1 -translate-y-1 transition-all duration-300 ${buttonHover ? 'scale-[200%] opacity-80' : 'scale-100 opacity-60'}`}
                style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
              <div className={`absolute bottom-0 left-0 w-4 h-4 bg-white transform -translate-x-1 translate-y-1 transition-all duration-300 ${buttonHover ? 'scale-[200%] opacity-80' : 'scale-100 opacity-60'}`}
                style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }} />
              <div className={`absolute bottom-0 right-0 w-4 h-4 bg-white transform translate-x-1 translate-y-1 transition-all duration-300 ${buttonHover ? 'scale-[200%] opacity-80' : 'scale-100 opacity-60'}`}
                style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
              
              {/* Ripple Effect on hover */}
              {buttonHover && (
                <div className="absolute inset-0 rounded-xl animate-ripple border-4 border-white/50" />
              )}

              {/* Text with letter animation */}
              <span className="relative flex items-center gap-4 justify-center uppercase tracking-wider"
                style={{ 
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                }}>
                <Flame className={`w-8 h-8 transition-transform duration-300 ${buttonHover ? 'scale-125 rotate-12' : 'animate-pulse'}`} />
                {Array.from('GET STARTED').map((char, i) => (
                  <span
                    key={i}
                    className={`inline-block transition-all duration-200 ${buttonHover ? 'animate-letter-wave' : ''}`}
                    style={{
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
                <Flame className={`w-8 h-8 transition-transform duration-300 ${buttonHover ? 'scale-125 -rotate-12' : 'animate-pulse'}`} />
              </span>

              {/* Massive Outer Glow */}
              <div className={`absolute inset-0 -z-10 bg-gradient-to-r from-orange-500 to-red-600 blur-2xl transition-all duration-300 ${buttonHover ? 'opacity-90 scale-125 blur-3xl' : 'opacity-40 scale-105'}`} />
              
              {/* Pulsing ring */}
              {buttonHover && (
                <div className="absolute inset-0 -z-10 rounded-xl border-2 border-orange-500 animate-ping" />
              )}
            </button>

            {/* Action Text */}
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="text-base text-gray-400 font-bold uppercase tracking-wider">
                No BS. Start Now.
              </p>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Warrior Video */}
        <div className="flex-1 max-w-2xl relative">
          <div className={`relative aspect-square max-w-lg mx-auto transition-all duration-1000 ${videoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}
            style={{
              transform: videoLoaded ? 'perspective(1000px) rotateY(0deg)' : 'perspective(1000px) rotateY(90deg)',
            }}
          >
            
            {/* Rotating Rings */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/30" 
                style={{ 
                  borderRadius: '50%',
                  transform: 'scale(1.2)',
                  borderStyle: 'dashed',
                }} 
              />
            </div>
            <div className="absolute inset-0 animate-spin-reverse">
              <div className="absolute inset-0 rounded-full border-2 border-red-500/30" 
                style={{ 
                  borderRadius: '50%',
                  transform: 'scale(1.4)',
                  borderStyle: 'dashed',
                }} 
              />
            </div>

            {/* Pulsing Glow Circles */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-3xl animate-pulse-slow" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-2xl animate-pulse" 
              style={{ animationDelay: '0.5s' }} 
            />

            {/* PlayStation-style white flash */}
            {!videoLoaded && (
              <div className="absolute inset-0 bg-white z-50 animate-flash" />
            )}

            {/* Main Video Container */}
            <div 
              className="relative z-10 rounded-3xl overflow-hidden border-4 border-orange-500/50 shadow-2xl transform transition-transform hover:scale-105"
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
              }}
            >
              {/* Video Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/30 via-transparent to-red-500/30 mix-blend-overlay z-10" />
              
              {/* The Warrior Video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Video failed to load');
                  // Fallback to image if video fails
                  const videoElement = e.currentTarget;
                  const imgElement = document.createElement('img');
                  imgElement.src = '/logo_brobot.png';
                  imgElement.className = 'w-full h-full object-cover';
                  videoElement.parentNode?.replaceChild(imgElement, videoElement);
                }}
              >
                <source src="/brobot%20video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent animate-scan z-10" />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-500 z-20" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-500 z-20" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-red-500 z-20" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-red-500 z-20" />
            </div>

            {/* Floating Badges */}
            <div className="absolute -top-6 -left-6 px-4 py-2 bg-black/90 border-2 border-orange-500 rounded-lg backdrop-blur-sm animate-float">
              <div className="text-xs text-gray-400 font-bold">STATUS</div>
              <div className="text-lg font-black text-orange-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                ONLINE
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 px-4 py-2 bg-black/90 border-2 border-red-500 rounded-lg backdrop-blur-sm animate-float" style={{ animationDelay: '1s' }}>
              <div className="text-xs text-gray-400 font-bold">POWER LEVEL</div>
              <div className="text-lg font-black text-red-500 flex items-center gap-2">
                MAXIMUM
                <Zap className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}
