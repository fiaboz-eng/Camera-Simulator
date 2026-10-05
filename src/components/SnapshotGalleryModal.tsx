import React from 'react';
import { X, Film, Download, Trash2, Calendar } from 'lucide-react';
import { PhotoSnapshot } from '../types/camera';

interface SnapshotGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: PhotoSnapshot[];
  onClearSnapshots: () => void;
}

export const SnapshotGalleryModal: React.FC<SnapshotGalleryModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onClearSnapshots,
}) => {
  if (!isOpen) return null;

  const downloadImage = (snap: PhotoSnapshot) => {
    const link = document.createElement('a');
    link.href = snap.dataUrl;
    link.download = `camera_exposure_${snap.shutterText.replace('/', '-')}_f${snap.aperture}_iso${snap.iso}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-4xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                ม้วนฟิล์มและข้อมูลภาพถ่าย (EXIF Review)
              </h2>
              <p className="text-xs text-neutral-400">
                เปรียบเทียบภาพที่กดชัตเตอร์และตรวจสอบค่าการตั้งค่ากล้องในแต่ละภาพ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {snapshots.length > 0 && (
              <button
                onClick={onClearSnapshots}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/40 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างภาพทั้งหมด</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {snapshots.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-30 text-neutral-500" />
              <p className="text-sm font-medium text-neutral-300">ยังไม่มีภาพถ่ายในม้วนฟิล์ม</p>
              <p className="text-xs mt-1 text-neutral-400">
                กดปุ่มชัตเตอร์สีแดงบนตัวกล้อง หรือกด Spacebar บนคีย์บอร์ดเพื่อบันทึกภาพตัวอย่าง
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex flex-col group shadow-lg"
                >
                  {/* Photo Frame */}
                  <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                    <img
                      src={snap.dataUrl}
                      alt="Exposure snapshot"
                      className="w-full h-full object-cover"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border backdrop-blur-xs font-bold ${
                          snap.status === 'correct'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : snap.status === 'under'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                            : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                        }`}
                      >
                        {snap.status === 'correct'
                          ? 'แสงพอดีสมบูรณ์ (0.0 EV)'
                          : snap.status === 'under'
                          ? `ภาพมืดไป (${snap.evDelta.toFixed(1)} EV)`
                          : `ภาพสว่างเกิน (+${snap.evDelta.toFixed(1)} EV)`}
                      </span>
                    </div>

                    {/* Download button */}
                    <button
                      onClick={() => downloadImage(snap)}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white backdrop-blur-xs border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                      title="ดาวน์โหลดภาพถ่าย"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metadata strip */}
                  <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between text-white font-bold">
                      <span>
                        f/{snap.aperture.toFixed(1)} · {snap.shutterText} · ISO {snap.iso}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {snap.evDelta > 0 ? `+${snap.evDelta.toFixed(1)}` : snap.evDelta.toFixed(1)} EV
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>สภาพแสง: {snap.environmentName}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(snap.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
