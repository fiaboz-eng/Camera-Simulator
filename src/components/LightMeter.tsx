import React from 'react';
import { getExposureStatus } from '../utils/exposure';

interface LightMeterProps {
  deltaEV: number;
  targetEV?: number;
  cameraEV?: number;
}

export const LightMeter: React.FC<LightMeterProps> = ({ deltaEV, targetEV = 12.0, cameraEV }) => {
  const statusInfo = getExposureStatus(deltaEV);

  // Clamped position for needle between -2.2 and +2.2 EV
  const clampedEV = Math.max(-2.2, Math.min(2.2, deltaEV));
  // Convert -2 to +2 scale into 0% to 100% percentage
  // -2 -> 5%, 0 -> 50%, +2 -> 95%
  const needlePercent = ((clampedEV + 2) / 4) * 90 + 5;

  // Major EV ticks: -2, -1, 0, +1, +2
  // Minor ticks: 1/3 EV intervals
  const tickValues = [
    { ev: -2, label: '-2', isMajor: true },
    { ev: -1.67, label: '', isMajor: false },
    { ev: -1.33, label: '', isMajor: false },
    { ev: -1, label: '-1', isMajor: true },
    { ev: -0.67, label: '', isMajor: false },
    { ev: -0.33, label: '', isMajor: false },
    { ev: 0, label: '0', isMajor: true },
    { ev: 0.33, label: '', isMajor: false },
    { ev: 0.67, label: '', isMajor: false },
    { ev: 1, label: '+1', isMajor: true },
    { ev: 1.33, label: '', isMajor: false },
    { ev: 1.67, label: '', isMajor: false },
    { ev: 2, label: '+2', isMajor: true },
  ];

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            สเกลวัดแสง (Light Meter)
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            [วัดแสงเฉลี่ยทั้งภาพ]
          </span>
        </div>

        {/* Current EV Delta & Balance read-out */}
        <div className="flex items-center gap-3">
          {cameraEV !== undefined && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
              <span>แสงสถานที่: <strong className="text-amber-400">{targetEV.toFixed(1)}</strong></span>
              <span>·</span>
              <span>ค่ากล้อง: <strong className="text-sky-400">{cameraEV.toFixed(1)}</strong></span>
            </div>
          )}

          <span
            className={`font-mono text-sm font-bold tabular-nums px-2.5 py-0.5 rounded border ${
              statusInfo.status === 'correct'
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                : statusInfo.status === 'under'
                ? 'bg-amber-950/50 text-amber-400 border-amber-800/60'
                : 'bg-rose-950/50 text-rose-400 border-rose-800/60'
            }`}
          >
            {deltaEV > 0 ? `+${deltaEV.toFixed(1)}` : deltaEV.toFixed(1)} EV
          </span>
        </div>
      </div>

      {/* Viewfinder Scale Bar */}
      <div className="relative pt-6 pb-4 px-3 sm:px-6 bg-black/60 rounded-lg border border-neutral-800">
        {/* Scale labels on top */}
        <div className="relative w-full h-4 mb-2">
          {tickValues.map((t, idx) => {
            const leftPct = ((t.ev + 2) / 4) * 90 + 5;
            return (
              <div
                key={idx}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPct}%` }}
              >
                {t.isMajor && (
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      t.ev === 0
                        ? 'text-emerald-400 font-extrabold'
                        : 'text-neutral-400'
                    }`}
                  >
                    {t.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Physical Scale Ruler with notches */}
        <div className="relative w-full h-8 flex items-center">
          {/* Base horizontal guide wire */}
          <div className="w-full h-[2px] bg-neutral-700/80 rounded" />

          {/* Under-range arrow (left) */}
          <span
            className={`absolute left-0 text-xs font-mono font-bold transition-opacity ${
              deltaEV < -2.0 ? 'text-amber-400 opacity-100 animate-pulse' : 'text-neutral-700 opacity-40'
            }`}
          >
            ◄
          </span>

          {/* Over-range arrow (right) */}
          <span
            className={`absolute right-0 text-xs font-mono font-bold transition-opacity ${
              deltaEV > 2.0 ? 'text-rose-400 opacity-100 animate-pulse' : 'text-neutral-700 opacity-40'
            }`}
          >
            ►
          </span>

          {/* Tick marks */}
          {tickValues.map((t, idx) => {
            const leftPct = ((t.ev + 2) / 4) * 90 + 5;
            return (
              <div
                key={idx}
                className={`absolute -translate-x-1/2 rounded-full transition-colors ${
                  t.isMajor
                    ? t.ev === 0
                      ? 'w-[3px] h-5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                      : 'w-[2px] h-3.5 bg-neutral-400'
                    : 'w-[1px] h-2 bg-neutral-600'
                }`}
                style={{ left: `${leftPct}%` }}
              />
            );
          })}

          {/* Live Gliding Indicator Needle / Diamond */}
          <div
            className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center justify-center transition-all duration-150 ease-out pointer-events-none z-10"
            style={{ left: `${needlePercent}%` }}
          >
            {/* Pointer diamond */}
            <div
              className={`w-3.5 h-3.5 rotate-45 border-2 shadow-lg transition-colors ${
                statusInfo.status === 'correct'
                  ? 'bg-emerald-400 border-white shadow-emerald-500/50'
                  : statusInfo.status === 'under'
                  ? 'bg-amber-400 border-white shadow-amber-500/50'
                  : 'bg-rose-500 border-white shadow-rose-500/50'
              }`}
            />
            {/* Center vertical indicator bar */}
            <div
              className={`w-[2px] h-6 mt-1 rounded ${
                statusInfo.status === 'correct'
                  ? 'bg-emerald-400'
                  : statusInfo.status === 'under'
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        {/* Legend notes */}
        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 mt-2 px-1">
          <span>-2 EV (ภาพมืดไป / มืดทึบ)</span>
          <span className="text-emerald-400 font-bold">● 0 EV (แสงพอดีสมบูรณ์แบบ)</span>
          <span>+2 EV (สว่างจ้า / ขาวโพลน)</span>
        </div>
      </div>

      {/* Educational Diagnostic Card */}
      <div className={`mt-3 p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${statusInfo.badgeBg} ${statusInfo.badgeBorder}`}>
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            statusInfo.status === 'correct'
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              : statusInfo.status === 'under'
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
              : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
          }`}
        />
        <div className="flex-1">
          <span className="font-semibold mr-1.5">{statusInfo.label}:</span>
          <span className="opacity-90">{statusInfo.subtext}</span>
        </div>
      </div>
    </div>
  );
};
