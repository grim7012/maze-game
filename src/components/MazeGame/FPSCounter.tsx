import React, { useEffect, useRef, useState } from 'react';
import './FpsCounter.css';

interface FpsCounterProps {
  targetFps?: number;
}

export const FpsCounter: React.FC<FpsCounterProps> = ({ targetFps = 60 }) => {
  const [fps, setFps] = useState(targetFps);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const updateFps = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      requestAnimationFrame(updateFps);
    };

    const animationId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animationId);
  }, [targetFps]);

  const getFpsColor = () => {
    if (fps >= 55) return '#4CAF50'; // Green - excellent
    if (fps >= 45) return '#FFC107'; // Yellow - good
    if (fps >= 30) return '#FF9800'; // Orange - okay
    return '#F44336'; // Red - poor
  };

  return (
    <div className="fps-counter" style={{ color: getFpsColor() }}>
      {fps} FPS
    </div>
  );
};