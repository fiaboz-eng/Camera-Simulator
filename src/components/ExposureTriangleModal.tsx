import React from 'react';
import { X, Aperture, Timer, Zap, Lightbulb } from 'lucide-react';

interface ExposureTriangleModalProps {
  isOpen: boolean;
  onClose: () => void;
  aperture: number;
  shutterText: string;
  iso: number;
}

export const ExposureTriangleModal: React.FC<ExposureTriangleModalProps> = ({
  isOpen,
  onClose,
  aperture,
  shutterText,
  iso,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                สามเหลี่ยมการเปิดรับแสง (The Exposure Triangle)
              </h2>
              <p className="text-xs text-neutral-400">
                เรียนรู้ความสัมพันธ์ของ 3 ปัจจัยหลัก: รูรับแสง · ความเร็วชัตเตอร์ · ค่าความไวแสง (ISO)
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

        {/* Content */}
        <div className="mt-6 space-y-6">
          {/* Interactive Triangle Diagram */}
          <div className="relative p-6 bg-black/60 rounded-xl border border-neutral-800 flex flex-col items-center">
            <svg viewBox="0 0 400 320" className="w-full max-w-md h-auto">
              {/* Outer Triangle */}
              <polygon
                points="200,30 50,280 350,280"
                fill="rgba(245, 158, 11, 0.04)"
                stroke="#404040"
                strokeWidth="2"
                strokeDasharray="4,4"
              />

              {/* Connecting Gradient Lines */}
              <line x1="200" y1="30" x2="50" y2="280" stroke="#f59e0b" strokeWidth="3" />
              <line x1="50" y1="280" x2="350" y2="280" stroke="#0ea5e9" strokeWidth="3" />
              <line x1="350" y1="280" x2="200" y2="30" stroke="#10b981" strokeWidth="3" />

              {/* Center Exposure Equilibrium Hub */}
              <circle cx="200" cy="190" r="38" fill="#171717" stroke="#525252" strokeWidth="2" />
              <text
                x="200"
                y="186"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                แสงพอดี
              </text>
              <text
                x="200"
                y="202"
                fill="#10b981"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                0.0 EV
              </text>

              {/* Vertex 1: Aperture (Top) */}
              <circle cx="200" cy="30" r="22" fill="#2d1c08" stroke="#f59e0b" strokeWidth="3" />
              <text x="200" y="34" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
                Av
              </text>
              <text x="200" y="70" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                รูรับแสง (Aperture)
              </text>
              <text x="200" y="85" fill="#a3a3a3" fontSize="10" textAnchor="middle">
                ความชัดลึก/โบเก้ · f/{aperture.toFixed(1)}
              </text>

              {/* Vertex 2: Shutter Speed (Bottom-Left) */}
              <circle cx="50" cy="280" r="22" fill="#082338" stroke="#0ea5e9" strokeWidth="3" />
              <text x="50" y="284" fill="#0ea5e9" fontSize="11" fontWeight="bold" textAnchor="middle">
                Tv
              </text>
              <text x="65" y="306" fill="#0ea5e9" fontSize="12" fontWeight="bold" textAnchor="middle">
                ความเร็วชัตเตอร์
              </text>
              <text x="65" y="318" fill="#a3a3a3" fontSize="10" textAnchor="middle">
                การเคลื่อนไหว · {shutterText}
              </text>

              {/* Vertex 3: ISO (Bottom-Right) */}
              <circle cx="350" cy="280" r="22" fill="#062d1c" stroke="#10b981" strokeWidth="3" />
              <text x="350" y="284" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle">
                ISO
              </text>
              <text x="335" y="306" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle">
                ความไวแสงเซนเซอร์
              </text>
              <text x="335" y="318" fill="#a3a3a3" fontSize="10" textAnchor="middle">
                กำลังขยาย · ISO {iso}
              </text>
            </svg>
          </div>

          {/* Three Corner Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1.5">
                <Aperture className="w-4 h-4" />
                <span>รูรับแสง (Aperture f-stop)</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                เหมือนม่านตาของกล้อง เลข f น้อย (เช่น f/1.4) รูเปิดกว้างมาก แสงเข้าเยอะ ได้หน้าชัดหลังเบลอสวยงาม เลข f มาก (เช่น f/16) รูแคบ แสงเข้าน้อย ภาพคมชัดทั้งภาพยันฉากหลัง
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-sky-500/30">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1.5">
                <Timer className="w-4 h-4" />
                <span>ความเร็วชัตเตอร์ (Shutter Speed)</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                เวลาที่เซนเซอร์เปิดรับแสง ชัตเตอร์เร็ว (เช่น 1/1000s) หยุดภาพเคลื่อนไหวให้นิ่งสนิท ชัตเตอร์ช้า (เช่น 1/4s) ทำให้เกิดเส้นสายการเคลื่อนไหว แต่ต้องระวังภาพเบลอจากมือสั่น
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1.5">
                <Zap className="w-4 h-4" />
                <span>ค่าความไวแสง (ISO)</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                การเร่งสัญญาณไฟฟ้าในที่มืด ช่วยให้ภาพสว่างขึ้นได้เมื่อรูรับแสงและชัตเตอร์สุดทางแล้ว แต่ถ้าดัน ISO สูงเกินไป (เช่น 3200+) จะทำให้เกิดเม็ดเกรนสัญญาณรบกวน (Noise)
              </p>
            </div>
          </div>

          {/* The Law of Reciprocity */}
          <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-xs space-y-2">
            <span className="font-bold text-white block text-sm">
              กฎการชดเชยแสง (The Golden Rule of Reciprocity):
            </span>
            <p className="text-neutral-300 leading-relaxed">
              ทั้ง 3 ตัวแปรทำงานทดแทนกันได้! หากคุณปรับค่าหนึ่งให้ <strong className="text-amber-400">สว่างขึ้น 1 Stop</strong> (เช่น ขยายรูรับแสงจาก f/4 เป็น f/2.8) คุณต้องปรับอีกค่าหนึ่งให้ <strong className="text-sky-400">มืดลง 1 Stop</strong> (เช่น เร่งความเร็วชัตเตอร์จาก 1/125s เป็น 1/250s หรือลด ISO จาก 400 เป็น 200) เพื่อรักษาระดับแสงรวมให้สมดุลที่ <strong>0.0 EV</strong> เสมอ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-amber-500 text-neutral-950 hover:bg-amber-400 rounded-lg transition-colors font-medium shadow-md cursor-pointer"
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
    </div>
  );
};
