import React, { useState } from 'react';
import { X, Trophy, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import {
  LEARNING_CHALLENGES,
} from '../utils/exposure';
import {
  ShutterSpeedOption,
  AmbientEnvironment,
  AMBIENT_ENVIRONMENTS,
} from '../types/camera';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  aperture: number;
  shutter: ShutterSpeedOption;
  iso: number;
  deltaEV: number;
  currentEnvironment: AmbientEnvironment;
  onSelectEnvironment: (env: AmbientEnvironment) => void;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  isOpen,
  onClose,
  aperture,
  shutter,
  iso,
  deltaEV,
  onSelectEnvironment,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    LEARNING_CHALLENGES[0].id
  );

  if (!isOpen) return null;

  const currentChallenge =
    LEARNING_CHALLENGES.find((c) => c.id === selectedChallengeId) ||
    LEARNING_CHALLENGES[0];

  // Evaluate current challenge with active settings
  const evaluation = currentChallenge.targetCondition(
    aperture,
    shutter,
    iso,
    deltaEV
  );

  const targetEnv = AMBIENT_ENVIRONMENTS.find(
    (e) => e.id === currentChallenge.targetEnvironmentId
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                แบบฝึกหัดจำลองสถานการณ์จริง (Practice Quests)
              </h2>
              <p className="text-xs text-neutral-400">
                ฝึกตั้งค่ากล้องให้เหมาะสมกับโจทย์ถ่ายภาพจริงและสภาพแสงต่างๆ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-5">
          {LEARNING_CHALLENGES.map((ch, idx) => {
            const isSelected = ch.id === selectedChallengeId;
            const evalCheck = ch.targetCondition(aperture, shutter, iso, deltaEV);
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChallengeId(ch.id)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800 border-amber-500 text-white shadow-lg'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-neutral-400">
                    แบบฝึกหัด 0{idx + 1}
                  </span>
                  {evalCheck.success && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-xs font-semibold line-clamp-1">
                  {ch.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Challenge Detail Card */}
        <div className="p-5 rounded-xl bg-black/60 border border-neutral-800 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {currentChallenge.title}
              </h3>
              {targetEnv && (
                <button
                  onClick={() => onSelectEnvironment(targetEnv)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 border border-neutral-700 text-amber-300 hover:bg-neutral-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>จัดแสง: {targetEnv.name}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-amber-300/90 mt-1 font-medium">
              เป้าหมาย: {currentChallenge.brief}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
            <span className="font-semibold text-neutral-200 block mb-1">
              คำแนะนำจากช่างภาพ:
            </span>
            {currentChallenge.goalExplanation}
          </div>

          {/* Real-time Settings Status Check */}
          <div className="p-4 rounded-xl border transition-all bg-neutral-950/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-neutral-400 uppercase">
                ค่ากล้องที่ตั้งอยู่ในขณะนี้:
              </span>
              <span className="text-xs font-mono tabular-nums text-neutral-300">
                f/{aperture.toFixed(1)} · {shutter.label} · ISO {iso} · ({deltaEV > 0 ? `+${deltaEV}` : deltaEV} EV)
              </span>
            </div>

            {/* Validation Outcome Banner */}
            <div
              className={`p-3 rounded-lg border flex items-start gap-3 ${
                evaluation.success
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-600/40 text-amber-300'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {evaluation.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <RotateCcw className="w-5 h-5 text-amber-400 animate-spin-slow" />
                )}
              </div>
              <div className="text-xs leading-relaxed">
                <span className="font-bold block mb-0.5">
                  {evaluation.success ? 'ผ่านแบบฝึกหัดสำเร็จ!' : 'สิ่งที่ต้องปรับเพิ่ม:'}
                </span>
                {evaluation.feedback}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 rounded-lg transition-colors font-medium shadow-md cursor-pointer"
          >
            เริ่มฝึกถ่ายภาพนี้
          </button>
        </div>
      </div>
    </div>
  );
};
