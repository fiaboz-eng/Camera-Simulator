import React from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { MissionValidationResult, MissionScenario, PhotoSnapshot } from '../types/camera';

interface MissionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MissionValidationResult | null;
  mission: MissionScenario;
  snapshot: PhotoSnapshot | null;
  onNextMission?: () => void;
  hasMoreMissions?: boolean;
}

export const MissionResultModal: React.FC<MissionResultModalProps> = ({
  isOpen,
  onClose,
  result,
  mission,
  snapshot,
  onNextMission,
  hasMoreMissions,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl flex items-center justify-center ${
                result.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {result.passed ? (
                <Trophy className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 uppercase">
                  ภารกิจที่ 0{mission.number}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {mission.title}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {result.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Evaluation Banner with Score & Frozen Image */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
          {/* Frozen Photo Thumbnail */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <div className="relative aspect-[16/10] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-inner group">
              {snapshot?.dataUrl ? (
                <img
                  src={snapshot.dataUrl}
                  alt="Captured exposure"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                  ภาพที่บันทึก
                </div>
              )}

              {/* Status Stamp */}
              <div className="absolute top-2 left-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-xs border ${
                    result.passed
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                      : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                  }`}
                >
                  {result.passed ? 'ผ่านแล้ว!' : 'ลองปรับใหม่'}
                </span>
              </div>
            </div>

            {/* EXIF Readout */}
            {snapshot && (
              <div className="p-2 rounded-lg bg-black/60 border border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center justify-between">
                <span>
                  f/{snapshot.aperture.toFixed(1)} · {snapshot.shutterText} · ISO {snapshot.iso}
                </span>
                <span className="text-amber-400 font-bold">
                  {snapshot.evDelta > 0 ? `+${snapshot.evDelta.toFixed(1)}` : snapshot.evDelta.toFixed(1)} EV
                </span>
              </div>
            )}
          </div>

          {/* Score & Briefing Breakdown */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            {/* Score Ring / Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-neutral-800">
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                  คะแนนการประเมินทักษะ
                </span>
                <span
                  className={`text-2xl font-bold font-mono ${
                    result.passed ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {result.score}/100
                </span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider border ${
                  result.passed
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-600/50'
                    : 'bg-amber-950/50 text-amber-300 border-amber-600/50'
                }`}
              >
                {result.passed ? 'บรรลุเป้าหมายครบถ้วน' : 'ยังไม่ครบตามเงื่อนไข'}
              </div>
            </div>

            {/* Pedagogical Why Explanation */}
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              <span className="font-bold text-amber-400 block mb-1 text-[11px] uppercase tracking-wider font-mono">
                คำอธิบายและข้อแนะนำจากช่างภาพ:
              </span>
              <p>{result.explanation}</p>
            </div>
          </div>
        </div>

        {/* Criteria Checklist */}
        <div className="mt-5 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono block">
            รายการตรวจสอบเงื่อนไขภารกิจ:
          </span>

          <div className="space-y-2">
            {result.checks.map((check, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  check.passed
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-white mr-2">
                      {check.label}:
                    </span>
                    <span className="opacity-90">{check.detail}</span>
                  </div>
                </div>

                <span
                  className={`font-mono text-[11px] px-2 py-0.5 rounded shrink-0 border ${
                    check.passed
                      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
                      : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                  }`}
                >
                  {check.currentValueText}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>กลับไปปรับค่ากล้อง</span>
          </button>

          <div className="flex items-center gap-2.5">
            {!result.passed ? (
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ลองใหม่อีกครั้ง</span>
              </button>
            ) : hasMoreMissions && onNextMission ? (
              <button
                onClick={() => {
                  onClose();
                  onNextMission();
                }}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <span>ไปภารกิจถัดไป</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer"
              >
                ผ่านครบทุกภารกิจแล้ว!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
