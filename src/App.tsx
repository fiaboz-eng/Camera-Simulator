/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
  ShutterSpeedOption,
  CameraMode,
  AmbientEnvironment,
  AMBIENT_ENVIRONMENTS,
  SceneType,
  PhotoSnapshot,
  MissionScenario,
  MISSION_SCENARIOS,
  MissionValidationResult,
} from './types/camera';
import {
  calculateCameraEV,
  calculateDeltaEV,
  autoCalculateShutter,
  autoCalculateAperture,
  getExposureStatus,
} from './utils/exposure';
import { cameraAudio } from './utils/audio';
import { CameraCanvas, CameraCanvasRef } from './components/CameraCanvas';
import { LightMeter } from './components/LightMeter';
import { CameraControls } from './components/CameraControls';
import { CameraTopBar } from './components/CameraTopBar';
import { MissionBriefingBar } from './components/MissionBriefingBar';
import { MissionResultModal } from './components/MissionResultModal';
import { ExposureTriangleModal } from './components/ExposureTriangleModal';
import { ChallengesModal } from './components/ChallengesModal';
import { SnapshotGalleryModal } from './components/SnapshotGalleryModal';
import { SlidersHorizontal } from 'lucide-react';

export default function App() {
  // App Mode Switcher: 'sandbox' (Free Sandbox) | 'mission' (Mission Challenge)
  const [appMode, setAppMode] = useState<'sandbox' | 'mission'>('sandbox');

  // Mission Challenge state
  const [currentMission, setCurrentMission] = useState<MissionScenario>(MISSION_SCENARIOS[0]);
  const [missionResult, setMissionResult] = useState<MissionValidationResult | null>(null);
  const [isMissionResultOpen, setIsMissionResultOpen] = useState<boolean>(false);
  const [missionSnapshot, setMissionSnapshot] = useState<PhotoSnapshot | null>(null);

  // Exposure Triangle parameters (Baseline Target EV = 12.0)
  const [aperture, setAperture] = useState<number>(4.0);
  const [shutter, setShutter] = useState<ShutterSpeedOption>(SHUTTER_SPEEDS[3]); // 1/250s
  const [iso, setIso] = useState<number>(100);

  // Camera Operation Mode
  const [mode, setMode] = useState<CameraMode>('M');

  // Ambient Environment Light (Default: Baseline Scene Target EV 12)
  const [environment, setEnvironment] = useState<AmbientEnvironment>(AMBIENT_ENVIRONMENTS[0]);

  // Animated Scene Selection
  const [scene, setScene] = useState<SceneType>('studio_wheel');

  // Viewfinder HUD Options
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showHistogram, setShowHistogram] = useState<boolean>(true);
  const [showZebras, setShowZebras] = useState<boolean>(false);
  const [showPeaking, setShowPeaking] = useState<boolean>(false);

  // Audio Feedback Toggle
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Captured Snapshots
  const [snapshots, setSnapshots] = useState<PhotoSnapshot[]>([]);

  // Shutter flash animation
  const [isShutterActive, setIsShutterActive] = useState<boolean>(false);

  // Modals
  const [isTriangleModalOpen, setIsTriangleModalOpen] = useState<boolean>(false);
  const [isChallengesModalOpen, setIsChallengesModalOpen] = useState<boolean>(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState<boolean>(false);

  const canvasRef = useRef<CameraCanvasRef | null>(null);

  // Synchronize audio preference
  useEffect(() => {
    cameraAudio.enabled = audioEnabled;
  }, [audioEnabled]);

  // Calculate live exposure delta EV & User EV
  const userEV = calculateCameraEV(aperture, shutter.value, iso);
  const deltaEV = calculateDeltaEV(environment.ev, aperture, shutter.value, iso);
  const exposureStatus = getExposureStatus(deltaEV);

  // Automatic compensation when in Av or Tv mode
  const handleApertureChange = useCallback(
    (newAperture: number) => {
      setAperture(newAperture);
      if (mode === 'Av') {
        const autoShutter = autoCalculateShutter(environment.ev, newAperture, iso);
        setShutter(autoShutter);
      }
    },
    [environment.ev, iso, mode]
  );

  const handleShutterChange = useCallback(
    (newShutter: ShutterSpeedOption) => {
      setShutter(newShutter);
      if (mode === 'Tv') {
        const autoAperture = autoCalculateAperture(environment.ev, newShutter.value, iso);
        setAperture(autoAperture);
      }
    },
    [environment.ev, iso, mode]
  );

  const handleIsoChange = useCallback(
    (newIso: number) => {
      setIso(newIso);
      if (mode === 'Av') {
        const autoShutter = autoCalculateShutter(environment.ev, aperture, newIso);
        setShutter(autoShutter);
      } else if (mode === 'Tv') {
        const autoAperture = autoCalculateAperture(environment.ev, shutter.value, newIso);
        setAperture(autoAperture);
      }
    },
    [aperture, environment.ev, mode, shutter.value]
  );

  // Mode change handler
  const handleModeChange = (newMode: CameraMode) => {
    setMode(newMode);
    if (newMode === 'P') {
      const autoA = 4.0;
      const autoS = autoCalculateShutter(environment.ev, autoA, 400);
      setAperture(autoA);
      setShutter(autoS);
      setIso(400);
    } else if (newMode === 'Av') {
      const autoS = autoCalculateShutter(environment.ev, aperture, iso);
      setShutter(autoS);
    } else if (newMode === 'Tv') {
      const autoA = autoCalculateAperture(environment.ev, shutter.value, iso);
      setAperture(autoA);
    }
  };

  // Environment change handler
  const handleEnvironmentChange = (newEnv: AmbientEnvironment) => {
    setEnvironment(newEnv);
    if (mode === 'Av') {
      const autoS = autoCalculateShutter(newEnv.ev, aperture, iso);
      setShutter(autoS);
    } else if (mode === 'Tv') {
      const autoA = autoCalculateAperture(newEnv.ev, shutter.value, iso);
      setAperture(autoA);
    } else if (mode === 'P') {
      const autoS = autoCalculateShutter(newEnv.ev, 4.0, 400);
      setAperture(4.0);
      setShutter(autoS);
      setIso(400);
    }
  };

  // Mission selection handler
  const handleSelectMission = (mission: MissionScenario) => {
    cameraAudio.playDialClick();
    setCurrentMission(mission);
    const targetEnv = AMBIENT_ENVIRONMENTS.find((e) => e.id === mission.environmentId);
    if (targetEnv) {
      setEnvironment(targetEnv);
    }
    setScene(mission.sceneId);
  };

  // Move to next mission
  const handleNextMission = () => {
    const currentIndex = MISSION_SCENARIOS.findIndex((m) => m.id === currentMission.id);
    if (currentIndex < MISSION_SCENARIOS.length - 1) {
      handleSelectMission(MISSION_SCENARIOS[currentIndex + 1]);
    }
  };

  // Shutter Release Trigger & Knowledge Check Evaluation
  const handleTriggerShutter = useCallback(() => {
    cameraAudio.playShutterSound(shutter.value);
    setIsShutterActive(true);

    let capturedShot: PhotoSnapshot | null = null;

    if (canvasRef.current) {
      const snapshotUrl = canvasRef.current.captureSnapshot();
      if (snapshotUrl) {
        capturedShot = {
          id: `snap_${Date.now()}`,
          timestamp: Date.now(),
          dataUrl: snapshotUrl,
          aperture,
          shutterText: shutter.label,
          iso,
          evDelta: deltaEV,
          environmentName: environment.name,
          status: exposureStatus.status,
        };
        setSnapshots((prev) => [capturedShot!, ...prev].slice(0, 16));
      }
    }

    // If in Mission Challenge mode: run validation and open result modal!
    if (appMode === 'mission') {
      const validation = currentMission.validate(aperture, shutter, iso, deltaEV);
      setMissionResult(validation);
      setMissionSnapshot(capturedShot);
      setIsMissionResultOpen(true);
    }

    setTimeout(() => {
      setIsShutterActive(false);
    }, Math.max(70, Math.min(shutter.value * 1000, 300)));
  }, [
    appMode,
    currentMission,
    aperture,
    deltaEV,
    environment.name,
    exposureStatus.status,
    iso,
    shutter.label,
    shutter.value,
  ]);

  // Spacebar shortcut to trigger shutter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !isTriangleModalOpen &&
        !isChallengesModalOpen &&
        !isGalleryModalOpen &&
        !isMissionResultOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'BUTTON'
      ) {
        e.preventDefault();
        handleTriggerShutter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleTriggerShutter,
    isChallengesModalOpen,
    isGalleryModalOpen,
    isMissionResultOpen,
    isTriangleModalOpen,
  ]);

  // Apply quick learning preset
  const applyPreset = (presetA: number, presetSIdx: number, presetIso: number) => {
    cameraAudio.playDialClick();
    setAperture(presetA);
    setShutter(SHUTTER_SPEEDS[presetSIdx]);
    setIso(presetIso);
  };

  const currentMissionIdx = MISSION_SCENARIOS.findIndex((m) => m.id === currentMission.id);
  const hasMoreMissions = currentMissionIdx < MISSION_SCENARIOS.length - 1;

  return (
    <div className="min-h-screen bg-[#090a0c] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Outer Container with camera body styling */}
      <div className="max-w-7xl mx-auto w-full p-3 sm:p-5 lg:p-6 flex-1 flex flex-col gap-4 sm:gap-5">
        {/* Top Header & Navigation Bar with Mode Switcher */}
        <CameraTopBar
          appMode={appMode}
          onAppModeChange={(newAppMode) => {
            setAppMode(newAppMode);
            if (newAppMode === 'mission') {
              handleSelectMission(currentMission);
            }
          }}
          mode={mode}
          onModeChange={handleModeChange}
          scene={scene}
          onSceneChange={setScene}
          environment={environment}
          onEnvironmentChange={handleEnvironmentChange}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showHistogram={showHistogram}
          onToggleHistogram={() => setShowHistogram(!showHistogram)}
          audioEnabled={audioEnabled}
          onToggleAudio={() => setAudioEnabled(!audioEnabled)}
          onOpenTriangle={() => setIsTriangleModalOpen(true)}
          onOpenChallenges={() => setIsChallengesModalOpen(true)}
          onOpenGallery={() => setIsGalleryModalOpen(true)}
          onTriggerShutter={handleTriggerShutter}
          snapshotCount={snapshots.length}
        />

        {/* MISSION CHALLENGE BRIEFING BAR (Active in Mission Mode) */}
        {appMode === 'mission' && (
          <MissionBriefingBar
            currentMission={currentMission}
            onSelectMission={handleSelectMission}
            aperture={aperture}
            shutter={shutter}
            iso={iso}
            deltaEV={deltaEV}
            onTriggerShutter={handleTriggerShutter}
          />
        )}

        {/* FREE SANDBOX HEADER SUMMARY (Active in Sandbox Mode) */}
        {appMode === 'sandbox' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800/80 animate-in fade-in duration-150">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">
                  สถานะความสมดุลแสง (Exposure):
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${exposureStatus.badgeBg} ${exposureStatus.badgeBorder}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      exposureStatus.status === 'correct'
                        ? 'bg-emerald-400'
                        : exposureStatus.status === 'under'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  {exposureStatus.label}
                </span>
              </div>
              <p className="text-xs text-neutral-300 max-w-3xl leading-relaxed">
                ปรับ <strong className="text-amber-400 font-semibold">รูรับแสง (Aperture)</strong> คุมความชัดลึก/โบเก้,{' '}
                <strong className="text-sky-400 font-semibold">ความเร็วชัตเตอร์ (Shutter Speed)</strong> คุมการหยุดภาพหรือเบลอสายน้ำ, และ{' '}
                <strong className="text-emerald-400 font-semibold">ISO</strong> คุมความสว่าง/สัญญาณรบกวน เพื่อให้เข็มสเกลวัดแสงชี้ตรงกลางที่ <strong>0.0 EV</strong>
              </p>
            </div>

            {/* Quick Photography Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-neutral-400 mr-1 hidden sm:inline">
                สูตรสำเร็จ:
              </span>
              <button
                onClick={() => applyPreset(1.4, 0, 100)} // f/1.4, 1/2000s, ISO 100 -> EV 12.0
                className="px-2.5 py-1 text-[11px] font-sans rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                title="หน้าชัดหลังเบลอสวยงาม ละลายฉากหลัง (EV 12)"
              >
                หน้าชัดหลังเบลอ
              </button>
              <button
                onClick={() => applyPreset(2.8, 2, 100)} // f/2.8, 1/500s, ISO 100 -> EV 12.0
                className="px-2.5 py-1 text-[11px] font-sans rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                title="หยุดภาพการเคลื่อนไหวความเร็วสูงให้นิ่งสนิท (EV 12)"
              >
                หยุดภาพเคลื่อนไหว
              </button>
              <button
                onClick={() => applyPreset(16, 7, 100)} // f/16, 1/15s, ISO 100 -> EV 12.0
                className="px-2.5 py-1 text-[11px] font-sans rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                title="ลากเส้นสายความเคลื่อนไหว Long Exposure (EV 12)"
              >
                สายน้ำ/ไฟวิ่ง
              </button>
              <button
                onClick={() => applyPreset(8.0, 3, 3200)} // f/8.0, 1/250s, ISO 3200 -> EV 12.0
                className="px-2.5 py-1 text-[11px] font-sans rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                title="ทดสอบสัญญาณรบกวนและเม็ดเกรนที่ ISO สูง"
              >
                ทดสอบ Noise แสงน้อย
              </button>
            </div>
          </div>
        )}

        {/* Main Stage Grid: Canvas Viewport & Auxiliary Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Preview Stage (Canvas Area) - 8 cols on large screens */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <CameraCanvas
              ref={canvasRef}
              aperture={aperture}
              shutter={shutter}
              iso={iso}
              deltaEV={deltaEV}
              targetEV={environment.ev}
              cameraEV={userEV}
              scene={scene}
              showGrid={showGrid}
              showHistogram={showHistogram}
              showZebras={showZebras}
              showPeaking={showPeaking}
              isShutterActive={isShutterActive}
              onFocusLock={() => cameraAudio.playAfBeep()}
            />

            {/* Viewport Overlay Control Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-neutral-900/60 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>ตาราง 9 ช่อง</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={showHistogram}
                    onChange={(e) => setShowHistogram(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>กราฟสี RGB</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={showZebras}
                    onChange={(e) => setShowZebras(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>เตือนแสงล้น (Zebra)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={showPeaking}
                    onChange={(e) => setShowPeaking(e.target.checked)}
                    className="rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>ไฮไลท์โฟกัส (Peaking)</span>
                </label>
              </div>

              <div className="text-neutral-400 hidden sm:block">
                <span>เซนเซอร์: 36×24มม. Full-Frame CMOS</span>
              </div>
            </div>
          </div>

          {/* Side Auxiliary Deck - 4 cols on large screens */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Realistic Light Meter */}
            <LightMeter deltaEV={deltaEV} targetEV={environment.ev} cameraEV={userEV} />

            {/* Live Camera State Telemetry Box */}
            <div className="p-4 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
                <span className="font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  สรุปผลทางฟิสิกส์ของการถ่ายภาพ
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  แบบเรียลไทม์
                </span>
              </div>

              {/* Readouts */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">ระยะชัดลึก (DoF):</span>
                  <span className="font-mono text-amber-400 font-medium">
                    {aperture <= 2.8 ? 'หน้าชัดหลังเบลอ (~15ซม. / โบเก้ละลาย)' : aperture <= 8 ? 'ระยะชัดปานกลาง (~1.2ม.)' : 'ชัดลึกทั้งภาพ (คมกริบยันฉากหลัง)'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">การเบลอจากการเคลื่อนไหว:</span>
                  <span className="font-mono text-sky-400 font-medium">
                    {shutter.value <= 1 / 500
                      ? '0° (หยุดภาพนิ่งสนิท)'
                      : shutter.value <= 1 / 60
                      ? '~18° (เริ่มมีรอยเบลอเล็กน้อย)'
                      : `~${Math.round(shutter.value * 900)}° (เบลอเป็นสาย Long Exposure)`}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">ความเนียนของภาพ (Noise):</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {iso <= 200 ? 'เนียนกริบ (สตูดิโอ ไร้ Noise)' : iso <= 800 ? 'เนียนดี (สัญญาณรบกวนต่ำ)' : 'มีเม็ดเกรน Noise หนาแน่น'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-400">สภาพแสงรอบข้าง:</span>
                  <span className="font-mono text-neutral-300">
                    {environment.name} (EV {environment.ev})
                  </span>
                </div>
              </div>

              {/* Shutter Click button for quick access */}
              <button
                onClick={handleTriggerShutter}
                className="w-full mt-2 py-2.5 bg-gradient-to-r from-neutral-800 to-neutral-700 hover:from-neutral-700 hover:to-neutral-600 active:scale-[0.98] rounded-lg border border-neutral-600 text-xs font-mono font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>
                  {appMode === 'mission' ? 'กดถ่ายภาพ & ตรวจการบ้าน [SPACE]' : 'กดชัตเตอร์ถ่ายภาพ [SPACE]'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Camera Controls Deck: Three Distinct Dials / Sliders */}
        <div className="mt-1">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                แผงควบคุมการตั้งค่ากล้อง (Controls Deck)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              [คลิกตัวเลขหรือเลื่อนสไลเดอร์เพื่อเปลี่ยนค่า]
            </span>
          </div>

          <CameraControls
            aperture={aperture}
            shutter={shutter}
            iso={iso}
            mode={mode}
            onApertureChange={handleApertureChange}
            onShutterChange={handleShutterChange}
            onIsoChange={handleIsoChange}
          />
        </div>

        {/* Educational Reference Cards at bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-800/80 text-xs text-neutral-400">
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <span className="font-bold text-amber-400 block mb-1 text-xs">
              01. รูรับแสง (Aperture - f-stop): ตัวคุมแสงและความชัดลึก
            </span>
            <p className="leading-relaxed text-neutral-300">
              เปรียบเสมือนม่านตาของกล้อง ยิ่งเลข f น้อย (เช่น f/1.4) รูจะยิ่งเปิดกว้าง แสงเข้าได้เยอะขึ้นเป็นเท่าตัว (+1 EV) และทำให้ฉากหลังละลายเบลอ (โบเก้) ช่วยให้ตัวแบบโดดเด่น ส่วนเลข f มาก (เช่น f/16) จะได้ภาพคมชัดลึกไปถึงฉากหลัง เหมาะกับภาพวิวทิวทัศน์
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <span className="font-bold text-sky-400 block mb-1 text-xs">
              02. ความเร็วชัตเตอร์ (Shutter Speed - วินาที): เวลาเปิดรับแสง
            </span>
            <p className="leading-relaxed text-neutral-300">
              ควบคุมระยะเวลาที่เซนเซอร์เปิดรับแสง ชัตเตอร์เร็วมาก (เช่น 1/1000s) จะหยุดการเคลื่อนไหวของวัตถุให้นิ่งสนิท ชัตเตอร์ช้า (เช่น 1/4s) จะเกิดเส้นสายความเคลื่อนไหว เช่น สายน้ำพริ้วหรือแสงไฟรถวิ่ง แต่ต้องระวังภาพสั่นหากถือด้วยมือ
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800/60">
            <span className="font-bold text-emerald-400 block mb-1 text-xs">
              03. ค่าความไวแสง (ISO): ตัวเร่งความสว่างในที่มืด
            </span>
            <p className="leading-relaxed text-neutral-300">
              คือการเร่งสัญญาณไฟฟ้าของเซนเซอร์ให้สว่างขึ้นในที่มืด เมื่อรูรับแสงและชัตเตอร์ขยายต่อไม่ได้แล้ว การดัน ISO สูงจะช่วยให้ภาพสว่างขึ้นได้ แต่จะแลกมาด้วยสัญญาณรบกวนหรือเม็ดเกรนทรายระยิบระยับ (Noise)
            </p>
          </div>
        </div>

        {/* Clean Footer */}
        <footer className="mt-auto pt-6 pb-2 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-[11px] font-mono gap-2">
          <div>โปรแกรมจำลองการตั้งค่ากล้องถ่ายภาพ · สื่อการเรียนรู้ฟิสิกส์การถ่ายภาพดิจิทัล</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAppMode(appMode === 'sandbox' ? 'mission' : 'sandbox')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              โหมด: {appMode === 'sandbox' ? 'สลับไปโหมดภารกิจฝึกถ่าย' : 'สลับไปโหมดทดลองอิสระ'}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsTriangleModalOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              คู่มือวัดแสง
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsGalleryModalOpen(true)}
              className="hover:text-neutral-300 transition-colors cursor-pointer"
            >
              ม้วนฟิล์มที่ถ่าย ({snapshots.length})
            </button>
          </div>
        </footer>
      </div>

      {/* Mission Result & Knowledge Check Modal */}
      <MissionResultModal
        isOpen={isMissionResultOpen}
        onClose={() => setIsMissionResultOpen(false)}
        result={missionResult}
        mission={currentMission}
        snapshot={missionSnapshot}
        onNextMission={handleNextMission}
        hasMoreMissions={hasMoreMissions}
      />

      {/* Exposure Triangle Reference Modal */}
      <ExposureTriangleModal
        isOpen={isTriangleModalOpen}
        onClose={() => setIsTriangleModalOpen(false)}
        aperture={aperture}
        shutterText={shutter.label}
        iso={iso}
      />

      {/* Guided Challenges Modal */}
      <ChallengesModal
        isOpen={isChallengesModalOpen}
        onClose={() => setIsChallengesModalOpen(false)}
        aperture={aperture}
        shutter={shutter}
        iso={iso}
        deltaEV={deltaEV}
        currentEnvironment={environment}
        onSelectEnvironment={(env) => {
          handleEnvironmentChange(env);
        }}
      />

      {/* Filmstrip & Snapshot Gallery Modal */}
      <SnapshotGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        snapshots={snapshots}
        onClearSnapshots={() => setSnapshots([])}
      />
    </div>
  );
}
