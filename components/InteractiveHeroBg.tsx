"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// Top tier travel/real-estate photography from Unsplash
const ITEMS = [
  { 
    id: 1, 
    type: "image", 
    src: "https://images.unsplash.com/photo-1522083165195-344cbdf9a454?q=80&w=300&auto=format&fit=crop", 
    top: "12%", 
    left: "6%", 
    delay: "0s", 
    rotate: "-rotate-6",
    size: "w-40 h-48",
    speed: 1.5
  },
  { 
    id: 2, 
    type: "glass", 
    icon: "🌴", 
    top: "65%", 
    left: "4%", 
    delay: "2s", 
    rotate: "rotate-12",
    size: "w-24 h-24 text-4xl",
    speed: 2.5
  },
  { 
    id: 3, 
    type: "image", 
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=300&auto=format&fit=crop", 
    top: "18%", 
    left: "78%", 
    delay: "1s", 
    rotate: "rotate-6",
    size: "w-44 h-56",
    speed: 1.2
  },
  { 
    id: 4, 
    type: "glass", 
    icon: "🗼", 
    top: "75%", 
    left: "85%", 
    delay: "3s", 
    rotate: "-rotate-12",
    size: "w-20 h-20 text-3xl",
    speed: 2
  },
  { 
    id: 5, 
    type: "image", 
    src: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=300&auto=format&fit=crop", 
    top: "80%", 
    left: "25%", 
    delay: "1.5s", 
    rotate: "-rotate-3",
    size: "w-32 h-32 rounded-full", // Circular image for variety
    speed: 1.8
  },
  { 
    id: 6, 
    type: "glass", 
    icon: "✈️", 
    top: "5%", 
    left: "55%", 
    delay: "4s", 
    rotate: "rotate-45",
    size: "w-16 h-16 text-2xl",
    speed: 3
  },
];

export default function InteractiveHeroBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Spatial parallax math linked to mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      
      // Calculate delta from center of screen (-1 to 1)
      const xOrigin = (clientX / window.innerWidth - 0.5) * 2;
      const yOrigin = (clientY / window.innerHeight - 0.5) * 2;

      // Select all DOM nodes marked for parallax tracking
      const elements = containerRef.current.querySelectorAll(".parallax-node");
      
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const speed = parseFloat(htmlEl.dataset.speed || "1");
        
        // Push the element natively via hardware-accelerated transforms
        const xOffset = xOrigin * 30 * speed;
        const yOffset = yOrigin * 30 * speed;
        
        htmlEl.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10"
    >
      {/* ── Soft Ambient Nebulas ── */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[80%] rounded-full opacity-30 mix-blend-multiply blur-[120px] animate-pulse-slow"
        style={{ background: "#6c63ff" }}
      />
      <div
        className="absolute top-[10%] -right-[15%] w-[55%] h-[85%] rounded-full opacity-25 mix-blend-multiply blur-[120px] animate-pulse-slow"
        style={{ background: "#ff6584", animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-[20%] left-[20%] w-[40%] h-[60%] rounded-full opacity-20 mix-blend-multiply blur-[100px] animate-pulse-slow"
        style={{ background: "#43e97b", animationDelay: "1s" }}
      />

      {/* ── Interactive Spatial Nodes ── */}
      {ITEMS.map((item) => (
        <div
          key={item.id}
          className="absolute flex items-center justify-center pointer-events-none"
          style={{ top: item.top, left: item.left }}
        >
          {/* Parallax Container (tracks mouse, ease-out transition prevents jitter) */}
            <div 
              className="parallax-node transition-transform duration-500 ease-out will-change-transform"
              data-speed={item.speed}
            >
              {/* CSS Animation Wrapper (constant slow bobbing) */}
              <div 
                style={{ 
                  animation: "float 6s ease-in-out infinite", 
                  animationDelay: item.delay 
                }}
              >
              {item.type === "image" ? (
                <div 
                  className={`neo-card overflow-hidden p-2 bg-white/40 backdrop-blur-md shadow-xl ${item.size} ${item.rotate} ${item.id > 3 ? 'hidden sm:block' : ''}`}
                  style={{
                    borderRadius: item.size.includes("rounded-full") ? "9999px" : "18px",
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden" 
                       style={{ borderRadius: item.size.includes("rounded-full") ? "9999px" : "10px" }}
                  >
                    <Image 
                      src={item.src!} 
                      alt="Travel Aesthetic" 
                      fill 
                      priority={item.id === 3}
                      sizes="300px"
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div 
                  className={`neo-card flex items-center justify-center bg-white/50 backdrop-blur-xl shadow-lg border border-white/60 ${item.size} ${item.rotate} rounded-[20px] ${item.id > 3 ? 'hidden sm:block' : ''}`}
                >
                  {item.icon}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Inject Global Float Data just once */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
    </div>
  );
}
