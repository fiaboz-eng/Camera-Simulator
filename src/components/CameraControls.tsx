import React from 'react';
import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
  ShutterSpeedOption,
  CameraMode,
} from '../types/camera';
import { cameraAudio } from '../utils/audio';
import { Minus, Plus, AlertTriangle, Disc, Timer, Zap } from 'lucide-react';

interface CameraControlsProps {
  aperture: number;
  shutter: ShutterSpeedOption;
  iso: number;
  mode: CameraMode;
  onApertureChange: (value: number) => void;
  onShutterChange: (value: ShutterSpeedOption) => void;
  onIsoChange: (value: number) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  aperture,
  shutter,
  iso,
  mode,
  onApertureChange,
  onShutterChange,
  onIsoChange,
}) => {
  const apertureIdx = APERTURE_VALUES.indexOf(aperture);
  const shutterIdx = SHUTTER_SPEEDS.findIndex((s) => s.fractionText === shutter.fractionText);
  const isoIdx = ISO_VALUES.indexOf(iso);

  // Aperture adjustments
  const handleApertureStep = (dir: number) => {
    const nextIdx = Math.max(0, Math.min(APERTURE_VALUES.length - 1, apertureIdx + dir));
    if (nextIdx !== apertureIdx) {
      cameraAudio.playDialClick();
      onApertureChange(APERTURE_VALUES[nextIdx]);
    }
  };

  const handleApertureSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (idx !== apertureIdx) {
      cameraAudio.playDialClick();
      onApertureChange(APERTURE_VALUES[idx]);
    }
  };

  // Shutter adjustments
  const handleShutterStep = (dir: number) => {
    const nextIdx = Math.max(0, Math.min(SHUTTER_SPEEDS.length - 1, shutterIdx + dir));
    if (nextIdx !== shutterIdx) {
      cameraAudio.playDialClick();
      onShutterChange(SHUTTER_SPEEDS[nextIdx]);
    }
  };

  const handleShutterSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (idx !== shutterIdx) {
      cameraAudio.playDialClick();
      onShutterChange(SHUTTER_SPEEDS[idx]);
    }
  };

  // ISO adjustments
  const handleIsoStep = (dir: number) => {
    const nextIdx = Math.max(0, Math.min(ISO_VALUES.length - 1, isoIdx + dir));
    if (nextIdx !== isoIdx) {
      cameraAudio.playDialClick();
      onIsoChange(ISO_VALUES[nextIdx]);
    }
  };

  const handleIsoSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (idx !== isoIdx) {
      cameraAudio.playDialClick();
      onIsoChange(ISO_VALUES[idx]);
    }
  };

  // Physical Iris hole radius calculation for visualizer (normalized 12px to 38px)
  // f/1.4 -> max open (36px); f/22 -> tiny pinhole (6px)
  const irisRadius = Math.max(6, 38 - (apertureIdx / (APERTURE_VALUES.length - 1)) * 32);

  // Is shutter speed slow enough to risk camera shake? (< 1/60s)
  const isHandheldShakeWarning = shutter.value > 1 / 60;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. APERTURE CONTROL POD */}
      <div
        className={`bg-neutral-900/90 border rounded-xl p-4 shadow-xl flex flex-col justify-between transition-all ${
          mode === 'Tv'
            ? 'opacity-80 border-neutral-800'
            : 'border-amber-500/30 hover:border-amber-500/50'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <Disc className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block">
                  รูรับแสง (Aperture - Av)
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  ความชัดลึก · หน้าชัดหลังเบลอ
                </span>
              </div>
            </div>

            {mode === 'Tv' && (
              <span className="text-[10px] font-mono text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded">
                อัตโนมัติ [Tv]
              </span>
            )}
          </div>

          {/* Value Display with Visual Iris Diaphragm */}
          <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 border border-neutral-800 mb-4">
            <div>
              <div className="text-2xl font-mono font-bold tracking-tight text-white tabular-nums">
                f/{aperture.toFixed(1)}
              </div>
              <div className="text-[10px] font-mono text-neutral-300 mt-0.5">
                {aperture <= 2.8 ? 'หน้าชัดหลังเบลอสวย (รูกว้าง)' : aperture >= 11 ? 'ชัดลึกทั้งภาพ (รูแคบ)' : 'ระยะชัดลึกปานกลาง'}
              </div>
            </div>

            {/* Physical Aperture Iris Diaphragm Graphic */}
            <div className="relative w-12 h-12 rounded-full bg-neutral-950 border border-neutral-700 flex items-center justify-center overflow-hidden shadow-inner">
              {/* Outer lens body */}
              <div
                className="rounded-full bg-amber-400 transition-all duration-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                style={{
                  width: `${irisRadius * 2}px`,
                  height: `${irisRadius * 2}px`,
                }}
              />
              {/* Overlapping iris blades illusion */}
              <div className="absolute inset-0 rounded-full border border-neutral-800 pointer-events-none" />
            </div>
          </div>

          {/* Stepper Buttons and Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApertureStep(-1)}
                disabled={apertureIdx <= 0 || mode === 'Tv'}
                aria-label="เปิดรูรับแสงกว้างขึ้น"
                title="เปิดรูรับแสงกว้างขึ้น (-1 stop)"
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-neutral-700 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0"
                max={APERTURE_VALUES.length - 1}
                step="1"
                value={apertureIdx}
                disabled={mode === 'Tv'}
                onChange={handleApertureSlider}
                className="w-full accent-amber-500 disabled:opacity-50"
              />

              <button
                onClick={() => handleApertureStep(1)}
                disabled={apertureIdx >= APERTURE_VALUES.length - 1 || mode === 'Tv'}
                aria-label="หรี่รูรับแสงแคบลง"
                title="หรี่รูรับแสงแคบลง (+1 stop)"
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-neutral-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Clickable Stops */}
            <div className="flex justify-between text-[9px] font-mono text-neutral-500 pt-1">
              {APERTURE_VALUES.map((val, idx) => (
                <button
                  key={val}
                  onClick={() => {
                    if (mode !== 'Tv') {
                      cameraAudio.playDialClick();
                      onApertureChange(val);
                    }
                  }}
                  className={`hover:text-amber-300 transition-colors ${
                    idx === apertureIdx ? 'text-amber-400 font-bold underline' : ''
                  }`}
                >
                  {val >= 10 ? val : val.toFixed(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Physics Explainer Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-300 leading-snug">
          <span className="text-amber-400 font-semibold">เลข f น้อย:</span> รูเปิดกว้าง แสงเข้าเยอะขึ้นเท่าตัว (+1 EV) ฉากหลังละลายเบลอสวยงาม
        </div>
      </div>

      {/* 2. SHUTTER SPEED CONTROL POD */}
      <div
        className={`bg-neutral-900/90 border rounded-xl p-4 shadow-xl flex flex-col justify-between transition-all ${
          mode === 'Av'
            ? 'opacity-80 border-neutral-800'
            : 'border-sky-500/30 hover:border-sky-500/50'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-400 tracking-wider uppercase block">
                  ความเร็วชัตเตอร์ (Shutter - Tv)
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  เวลาเปิดรับแสง · การเคลื่อนไหว
                </span>
              </div>
            </div>

            {mode === 'Av' && (
              <span className="text-[10px] font-mono text-sky-400/80 bg-sky-500/10 px-1.5 py-0.5 rounded">
                อัตโนมัติ [Av]
              </span>
            )}
          </div>

          {/* Value Display */}
          <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 border border-neutral-800 mb-4">
            <div>
              <div className="text-2xl font-mono font-bold tracking-tight text-white tabular-nums">
                {shutter.label}
              </div>
              <div className="text-[10px] font-mono text-neutral-300 mt-0.5">
                {shutter.value <= 1 / 500
                  ? 'หยุดภาพเคลื่อนไหวนิ่งสนิท'
                  : shutter.value >= 1 / 8
                  ? 'ภาพเบลอเป็นสาย (Long Exposure)'
                  : 'ความเร็วถือถ่ายปกติ'}
              </div>
            </div>

            {/* Handheld Warning Indicator or Speed graphic */}
            <div className="flex flex-col items-end">
              {isHandheldShakeWarning ? (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/60 border border-amber-600/40 text-amber-300 text-[10px] font-mono">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>ต้องใช้ขาตั้งกล้อง</span>
                </div>
              ) : (
                <div className="text-[10px] font-mono text-sky-400/90 px-2 py-1 rounded bg-sky-950/40 border border-sky-800/40">
                  ถือถ่ายมือเปล่าได้
                </div>
              )}
            </div>
          </div>

          {/* Stepper Buttons and Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShutterStep(-1)}
                disabled={shutterIdx <= 0 || mode === 'Av'}
                aria-label="เพิ่มความเร็วชัตเตอร์"
                title="เพิ่มความเร็วชัตเตอร์ (เร็วขึ้น)"
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-neutral-700 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0"
                max={SHUTTER_SPEEDS.length - 1}
                step="1"
                value={shutterIdx}
                disabled={mode === 'Av'}
                onChange={handleShutterSlider}
                className="w-full accent-sky-500 disabled:opacity-50"
              />

              <button
                onClick={() => handleShutterStep(1)}
                disabled={shutterIdx >= SHUTTER_SPEEDS.length - 1 || mode === 'Av'}
                aria-label="ลดความเร็วชัตเตอร์"
                title="ลดความเร็วชัตเตอร์ (ช้าลง)"
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-neutral-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Clickable Stops */}
            <div className="flex justify-between text-[8px] font-mono text-neutral-500 pt-1">
              {SHUTTER_SPEEDS.map((s, idx) => (
                <button
                  key={s.label}
                  onClick={() => {
                    if (mode !== 'Av') {
                      cameraAudio.playDialClick();
                      onShutterChange(s);
                    }
                  }}
                  className={`hover:text-sky-300 transition-colors ${
                    idx === shutterIdx ? 'text-sky-400 font-bold underline' : ''
                  }`}
                >
                  {s.fractionText}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Physics Explainer Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-300 leading-snug">
          <span className="text-sky-400 font-semibold">ชัตเตอร์ไว:</span> หยุดภาพนิ่งเสี้ยววินาที แต่แสงจะส่องเข้าเซนเซอร์น้อยลงตามเวลาที่สั้นลง
        </div>
      </div>

      {/* 3. ISO CONTROL POD */}
      <div className="bg-neutral-900/90 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl p-4 shadow-xl flex flex-col justify-between transition-all">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block">
                  ความไวแสงเซนเซอร์ (ISO)
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  กำลังขยายสัญญาณ · สัญญาณรบกวน (Noise)
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-neutral-400">
              ขยาย: {Math.pow(2, isoIdx)} เท่า
            </span>
          </div>

          {/* Value Display */}
          <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 border border-neutral-800 mb-4">
            <div>
              <div className="text-2xl font-mono font-bold tracking-tight text-white tabular-nums">
                ISO {iso}
              </div>
              <div className="text-[10px] font-mono text-neutral-300 mt-0.5">
                {iso <= 200
                  ? 'ภาพเนียนละเอียด ไร้ Noise (Base)'
                  : iso <= 800
                  ? 'ภาพเนียน สัญญาณรบกวนต่ำมาก'
                  : iso <= 3200
                  ? 'สว่างในที่มืด เริ่มมีเม็ดเกรนรบกวน'
                  : 'สัญญาณรบกวนสูง (Noise หนาแน่น)'}
              </div>
            </div>

            {/* Grain matrix visual */}
            <div className="w-10 h-10 rounded border border-neutral-700 bg-neutral-950 p-1 flex flex-wrap gap-0.5 items-center justify-center overflow-hidden">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                    i < (isoIdx + 1) * 2 ? 'bg-emerald-400' : 'bg-neutral-800'
                  }`}
                  style={{ opacity: i < (isoIdx + 1) * 2 ? 0.3 + (isoIdx / 6) * 0.7 : 0.2 }}
                />
              ))}
            </div>
          </div>

          {/* Stepper Buttons and Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleIsoStep(-1)}
                disabled={isoIdx <= 0}
                aria-label="ลดค่า ISO"
                title="ลดค่า ISO"
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-neutral-700 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0"
                max={ISO_VALUES.length - 1}
                step="1"
                value={isoIdx}
                onChange={handleIsoSlider}
                className="w-full accent-emerald-500"
              />

              <button
                onClick={() => handleIsoStep(1)}
                disabled={isoIdx >= ISO_VALUES.length - 1}
                aria-label="เพิ่มค่า ISO"
                title="เพิ่มค่า ISO"
                className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 disabled:pointer-events-none transition-colors border border-neutral-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Clickable Stops */}
            <div className="flex justify-between text-[9px] font-mono text-neutral-500 pt-1">
              {ISO_VALUES.map((val, idx) => (
                <button
                  key={val}
                  onClick={() => {
                    cameraAudio.playDialClick();
                    onIsoChange(val);
                  }}
                  className={`hover:text-emerald-300 transition-colors ${
                    idx === isoIdx ? 'text-emerald-400 font-bold underline' : ''
                  }`}
                >
                  {val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Physics Explainer Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-300 leading-snug">
          <span className="text-emerald-400 font-semibold">ISO สูง:</span> ช่วยดึงความสว่างในที่มืดโดยไม่ต้องลดสปีดชัตเตอร์ แต่จะเพิ่มเม็ดเกรนรบกวน (Noise)
        </div>
      </div>
    </div>
  );
};
