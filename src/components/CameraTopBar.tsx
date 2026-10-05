import React from 'react';
import {
  CameraMode,
  SceneType,
  AmbientEnvironment,
  AMBIENT_ENVIRONMENTS,
  SCENE_OPTIONS,
} from '../types/camera';
import {
  Volume2,
  VolumeX,
  Camera,
  Grid3X3,
  BarChart2,
  Trophy,
  HelpCircle,
  Film,
  Target,
  SlidersHorizontal,
} from 'lucide-react';
import { cameraAudio } from '../utils/audio';

interface CameraTopBarProps {
  appMode: 'sandbox' | 'mission';
  onAppModeChange: (mode: 'sandbox' | 'mission') => void;
  mode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  scene: SceneType;
  onSceneChange: (scene: SceneType) => void;
  environment: AmbientEnvironment;
  onEnvironmentChange: (env: AmbientEnvironment) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showHistogram: boolean;
  onToggleHistogram: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenTriangle: () => void;
  onOpenChallenges: () => void;
  onOpenGallery: () => void;
  onTriggerShutter: () => void;
  snapshotCount: number;
}

export const CameraTopBar: React.FC<CameraTopBarProps> = ({
  appMode,
  onAppModeChange,
  mode,
  onModeChange,
  scene,
  onSceneChange,
  environment,
  onEnvironmentChange,
  showGrid,
  onToggleGrid,
  showHistogram,
  onToggleHistogram,
  audioEnabled,
  onToggleAudio,
  onOpenTriangle,
  onOpenChallenges,
  onOpenGallery,
  onTriggerShutter,
  snapshotCount,
}) => {
  const modes: { id: CameraMode; label: string; desc: string }[] = [
    { id: 'M', label: 'M', desc: 'Manual (ปรับเองทั้งหมด)' },
    { id: 'Av', label: 'Av', desc: 'Aperture Priority (เน้นรูรับแสง)' },
    { id: 'Tv', label: 'Tv', desc: 'Shutter Priority (เน้นความเร็วชัตเตอร์)' },
    { id: 'P', label: 'P', desc: 'Program Auto (อัตโนมัติ)' },
  ];

  return (
    <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-3 px-4 sm:px-6 bg-neutral-900/90 border-b border-neutral-800 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Zone 1: Wordmark & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-amber-500/20">
            <Camera className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              โปรแกรมจำลองการตั้งค่ากล้องถ่ายภาพ
            </h1>
            <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
              เรียนรู้สามเหลี่ยมวัดแสง: รูรับแสง (Aperture) · ความเร็วชัตเตอร์ (Shutter Speed) · ค่าความไวแสง (ISO)
            </p>
          </div>
        </div>

        {/* Mode Switcher: Free Sandbox vs Mission Challenge */}
        <div className="flex items-center p-1 bg-black/70 rounded-xl border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => {
              cameraAudio.playDialClick();
              onAppModeChange('sandbox');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              appMode === 'sandbox'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span>โหมดทดลองอิสระ</span>
          </button>
          <button
            onClick={() => {
              cameraAudio.playDialClick();
              onAppModeChange('mission');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              appMode === 'mission'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>โหมดภารกิจฝึกถ่าย</span>
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation & Quick Selectors */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        {/* Mode Selector Dial (M, Av, Tv, P) */}
        <div className="flex items-center p-1 bg-black/60 rounded-lg border border-neutral-800">
          <span className="text-[10px] font-mono text-neutral-400 px-1.5 hidden sm:inline">
            โหมด:
          </span>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                cameraAudio.playDialClick();
                onModeChange(m.id);
              }}
              title={`โหมด ${m.desc}`}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors whitespace-nowrap cursor-pointer ${
                mode === m.id
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Ambient Environment Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-neutral-400 hidden xl:inline">
            แสง:
          </span>
          <select
            value={environment.id}
            onChange={(e) => {
              const selected = AMBIENT_ENVIRONMENTS.find((env) => env.id === e.target.value);
              if (selected) {
                cameraAudio.playDialClick();
                onEnvironmentChange(selected);
              }
            }}
            aria-label="เลือกสภาพแสงรอบข้าง"
            className="bg-black/60 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 font-sans focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            {AMBIENT_ENVIRONMENTS.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scene Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-neutral-400 hidden xl:inline">
            ฉาก:
          </span>
          <select
            value={scene}
            onChange={(e) => {
              cameraAudio.playDialClick();
              onSceneChange(e.target.value as SceneType);
            }}
            aria-label="เลือกฉากการเคลื่อนไหว"
            className="bg-black/60 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 font-sans focus:border-amber-500 focus:outline-none cursor-pointer"
          >
            {SCENE_OPTIONS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Viewfinder Toggles */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={onToggleGrid}
            title={showGrid ? 'ซ่อนเส้นตาราง 9 ช่อง' : 'แสดงเส้นตาราง 9 ช่อง'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              showGrid
                ? 'bg-neutral-800 text-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleHistogram}
            title={showHistogram ? 'ซ่อนกราฟวัดแสงฮิสโตแกรม' : 'แสดงกราฟวัดแสงฮิสโตแกรม'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              showHistogram
                ? 'bg-neutral-800 text-sky-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'ปิดเสียงชัตเตอร์' : 'เปิดเสียงชัตเตอร์'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              audioEnabled
                ? 'text-emerald-400'
                : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            {audioEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="hidden lg:flex items-center gap-2.5">
        <button
          onClick={onOpenTriangle}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>คู่มือวัดแสง</span>
        </button>

        <button
          onClick={onOpenChallenges}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>แบบฝึกหัด</span>
        </button>

        <button
          onClick={onOpenGallery}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors relative whitespace-nowrap cursor-pointer"
        >
          <Film className="w-3.5 h-3.5 text-neutral-400" />
          <span>ม้วนฟิล์ม</span>
          {snapshotCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold flex items-center justify-center">
              {snapshotCount}
            </span>
          )}
        </button>

        {/* Shutter Release Button */}
        <button
          onClick={onTriggerShutter}
          className="px-4 py-2 bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 border border-rose-500/50 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Camera className="w-4 h-4" />
          <span>กดชัตเตอร์ถ่ายภาพ</span>
        </button>
      </div>
    </header>
  );
};
