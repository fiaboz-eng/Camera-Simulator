import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { ShutterSpeedOption, SceneType } from '../types/camera';

export interface CameraCanvasRef {
  captureSnapshot: () => string;
}

interface CameraCanvasProps {
  aperture: number;
  shutter: ShutterSpeedOption;
  iso: number;
  deltaEV: number;
  targetEV: number;
  cameraEV: number;
  scene: SceneType;
  showGrid: boolean;
  showHistogram: boolean;
  showZebras: boolean;
  showPeaking: boolean;
  isShutterActive: boolean;
  onFocusLock?: () => void;
}

export const CameraCanvas = forwardRef<CameraCanvasRef, CameraCanvasProps>(
  (
    {
      aperture,
      shutter,
      iso,
      deltaEV,
      targetEV,
      cameraEV,
      scene,
      showGrid,
      showHistogram,
      showZebras,
      showPeaking,
      isShutterActive,
      onFocusLock,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);

    // Keep live refs for 60fps rendering loop without tearing
    const paramsRef = useRef({
      aperture,
      shutter,
      iso,
      deltaEV,
      targetEV,
      cameraEV,
      scene,
      showGrid,
      showHistogram,
      showZebras,
      showPeaking,
      isShutterActive,
    });

    useEffect(() => {
      paramsRef.current = {
        aperture,
        shutter,
        iso,
        deltaEV,
        targetEV,
        cameraEV,
        scene,
        showGrid,
        showHistogram,
        showZebras,
        showPeaking,
        isShutterActive,
      };
    }, [aperture, shutter, iso, deltaEV, targetEV, cameraEV, scene, showGrid, showHistogram, showZebras, showPeaking, isShutterActive]);

    const animFrameRef = useRef<number | null>(null);
    const rotationAngleRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(performance.now());
    const [afLocked, setAfLocked] = useState(false);
    const afTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Provide snapshot capture
    useImperativeHandle(ref, () => ({
      captureSnapshot: () => {
        if (!canvasRef.current) return '';
        return canvasRef.current.toDataURL('image/jpeg', 0.95);
      },
    }));

    // Handle AF bracket tap
    const handleAfTap = useCallback(() => {
      setAfLocked(true);
      if (onFocusLock) onFocusLock();
      if (afTimeoutRef.current) clearTimeout(afTimeoutRef.current);
      afTimeoutRef.current = setTimeout(() => {
        setAfLocked(false);
      }, 1800);
    }, [onFocusLock]);

    // Initialize noise texture canvas once
    useEffect(() => {
      const nCanvas = document.createElement('canvas');
      nCanvas.width = 256;
      nCanvas.height = 256;
      const nCtx = nCanvas.getContext('2d');
      if (nCtx) {
        const imgData = nCtx.createImageData(256, 256);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const val = Math.floor(Math.random() * 255);
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
          data[i + 3] = Math.floor(Math.random() * 180) + 40;
        }
        nCtx.putImageData(imgData, 0, 0);
        noiseCanvasRef.current = nCanvas;
      }
    }, []);

    // Main 60fps render loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const width = 960;
      const height = 600;
      canvas.width = width;
      canvas.height = height;

      // Angular velocity of the kinetic wheel (~ 3.5 revolutions per second)
      const wheelAngularSpeed = 7 * Math.PI;

      const render = (now: number) => {
        const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
        lastTimeRef.current = now;

        const p = paramsRef.current;

        // Advance wheel rotation
        rotationAngleRef.current =
          (rotationAngleRef.current + wheelAngularSpeed * dt) % (Math.PI * 2);

        // 1. APERTURE BLUR CALCULATION (Depth of Field)
        // Lower f-stop (f/1.4 - f/2.8): High background blur (16px to 24px)
        // High f-stop (f/11 - f/22): Crisp sharp background (0px blur)
        // Formula: Blur radius drops with f-stop number
        let bgBlurPx = 0;
        if (p.aperture <= 1.4) bgBlurPx = 22;
        else if (p.aperture <= 2.0) bgBlurPx = 17;
        else if (p.aperture <= 2.8) bgBlurPx = 12;
        else if (p.aperture <= 4.0) bgBlurPx = 7;
        else if (p.aperture <= 5.6) bgBlurPx = 4;
        else if (p.aperture <= 8.0) bgBlurPx = 1.5;
        else bgBlurPx = 0;

        // 2. SHUTTER SPEED MOTION BLUR CALCULATION
        // Fast shutter (> 1/500s): sampleCount = 1, blurArc = 0 (freezes completely)
        // Medium shutter (1/60s - 1/250s): slight blur
        // Slow shutter (< 1/60s): high blur arcs
        const shutterSec = p.shutter.value;
        const isFrozen = shutterSec <= 1 / 500;
        const blurArc = isFrozen ? 0 : wheelAngularSpeed * shutterSec;
        const sampleCount = isFrozen ? 1 : shutterSec >= 0.05 ? 14 : shutterSec >= 0.016 ? 8 : 4;

        // 3. EXPOSURE BRIGHTNESS & BLOWOUT CALCULATION
        // Delta EV = Target EV - User EV
        // If Delta EV == 0: 100% normal brightness
        // If Delta EV < 0: Underexposed (darken)
        // If Delta EV > 0: Overexposed (brighten + highlight blowout)
        const exposureMultiplier = Math.pow(2, p.deltaEV);
        const brightnessPct = Math.max(10, Math.min(260, exposureMultiplier * 100));

        // Clear canvas
        ctx.save();
        ctx.fillStyle = '#0a0a0d';
        ctx.fillRect(0, 0, width, height);

        // Render Background (with dynamic CSS / Canvas filter blur for shallow DoF)
        ctx.save();
        if (bgBlurPx > 0) {
          ctx.filter = `blur(${bgBlurPx}px)`;
        }
        renderSceneBackground(ctx, width, height, bgBlurPx, p.scene, now);
        ctx.restore();

        // Render Midground Subject (Tack-sharp focal plane, 0 blur)
        ctx.save();
        renderFocalSubject(ctx, width, height, p.scene, now);
        ctx.restore();

        // Render Dynamic Moving Element (Wheel / Wings / Traffic) with Shutter Speed Motion Blur
        ctx.save();
        renderDynamicElement(
          ctx,
          width,
          height,
          rotationAngleRef.current,
          blurArc,
          sampleCount,
          isFrozen,
          p.scene,
          now
        );
        ctx.restore();

        // 4. APPLY EXPOSURE TONE CURVE & OVEREXPOSURE BLOWOUT
        applyExposureTone(ctx, width, height, p.deltaEV, exposureMultiplier, brightnessPct);

        // 5. APPLY ISO NOISE & SENSOR GRAIN OVERLAY (High ISO > 1600 injects visible animated grain)
        if (p.iso >= 400 && noiseCanvasRef.current) {
          applyIsoGrainOverlay(ctx, width, height, p.iso, noiseCanvasRef.current, now);
        }

        // 6. HIGHLIGHT ZEBRAS (If enabled and overexposed)
        if (p.showZebras && p.deltaEV > 0.3) {
          renderZebraStripes(ctx, width, height, now);
        }

        // 7. FOCUS PEAKING (If enabled)
        if (p.showPeaking) {
          renderFocusPeaking(ctx, width, height);
        }

        // 8. VIEWFINDER HUD OVERLAYS
        renderViewfinderHud(ctx, width, height, p.showGrid, afLocked, now);

        // 9. LIVE HISTOGRAM (If enabled)
        if (p.showHistogram) {
          renderFastLiveHistogram(ctx, width, height, p.deltaEV);
        }

        // 10. SHUTTER CURTAIN FLASH BLACKOUT
        if (p.isShutterActive) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.restore();

        animFrameRef.current = requestAnimationFrame(render);
      };

      animFrameRef.current = requestAnimationFrame(render);

      return () => {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }, []);

    return (
      <div className="relative w-full aspect-[16/10] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl group select-none">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleAfTap}
          className="w-full h-full object-contain cursor-crosshair block"
        />

        {/* Viewfinder Top-Left Info Strip */}
        <div className="absolute top-3 left-4 flex items-center gap-2 sm:gap-3 text-[11px] font-mono tracking-wider pointer-events-none drop-shadow-md">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ภาพสด 60FPS</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-amber-400">
            <span>เป้าหมาย: EV {targetEV.toFixed(1)}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-neutral-300 hidden sm:block">
            <span>ค่ากล้อง: EV {cameraEV.toFixed(1)}</span>
          </div>
        </div>

        {/* Viewfinder Top-Right Battery & Exposure Readout */}
        <div className="absolute top-3 right-4 flex items-center gap-2 text-[11px] font-mono tracking-wider pointer-events-none drop-shadow-md">
          <div
            className={`px-2 py-0.5 rounded backdrop-blur-xs border font-bold ${
              Math.abs(deltaEV) <= 0.3
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : deltaEV < 0
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
            }`}
          >
            <span>{deltaEV > 0 ? `+${deltaEV.toFixed(1)}` : deltaEV.toFixed(1)} EV</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-emerald-400 flex items-center gap-1">
            <div className="w-3.5 h-2 border border-emerald-400/80 rounded-[1px] p-[1px] flex items-center">
              <div className="w-full h-full bg-emerald-400" />
            </div>
            <span>94%</span>
          </div>
        </div>

        {/* Bottom Prompts */}
        <div className="absolute bottom-3 left-4 text-[10px] font-mono text-neutral-300/90 pointer-events-none drop-shadow hidden sm:block">
          <span>แตะที่ภาพเพื่อล็อคโฟกัสอัตโนมัติ (AF)</span>
        </div>

        <div className="absolute bottom-3 right-4 text-[10px] font-mono text-neutral-300/90 uppercase pointer-events-none drop-shadow">
          <span>
            {shutter.value <= 1 / 500
              ? '● หยุดภาพนิ่งสนิท'
              : shutter.value >= 1 / 8
              ? '● ภาพเบลอเป็นสาย'
              : '● ชัตเตอร์ปกติ'}
          </span>
        </div>
      </div>
    );
  }
);

CameraCanvas.displayName = 'CameraCanvas';

/**
 * 1. Background Renderer with Depth-of-Field & Expanding Bokeh Discs
 */
function renderSceneBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  blurRadius: number,
  scene: SceneType,
  time: number
) {
  if (scene === 'studio_wheel') {
    // Warm gradient studio backdrop
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      40,
      width * 0.5,
      height * 0.5,
      width * 0.75
    );
    grad.addColorStop(0, '#382a24');
    grad.addColorStop(0.5, '#1e191a');
    grad.addColorStop(1, '#0c0a0c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Architectural shelves and warm accent lights
    ctx.fillStyle = 'rgba(55, 45, 40, 0.45)';
    ctx.fillRect(width * 0.05, height * 0.22, width * 0.22, height * 0.5);
    ctx.fillStyle = 'rgba(60, 48, 42, 0.4)';
    ctx.fillRect(width * 0.72, height * 0.18, width * 0.24, height * 0.55);

    // Warm bokeh discs simulating out-of-focus background light sources
    const bokehDiscs = [
      { x: width * 0.12, y: height * 0.26, baseR: 24, c: '255, 185, 110' },
      { x: width * 0.22, y: height * 0.36, baseR: 34, c: '255, 210, 140' },
      { x: width * 0.16, y: height * 0.6, baseR: 20, c: '235, 140, 80' },
      { x: width * 0.78, y: height * 0.24, baseR: 32, c: '255, 200, 130' },
      { x: width * 0.88, y: height * 0.4, baseR: 22, c: '240, 160, 90' },
      { x: width * 0.82, y: height * 0.64, baseR: 28, c: '255, 220, 160' },
      { x: width * 0.65, y: height * 0.3, baseR: 18, c: '255, 190, 120' },
      { x: width * 0.34, y: height * 0.18, baseR: 22, c: '255, 230, 180' },
    ];

    // As blurRadius increases (wide aperture f/1.4 - f/2.8), discs expand into luminous circles
    for (const b of bokehDiscs) {
      const expansion = Math.max(0.3, blurRadius * 0.16 + 0.35);
      const discR = b.baseR * expansion;
      const alpha = Math.min(0.85, 0.25 + (blurRadius / 22) * 0.55);

      const radGrad = ctx.createRadialGradient(b.x, b.y, discR * 0.1, b.x, b.y, discR);
      radGrad.addColorStop(0, `rgba(${b.c}, ${alpha * 0.95})`);
      radGrad.addColorStop(0.7, `rgba(${b.c}, ${alpha * 0.65})`);
      radGrad.addColorStop(1, `rgba(${b.c}, 0)`);

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, discR, 0, Math.PI * 2);
      ctx.fill();

      // Sharp bokeh aperture ring edge when wide open
      if (blurRadius > 8) {
        ctx.strokeStyle = `rgba(${b.c}, ${alpha * 0.45})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  } else if (scene === 'night_traffic') {
    const nightGrad = ctx.createLinearGradient(0, 0, 0, height);
    nightGrad.addColorStop(0, '#04060d');
    nightGrad.addColorStop(0.6, '#0b1122');
    nightGrad.addColorStop(1, '#070a12');
    ctx.fillStyle = nightGrad;
    ctx.fillRect(0, 0, width, height);

    // City skyscrapers
    const buildings = [
      { x: 30, w: 90, h: 280 },
      { x: 130, w: 110, h: 360 },
      { x: 250, w: 80, h: 220 },
      { x: 620, w: 100, h: 340 },
      { x: 730, w: 120, h: 260 },
      { x: 860, w: 90, h: 300 },
    ];
    ctx.fillStyle = '#0f172a';
    for (const b of buildings) {
      ctx.fillRect(b.x, height - b.h, b.w, b.h);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      const winBokeh = Math.max(1.2, blurRadius * 0.25);
      for (let wy = height - b.h + 20; wy < height - 60; wy += 28) {
        for (let wx = b.x + 12; wx < b.x + b.w - 15; wx += 20) {
          ctx.beginPath();
          ctx.arc(wx, wy, winBokeh, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = '#0f172a';
    }
  } else {
    // Garden background
    const gardenGrad = ctx.createLinearGradient(0, 0, 0, height);
    gardenGrad.addColorStop(0, '#1c2826');
    gardenGrad.addColorStop(0.5, '#16221c');
    gardenGrad.addColorStop(1, '#0e1713');
    ctx.fillStyle = gardenGrad;
    ctx.fillRect(0, 0, width, height);

    const floraBokeh = [
      { x: width * 0.15, y: height * 0.25, r: 30, c: '74, 222, 128' },
      { x: width * 0.22, y: height * 0.55, r: 25, c: '244, 63, 94' },
      { x: width * 0.78, y: height * 0.3, r: 35, c: '250, 204, 21' },
      { x: width * 0.85, y: height * 0.6, r: 28, c: '244, 114, 182' },
      { x: width * 0.68, y: height * 0.75, r: 32, c: '34, 197, 94' },
    ];
    for (const f of floraBokeh) {
      const discR = Math.max(4, f.r * (blurRadius * 0.18 + 0.35));
      ctx.fillStyle = `rgba(${f.c}, 0.5)`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, discR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * 2. Midground Subject at Tack-Sharp Focal Plane (0 blur)
 */
function renderFocalSubject(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: SceneType,
  time: number
) {
  if (scene === 'studio_wheel') {
    const cx = width * 0.5;
    const cy = height * 0.52;

    // Pedestal base & column
    ctx.fillStyle = '#262930';
    ctx.fillRect(cx - 14, cy + 90, 28, height - (cy + 90) - 20);

    // Bevel highlights
    ctx.fillStyle = '#404450';
    ctx.fillRect(cx - 10, cy + 90, 4, height - (cy + 90) - 20);

    // Cast base plate
    ctx.fillStyle = '#1c1e24';
    ctx.beginPath();
    ctx.ellipse(cx, height - 25, 110, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a5060';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Central mounting bracket & bearing hub
    ctx.fillStyle = '#323742';
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a6275';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Screw bolts
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const bx = cx + Math.cos(a) * 22;
      const by = cy + Math.sin(a) * 22;
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (scene === 'night_traffic') {
    const cx = width * 0.5;
    const cy = height * 0.52;
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 12, cy - 140, 24, height - cy + 100);

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 40, cy - 110, 80, 220, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(cx, cy + 50, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#372010';
    ctx.beginPath();
    ctx.arc(cx, cy - 5, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#381414';
    ctx.beginPath();
    ctx.arc(cx, cy - 60, 22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Flower in garden
    const cx = width * 0.58;
    const cy = height * 0.62;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx + 60, height);
    ctx.quadraticCurveTo(cx + 40, cy + 80, cx, cy);
    ctx.stroke();

    const petalColors = ['#f43f5e', '#fb7185', '#fda4af', '#f43f5e'];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.fillStyle = petalColors[i % petalColors.length];
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * 35, cy + Math.sin(a) * 35, 30, 14, a, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#be123c';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 3. Dynamic Moving Element with Shutter Speed Motion Blur vs Action Freeze
 */
function renderDynamicElement(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  currentAngle: number,
  blurArc: number,
  sampleCount: number,
  isFrozen: boolean,
  scene: SceneType,
  time: number
) {
  if (scene === 'studio_wheel') {
    const cx = width * 0.5;
    const cy = height * 0.52;
    const radius = 172;

    const sectorColors = [
      '#ef4444', // Red
      '#f97316', // Orange
      '#eab308', // Yellow
      '#22c55e', // Green
      '#06b6d4', // Cyan
      '#3b82f6', // Blue
      '#8b5cf6', // Violet
      '#ec4899', // Pink
    ];

    if (isFrozen) {
      // 100% FROZEN ACTION (> 1/500s)
      // Single razor-sharp rendering of wheel
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(currentAngle);

      for (let i = 0; i < 8; i++) {
        const startRad = (i * Math.PI) / 4;
        const endRad = ((i + 1) * Math.PI) / 4;

        ctx.fillStyle = sectorColors[i];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startRad, endRad);
        ctx.closePath();
        ctx.fill();

        // Razor-sharp divider
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Exact high-contrast number markers
        const midRad = startRad + Math.PI / 8;
        const textX = Math.cos(midRad) * (radius * 0.72);
        const textY = Math.sin(midRad) * (radius * 0.72);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(midRad + Math.PI / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, 0, 0);
        ctx.restore();
      }

      // Outer rim
      ctx.strokeStyle = '#1e222b';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    } else {
      // SLOW / MEDIUM SHUTTER SPEED MOTION BLUR
      // Multi-sample temporal motion blur synthesis
      const sampleAlpha = 1 / sampleCount;

      for (let s = 0; s < sampleCount; s++) {
        const subOffset = (s / Math.max(1, sampleCount - 1)) * blurArc;
        const angle = currentAngle - subOffset;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.globalAlpha = sampleAlpha;

        for (let i = 0; i < 8; i++) {
          const startRad = (i * Math.PI) / 4;
          const endRad = ((i + 1) * Math.PI) / 4;

          ctx.fillStyle = sectorColors[i];
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, startRad, endRad);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // If blurArc is small, numbers are readable; if large, they smear
          if (blurArc < Math.PI * 0.8) {
            const midRad = startRad + Math.PI / 8;
            const textX = Math.cos(midRad) * (radius * 0.72);
            const textY = Math.sin(midRad) * (radius * 0.72);

            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(midRad + Math.PI / 2);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 19px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${i + 1}`, 0, 0);
            ctx.restore();
          }
        }

        ctx.strokeStyle = '#1e222b';
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    }

    // Static center hub cap (unaffected by motion blur)
    ctx.fillStyle = '#1e2025';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (scene === 'night_traffic') {
    const yRoad = height * 0.85;
    const baseProgress = (time * 0.0006) % 1;

    if (isFrozen) {
      const carX = baseProgress * (width + 200) - 100;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(carX, yRoad, 8, 0, Math.PI * 2);
      ctx.arc(carX + 45, yRoad, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const sampleAlpha = 1 / sampleCount;
      for (let s = 0; s < sampleCount; s++) {
        const lag = (s / Math.max(1, sampleCount - 1)) * (blurArc * 14);
        const prog = (baseProgress - lag * 0.01 + 10) % 1;
        const carX = prog * (width + 200) - 100;

        ctx.save();
        ctx.globalAlpha = sampleAlpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(carX, yRoad, 8, 0, Math.PI * 2);
        ctx.arc(carX + 45, yRoad, 8, 0, Math.PI * 2);
        ctx.fill();

        const progBack = (1 - prog * 1.2) % 1;
        const tailX = progBack * (width + 200) - 100;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tailX, yRoad + 28, 6, 0, Math.PI * 2);
        ctx.arc(tailX + 40, yRoad + 28, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  } else {
    // Hummingbird
    const birdX = width * 0.42;
    const birdY = height * 0.48;

    ctx.save();
    ctx.translate(birdX, birdY);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(15, -4);
    ctx.lineTo(85, 20);
    ctx.stroke();

    const bodyGrad = ctx.createLinearGradient(-35, -20, 30, 20);
    bodyGrad.addColorStop(0, '#047857');
    bodyGrad.addColorStop(0.5, '#10b981');
    bodyGrad.addColorStop(1, '#065f46');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 18, -Math.PI / 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(16, -2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(22, -8, 3, 0, Math.PI * 2);
    ctx.fill();

    if (isFrozen) {
      // Frozen wings
      ctx.save();
      ctx.translate(-5, -10);
      ctx.rotate(-0.4);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(15, -45, 0, -85);
      ctx.quadraticCurveTo(-20, -50, 0, 0);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    } else {
      // Motion blur wings
      const wingSamples = sampleCount;
      const sampleAlpha = 1 / wingSamples;
      for (let s = 0; s < wingSamples; s++) {
        const wingPhase = time * 0.08 - (s / Math.max(1, wingSamples - 1)) * (blurArc * 8);
        const wingFlapAngle = Math.sin(wingPhase) * 1.1;

        ctx.save();
        ctx.globalAlpha = sampleAlpha;
        ctx.translate(-5, -10);
        ctx.rotate(wingFlapAngle);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(15, -45, 0, -85);
        ctx.quadraticCurveTo(-20, -50, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }
}

/**
 * 4. Exposure Tone Curve & Overexposure Blowout Engine
 * Dynamically adjusts brightness:
 * - If deltaEV matches Target EV (deltaEV == 0): brightness 100% normal
 * - If underexposed (deltaEV < 0): darken scene to crushed shadows
 * - If overexposed (deltaEV > 0): blow out with pure white highlights
 */
function applyExposureTone(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  deltaEV: number,
  exposureMultiplier: number,
  brightnessPct: number
) {
  if (Math.abs(deltaEV) < 0.05) return;

  if (deltaEV < 0) {
    // UNDEREXPOSED: Darken scene proportionally
    // Darkness overlay opacity increases as deltaEV goes from 0 to -3
    const darkenAlpha = Math.min(0.92, Math.abs(deltaEV) * 0.28);
    ctx.save();
    ctx.fillStyle = `rgba(5, 5, 8, ${darkenAlpha})`;
    ctx.fillRect(0, 0, width, height);

    // Deep shadow crush when severely underexposed
    if (deltaEV < -1.5) {
      const crushAlpha = Math.min(0.8, (Math.abs(deltaEV) - 1.5) * 0.35);
      ctx.fillStyle = `rgba(0, 0, 0, ${crushAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  } else {
    // OVEREXPOSED: Brighten scene and blow out with white highlights!
    const blowAlpha = Math.min(0.85, deltaEV * 0.26);

    ctx.save();
    // 1. Overall brightness boost wash
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255, 255, 255, ${blowAlpha})`;
    ctx.fillRect(0, 0, width, height);

    // 2. Center specular highlight blowout bloom
    const radialBlow = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      60,
      width * 0.5,
      height * 0.5,
      width * 0.55
    );
    radialBlow.addColorStop(0, `rgba(255, 255, 255, ${Math.min(0.95, blowAlpha * 1.5)})`);
    radialBlow.addColorStop(0.5, `rgba(255, 255, 255, ${blowAlpha * 0.8})`);
    radialBlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = radialBlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Blown-out white paper clipping if severely overexposed (> +1.5 EV)
    if (deltaEV > 1.5) {
      const clipAlpha = Math.min(0.7, (deltaEV - 1.5) * 0.4);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(255, 255, 255, ${clipAlpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }
}

/**
 * 5. ISO Noise & Sensor Grain Overlay
 * High ISO (> 1600) injects an animated procedural canvas grain overlay
 */
function applyIsoGrainOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  iso: number,
  noiseCanvas: HTMLCanvasElement,
  time: number
) {
  // Grain intensity by ISO:
  // ISO 100 - 400: virtually invisible
  // ISO 800: subtle fine grain
  // ISO 1600: ~0.12
  // ISO 3200: ~0.24
  // ISO 6400: ~0.38
  let grainOpacity = 0;
  if (iso <= 400) grainOpacity = 0.02;
  else if (iso <= 800) grainOpacity = 0.06;
  else if (iso <= 1600) grainOpacity = 0.14;
  else if (iso <= 3200) grainOpacity = 0.25;
  else grainOpacity = 0.38;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = grainOpacity;

  // Animate grain texture coordinates at 60fps with random jitter
  const offsetX = (Math.sin(time * 0.05) * 128 + time * 17) % 256;
  const offsetY = (Math.cos(time * 0.05) * 128 + time * 23) % 256;

  const pattern = ctx.createPattern(noiseCanvas, 'repeat');
  if (pattern) {
    ctx.translate(offsetX, offsetY);
    ctx.fillStyle = pattern;
    ctx.fillRect(-offsetX, -offsetY, width, height);
  }

  ctx.restore();
}

/**
 * 6. Highlight Zebra Stripes Warning
 */
function renderZebraStripes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  ctx.save();
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 16;
  patternCanvas.height = 16;
  const pctx = patternCanvas.getContext('2d');
  if (pctx) {
    pctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    pctx.fillRect(0, 0, 16, 16);
    pctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    pctx.lineWidth = 2.5;
    pctx.beginPath();
    pctx.moveTo(0, 16);
    pctx.lineTo(16, 0);
    pctx.stroke();

    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(width * 0.25, height * 0.2, width * 0.5, height * 0.6);
    }
  }
  ctx.restore();
}

/**
 * 7. Focus Peaking Overlay
 */
function renderFocusPeaking(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 4;

  const cx = width * 0.5;
  const cy = height * 0.52;
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.rect(cx - 15, cy + 90, 30, 80);
  ctx.stroke();

  ctx.restore();
}

/**
 * 8. Viewfinder HUD Overlays
 */
function renderViewfinderHud(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  showGrid: boolean,
  afLocked: boolean,
  time: number
) {
  ctx.save();

  if (showGrid) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);

    ctx.beginPath();
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.moveTo((2 * width) / 3, 0);
    ctx.lineTo((2 * width) / 3, height);

    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (2 * height) / 3);
    ctx.lineTo(width, (2 * height) / 3);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // AF Bracket
  const cx = width * 0.5;
  const cy = height * 0.5;
  const boxSize = 44;
  const bracketColor = afLocked ? '#10b981' : 'rgba(255, 255, 255, 0.7)';

  ctx.strokeStyle = bracketColor;
  ctx.lineWidth = 2;
  const cornerLen = 10;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(cx - boxSize, cy - boxSize + cornerLen);
  ctx.lineTo(cx - boxSize, cy - boxSize);
  ctx.lineTo(cx - boxSize + cornerLen, cy - boxSize);
  // Top-right
  ctx.moveTo(cx + boxSize - cornerLen, cy - boxSize);
  ctx.lineTo(cx + boxSize, cy - boxSize);
  ctx.lineTo(cx + boxSize, cy - boxSize + cornerLen);
  // Bottom-left
  ctx.moveTo(cx - boxSize, cy + boxSize - cornerLen);
  ctx.lineTo(cx - boxSize, cy + boxSize);
  ctx.lineTo(cx - boxSize + cornerLen, cy + boxSize);
  // Bottom-right
  ctx.moveTo(cx + boxSize - cornerLen, cy + boxSize);
  ctx.lineTo(cx + boxSize, cy + boxSize);
  ctx.lineTo(cx + boxSize, cy + boxSize - cornerLen);
  ctx.stroke();

  ctx.fillStyle = bracketColor;
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();

  if (afLocked) {
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px "Prompt", "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AF-C [โฟกัสเข้าเป้า]', cx, cy + boxSize + 16);
  }

  ctx.restore();
}

/**
 * 9. Real-time Live RGB Histogram
 */
function renderFastLiveHistogram(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  deltaEV: number
) {
  ctx.save();
  const histW = 140;
  const histH = 70;
  const histX = width - histW - 16;
  const histY = height - histH - 16;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(histX, histY, histW, histH, 4);
  ctx.fill();
  ctx.stroke();

  // Synthesize realistic bell-curve histogram shifted dynamically by deltaEV
  // When underexposed, peaks on the left (shadows).
  // When overexposed, peaks on the right (highlights).
  const centerShift = Math.max(0.1, Math.min(0.9, 0.5 + deltaEV * 0.18));

  const drawCurve = (color: string, offset: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const xPct = i / 30;
      const px = histX + xPct * histW;
      const dist = (xPct - (centerShift + offset)) * 3;
      const h = Math.exp(-dist * dist) * (histH - 16);
      const py = histY + histH - h - 4;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  };

  ctx.globalCompositeOperation = 'screen';
  drawCurve('rgba(239, 68, 68, 0.85)', -0.04);
  drawCurve('rgba(34, 197, 94, 0.85)', 0.0);
  drawCurve('rgba(59, 130, 246, 0.85)', 0.04);
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillText('RGB HIST', histX + 6, histY + 12);

  ctx.restore();
}
