import React from 'react';
import {
  MissionScenario,
  MISSION_SCENARIOS,
  ShutterSpeedOption,
} from '../types/camera';
import { Target, Camera, CheckCircle2 } from 'lucide-react';

interface MissionBriefingBarProps {
  currentMission: MissionScenario;
  onSelectMission: (mission: MissionScenario) => void;
  aperture: number;
  shutter: ShutterSpeedOption;
  iso: number;
  deltaEV: number;
  onTriggerShutter: () => void;
}

export const MissionBriefingBar: React.FC<MissionBriefingBarProps> = ({
  currentMission,
  onSelectMission,
  aperture,
  shutter,
  iso,
  deltaEV,
  onTriggerShutter,
}) => {
  // Real-time quick validation preview
  const liveValidation = currentMission.validate(aperture, shutter, iso, deltaEV);

  return (
    <div className="bg-neutral-900 border border-amber-500/40 rounded-xl p-4 shadow-xl space-y-3.5 animate-in fade-in duration-150">
      {/* Top Mission Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            โหมดภารกิจฝึกถ่ายภาพ (Mission Challenge)
          </span>
          <span className="text-[10px] font-mono text-neutral-400 hidden md:inline">
            [ทดสอบความเข้าใจ]
          </span>
        </div>

        {/* Mission selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {MISSION_SCENARIOS.map((m) => {
            const isSelected = m.id === currentMission.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMission(m)}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                    : 'bg-black/50 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                0{m.number}. {m.title.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mission Briefing and Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Objective Description */}
        <div className="md:col-span-8 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              ภารกิจที่ 0{currentMission.number}: {currentMission.title}
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
              {currentMission.badge}
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {currentMission.brief}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
            <span className="text-neutral-400">เงื่อนไขที่ต้องทำให้ผ่าน:</span>
            {currentMission.criteria.map((c, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-black/60 text-amber-300/90 border border-neutral-800"
              >
                {c.targetDescription}
              </span>
            ))}
          </div>
        </div>

        {/* Real-time readiness check & Take Photo CTA */}
        <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-stretch gap-2">
          {/* Live Readiness Badge */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 ${
              liveValidation.passed
                ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                : 'bg-neutral-950/80 border-neutral-800 text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {liveValidation.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              )}
              <span className="text-[11px]">
                {liveValidation.passed ? 'ค่ากล้องพร้อมแล้ว ถ่ายได้เลย!' : 'กำลังปรับจูนค่ากล้อง...'}
              </span>
            </div>
            <span className="text-[10px] tabular-nums font-bold">
              {liveValidation.score}%
            </span>
          </div>

          {/* Primary Take Photo & Validate Button */}
          <button
            onClick={onTriggerShutter}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 active:scale-98 text-white font-sans text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 border border-rose-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>กดถ่ายภาพ & ตรวจผล [SPACE]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
