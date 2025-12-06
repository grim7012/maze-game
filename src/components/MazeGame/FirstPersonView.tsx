import React, { useEffect, useRef, useMemo } from 'react';
import { GameEngine } from '../../core/game/GameEngine';
import './styles.css';

interface FirstPersonViewProps {
  gameEngine: GameEngine;
  width: number;
  height: number;
}

interface WallTexture {
  color: string;
  pattern: number[]; // For texture patterns
  lightAbsorption: number;
}

export const FirstPersonView: React.FC<FirstPersonViewProps> = ({
  gameEngine,
  width,
  height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Pre-calculated gradients and textures for better performance
  const textures = useMemo(() => ({
    skyGradient: (ctx: CanvasRenderingContext2D, canvasHeight: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.6);
      gradient.addColorStop(0, '#1e3c72');
      gradient.addColorStop(0.5, '#2a5298');
      gradient.addColorStop(1, '#87CEEB');
      return gradient;
    },
    floorGradient: (ctx: CanvasRenderingContext2D, canvasHeight: number) => {
      const gradient = ctx.createLinearGradient(0, canvasHeight * 0.5, 0, canvasHeight);
      gradient.addColorStop(0, '#5D4037');
      gradient.addColorStop(0.5, '#4E342E');
      gradient.addColorStop(1, '#3E2723');
      return gradient;
    },
    wallTextures: [
      { color: '#8B7355', pattern: [0.8, 0.6, 0.4], lightAbsorption: 0.7 }, // Brown stone
      { color: '#757575', pattern: [0.7, 0.7, 0.7], lightAbsorption: 0.8 }, // Gray stone
      { color: '#5D4037', pattern: [0.6, 0.4, 0.3], lightAbsorption: 0.9 }, // Dark wood
    ] as WallTexture[],
    getWallColor: (distance: number, maxDistance: number, textureIndex: number = 0): string => {
      const texture = textures.wallTextures[textureIndex % textures.wallTextures.length];
      const normalizedDistance = Math.max(0, 1 - (distance / maxDistance));
      const absorption = texture.lightAbsorption;
      
      // Apply distance-based darkening with texture absorption
      const brightness = Math.pow(normalizedDistance, 1.5) * 255;
      
      // Parse base color
      const hex = texture.color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Apply brightness and texture pattern
      const pattern = texture.pattern;
      const finalR = Math.floor(r * (brightness / 255) * pattern[0] * absorption);
      const finalG = Math.floor(g * (brightness / 255) * pattern[1] * absorption);
      const finalB = Math.floor(b * (brightness / 255) * pattern[2] * absorption);
      
      return `rgb(${finalR}, ${finalG}, ${finalB})`;
    }
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Performance optimization: Use image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const render = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Clear canvas efficiently
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      const state = gameEngine.getState();
      const config = gameEngine.getConfig();

      // Draw sky with gradient
      const skyHeight = height * 0.55; // Slightly more sky for better perspective
      ctx.fillStyle = textures.skyGradient(ctx, height);
      ctx.fillRect(0, 0, width, skyHeight);

      // Draw floor with gradient
      ctx.fillStyle = textures.floorGradient(ctx, height);
      ctx.fillRect(0, skyHeight, width, height - skyHeight);

      // Draw horizon line (optional, adds depth)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, skyHeight);
      ctx.lineTo(width, skyHeight);
      ctx.stroke();

      // Raycasting with optimizations
      const fov = config.fov;
      const numRays = Math.min(width, 400); // Limit rays for performance
      const rayStep = width / numRays;
      
      // Draw fog/distance effect
      const fogGradient = ctx.createLinearGradient(0, 0, 0, height);
      fogGradient.addColorStop(0, 'rgba(135, 206, 235, 0.1)');
      fogGradient.addColorStop(0.5, 'rgba(135, 206, 235, 0.05)');
      fogGradient.addColorStop(1, 'rgba(93, 109, 126, 0.1)');

      for (let i = 0; i < numRays; i++) {
        const x = i * rayStep;
        const screenX = x + rayStep / 2; // Sample from middle of slice
        
        // Calculate ray angle with slight offset for anti-aliasing
        const rayAngle = state.player.rotation - fov / 2 + (screenX / width) * fov;
        
        // Cast ray
        const distance = gameEngine.raycast(rayAngle);
        const maxDistance = config.maxRayDistance;
        
        // Calculate wall height with perspective correction
        const correctedDistance =
        Number(distance) * Math.cos(Number(rayAngle) - Number(state.player.rotation));

        const wallHeight = Math.min(
        (Number(height) / correctedDistance) * 1.5,
        Number(height) * 2
        );

        // Wall position
        const wallTop = Math.max(0, skyHeight - wallHeight / 2);
        const wallBottom = Math.min(height, wallTop + wallHeight);
        
        // Texture variation based on position
        const textureIndex = Math.floor((screenX / width) * textures.wallTextures.length);
        
        // Draw wall slice with texture and lighting
       if (distance.distance < maxDistance) {
  ctx.fillStyle = textures.getWallColor(correctedDistance, maxDistance, textureIndex);
  ctx.fillRect(x, wallTop, rayStep + 0.5, wallBottom - wallTop);
   
          // Add wall edge shading (3D effect)
          ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * (1 - correctedDistance / maxDistance)})`;
          ctx.fillRect(x, wallTop, 1, wallBottom - wallTop);
          
          // Add texture pattern (vertical stripes)
          if (Math.floor(screenX) % 8 < 4) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.05 * (1 - correctedDistance / maxDistance)})`;
            ctx.fillRect(x, wallTop, rayStep * 0.3, wallBottom - wallTop);
          }
        } else {
          // Draw distance fog for far walls
          ctx.fillStyle = fogGradient;
          ctx.fillRect(x, wallTop, rayStep, wallBottom - wallTop);
        }
        
        // Draw floor shading with perspective
        if (wallBottom < height) {
          const floorHeight = height - wallBottom;
          const floorShading = ctx.createLinearGradient(x, wallBottom, x, height);
          const darkness = 0.7 * (1 - Math.min(correctedDistance / maxDistance, 1));
          
          floorShading.addColorStop(0, `rgba(0, 0, 0, ${darkness})`);
          floorShading.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
          
          ctx.fillStyle = floorShading;
          ctx.fillRect(x, wallBottom, rayStep, floorHeight);
        }
        
        // Draw ceiling shading
        if (wallTop > 0) {
          const ceilingShading = ctx.createLinearGradient(x, 0, x, wallTop);
          const darkness = 0.4 * (1 - Math.min(correctedDistance / maxDistance, 1));
          
          ceilingShading.addColorStop(0, `rgba(0, 0, 0, ${darkness})`);
          ceilingShading.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = ceilingShading;
          ctx.fillRect(x, 0, rayStep, wallTop);
        }
      }

      // Draw enhanced crosshair
      drawCrosshair(ctx, width, height);
      
      // Draw distance fog overlay
      ctx.fillStyle = 'rgba(135, 206, 235, 0.05)';
      ctx.fillRect(0, 0, width, height);

      // Draw vignette effect
      drawVignette(ctx, width, height);
      
      // Draw subtle scanlines (optional retro effect)
      drawScanlines(ctx, width, height, deltaTime);
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const drawCrosshair = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Outer circle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner dot with glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawVignette = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawScanlines = (ctx: CanvasRenderingContext2D, width: number, height: number, deltaTime: number) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let y = 0; y < height; y += 2) {
        ctx.fillRect(0, y, width, 1);
      }
      
      // Subtle flicker effect
      const flicker = Math.sin(Date.now() / 1000) * 0.02 + 0.98;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.02 * flicker})`;
      ctx.fillRect(0, 0, width, height);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameEngine, width, height, textures]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // If using responsive design, update dimensions here
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="first-person-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="first-person-canvas"
        aria-label="First-person 3D maze view"
      />
      <div className="view-overlay">
        <div className="overlay-text">3D MAZE EXPLORER</div>
        <div className="fps-counter" id="fps-counter">60 FPS</div>
      </div>
    </div>
  );
};