import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
  ShutterSpeedOption,
  LearningChallenge,
} from '../types/camera';

/**
 * Calculates Camera EV (Exposure Value at ISO 100 benchmark):
 * EV_camera = log2(N^2 / t) - log2(ISO / 100)
 *
 * Higher EV_camera represents camera settings that let in LESS light (e.g. f/16, 1/1000s).
 */
export function calculateCameraEV(aperture: number, shutterSeconds: number, iso: number): number {
  const apertureTerm = Math.log2((aperture * aperture) / shutterSeconds);
  const isoTerm = Math.log2(iso / 100);
  return apertureTerm - isoTerm;
}

/**
 * Calculates exposure deviation (Delta EV):
 * Delta EV = Ambient EV - Camera Settings EV
 *
 * When Delta EV == 0: Exact nominal exposure
 * When Delta EV > 0: Overexposed (settings let in too much light for the scene)
 * When Delta EV < 0: Underexposed (settings let in insufficient light)
 */
export function calculateDeltaEV(
  ambientEV: number,
  aperture: number,
  shutterSeconds: number,
  iso: number
): number {
  const cameraEV = calculateCameraEV(aperture, shutterSeconds, iso);
  // Round to nearest 1/10th for stability
  return Math.round((ambientEV - cameraEV) * 10) / 10;
}

/**
 * Exposure brightness multiplier from Delta EV
 * Tone mapped to avoid harsh digital overflow
 */
export function getExposureMultiplier(deltaEV: number): number {
  // Pure photographic 2^deltaEV, clamped smoothly
  return Math.pow(2, deltaEV);
}

/**
 * Get exposure status classification
 */
export function getExposureStatus(deltaEV: number): {
  status: 'under' | 'correct' | 'over';
  label: string;
  subtext: string;
  colorClass: string;
  badgeBg: string;
  badgeBorder: string;
} {
  if (deltaEV < -0.3) {
    const stopsUnder = Math.abs(deltaEV).toFixed(1);
    return {
      status: 'under',
      label: `ภาพมืดเกินไป (-${stopsUnder} EV)`,
      subtext: 'แสงเข้าสู่เซนเซอร์ไม่เพียงพอ ทำให้ภาพมืดและเงาจมเป็นสีดำสนิท',
      colorClass: 'text-amber-400',
      badgeBg: 'bg-amber-950/40 text-amber-300',
      badgeBorder: 'border-amber-700/50',
    };
  } else if (deltaEV > 0.3) {
    const stopsOver = deltaEV.toFixed(1);
    return {
      status: 'over',
      label: `ภาพสว่างจ้าเกินไป (+${stopsOver} EV)`,
      subtext: 'แสงเข้าสู่เซนเซอร์มากเกินไป ทำให้ภาพขาวโพลน รายละเอียดในส่วนสว่างสูญหาย',
      colorClass: 'text-rose-400',
      badgeBg: 'bg-rose-950/40 text-rose-300',
      badgeBorder: 'border-rose-700/50',
    };
  } else {
    return {
      status: 'correct',
      label: 'แสงพอดีสมบูรณ์แบบ (0.0 EV)',
      subtext: 'ความสว่างกำลังพอดี เก็บรายละเอียดได้ครบทั้งส่วนมืดและส่วนสว่างอย่างเป็นธรรมชาติ',
      colorClass: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/40 text-emerald-300',
      badgeBorder: 'border-emerald-700/50',
    };
  }
}

/**
 * Finds the closest shutter speed to achieve 0 EV given aperture and ISO
 */
export function autoCalculateShutter(
  ambientEV: number,
  aperture: number,
  iso: number
): ShutterSpeedOption {
  // cameraEV = log2(N^2 / t) - log2(ISO/100) = ambientEV
  // log2(N^2 / t) = ambientEV + log2(ISO/100)
  // N^2 / t = 2^(ambientEV + log2(ISO/100))
  // t = N^2 / 2^(ambientEV + log2(ISO/100))
  const targetPower = ambientEV + Math.log2(iso / 100);
  const targetSeconds = (aperture * aperture) / Math.pow(2, targetPower);

  // Pick nearest discrete shutter speed
  let closest = SHUTTER_SPEEDS[0];
  let minDiff = Infinity;
  for (const s of SHUTTER_SPEEDS) {
    const diff = Math.abs(Math.log2(s.value) - Math.log2(targetSeconds));
    if (diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }
  return closest;
}

/**
 * Finds the closest aperture to achieve 0 EV given shutter speed and ISO
 */
export function autoCalculateAperture(
  ambientEV: number,
  shutterSeconds: number,
  iso: number
): number {
  // N^2 = t * 2^(ambientEV + log2(ISO/100))
  // N = sqrt(t * 2^(ambientEV + log2(ISO/100)))
  const targetPower = ambientEV + Math.log2(iso / 100);
  const targetAperture = Math.sqrt(shutterSeconds * Math.pow(2, targetPower));

  let closest = APERTURE_VALUES[0];
  let minDiff = Infinity;
  for (const a of APERTURE_VALUES) {
    const diff = Math.abs(Math.log2(a) - Math.log2(targetAperture));
    if (diff < minDiff) {
      minDiff = diff;
      closest = a;
    }
  }
  return closest;
}

export const LEARNING_CHALLENGES: LearningChallenge[] = [
  {
    id: 'freeze_action',
    title: 'หยุดภาพเคลื่อนไหวความเร็วสูง (Freeze Action)',
    brief: 'จับภาพวงล้อที่หมุนเร็วให้หยุดนิ่งสนิท คมกริบทุกซี่ โดยภาพต้องไม่มืดเกินไป',
    goalExplanation:
      'วัตถุที่เคลื่อนที่เร็วต้องใช้ความเร็วชัตเตอร์อย่างน้อย 1/500s หรือเร็วกว่านั้น (เช่น 1/1000s) และเพื่อป้องกันไม่ให้ภาพมืดทึบ ให้เปิดรูรับแสงให้กว้าง (เช่น f/1.4 - f/2.8) หรือดันค่า ISO ช่วยตามความเหมาะสม',
    targetEnvironmentId: 'indoor_studio',
    targetCondition: (aperture, shutter, iso, evDelta) => {
      const isFastEnough = shutter.value <= 1 / 500;
      const isBalanced = Math.abs(evDelta) <= 0.4;
      if (!isFastEnough) {
        return {
          success: false,
          feedback: `ความเร็วชัตเตอร์ ${shutter.label} ยังช้าไป! วัตถุจะยังเบลอ ให้ปรับเป็น 1/500s หรือไวกว่านั้น`,
        };
      }
      if (!isBalanced) {
        return {
          success: false,
          feedback: `หยุดภาพได้นิ่งสนิทแล้ว แต่แสงยัง${evDelta > 0 ? 'สว่างจ้าเกินไป' : 'มืดเกินไป'} (${Math.abs(evDelta).toFixed(1)} EV) ให้ปรับรูรับแสงหรือ ISO เพื่อให้เข็มชี้ที่ 0.0 EV`,
        };
      }
      return {
        success: true,
        feedback: 'ยอดเยี่ยมมาก! ชัตเตอร์เร็วพอจนหยุดวงล้อได้นิ่งสนิท คมกริบ และแสงสว่างพอดีสมบูรณ์แบบ',
      };
    },
  },
  {
    id: 'shallow_bokeh',
    title: 'ถ่ายภาพบุคคลหน้าชัดหลังละลาย (Cinematic Bokeh)',
    brief: 'ละลายฉากหลังเป็นโบเก้นุ่มนวล ตัวแบบโดดเด่น คมชัด และแสงสว่างพอดี',
    goalExplanation:
      'การละลายฉากหลังต้องเปิดรูรับแสงกว้างสุด (f/1.4 หรือ f/2.0) แต่การเปิดรูกว้างในเวลากลางวันจะทำให้แสงเข้ามหาศาล จึงต้องชดเชยด้วยความเร็วชัตเตอร์สูงและใช้ ISO ต่ำ (100–400)',
    targetEnvironmentId: 'golden_hour',
    targetCondition: (aperture, shutter, iso, evDelta) => {
      const isWideAperture = aperture <= 2.0;
      const isLowIso = iso <= 400;
      const isBalanced = Math.abs(evDelta) <= 0.4;
      if (!isWideAperture) {
        return {
          success: false,
          feedback: `รูรับแสง f/${aperture.toFixed(1)} ยังแคบเกินไป ทำให้ฉากหลังยังชัด ให้เปิดกว้างที่ f/1.4 หรือ f/2.0`,
        };
      }
      if (!isLowIso) {
        return {
          success: false,
          feedback: `แสงยามเย็นมีปริมาณพอสมควร ควรคุม ISO ที่ 100–400 เพื่อให้เนื้อภาพเนียนละเอียด ไร้สัญญาณรบกวน (Noise)`,
        };
      }
      if (!isBalanced) {
        return {
          success: false,
          feedback: `ได้หน้าชัดหลังเบลอสวยงามแล้ว แต่แสงยังคลาดเคลื่อนอยู่ ${evDelta > 0 ? '+' : ''}${evDelta.toFixed(1)} EV หมุนแป้นชัตเตอร์เพื่อปรับแสงให้พอดี`,
        };
      }
      return {
        success: true,
        feedback: 'สวยงามระดับมืออาชีพ! โบเก้ฉากหลังละลายเนียนตา ตัวแบบคมชัดโดดเด่น และแสงพอดีเป๊ะ',
      };
    },
  },
  {
    id: 'silky_motion',
    title: 'สร้างเส้นสายความเคลื่อนไหว (Motion Blur Trails)',
    brief: 'เปิดชัตเตอร์ช้าเพื่อสร้างเส้นสายการหมุนพริ้วไหว โดยไม่ให้ภาพสว่างจ้าจนขาวโพลน',
    goalExplanation:
      'ต้องใช้ความเร็วชัตเตอร์ช้า (1/4s หรือ 1/2s) เพื่อให้แสงวาดเป็นสาย แต่เนื่องจากชัตเตอร์เปิดนาน แสงจะเข้าเยอะมาก จึงต้องหรี่รูรับแสงให้แคบลง (f/11 - f/22) และใช้ ISO 100',
    targetEnvironmentId: 'bright_sun',
    targetCondition: (aperture, shutter, iso, evDelta) => {
      const isSlowShutter = shutter.value >= 1 / 4;
      const isStoppedDown = aperture >= 11;
      const isBalanced = Math.abs(evDelta) <= 0.4;
      if (!isSlowShutter) {
        return {
          success: false,
          feedback: `ความเร็วชัตเตอร์ ${shutter.label} ยังเร็วไปสำหรับการลากสายภาพ ให้ปรับเป็น 1/4s หรือ 1/2s`,
        };
      }
      if (!isStoppedDown) {
        return {
          success: false,
          feedback: `การเปิดชัตเตอร์นานกลางแดดจ้า ต้องหรี่รูรับแสงแคบลงเป็น f/11–f/22 เพื่อป้องกันภาพขาวโพลน`,
        };
      }
      if (!isBalanced) {
        return {
          success: false,
          feedback: `เกิดเส้นสายการเคลื่อนไหวแล้ว แต่แสงยัง${evDelta > 0 ? 'สว่างจ้าเกินไป' : 'มืดเกินไป'} (${evDelta > 0 ? '+' : ''}${evDelta.toFixed(1)} EV) ปรับละเอียดที่รูรับแสงหรือ ISO`,
        };
      }
      return {
        success: true,
        feedback: 'เป๊ะมาก! วัตถุหมุนกลายเป็นเส้นสายเรืองแสงที่นุ่มนวล โดยที่ส่วนสว่างไม่ขาวโพลนจนสูญเสียรายละเอียด',
      };
    },
  },
  {
    id: 'night_handheld',
    title: 'ถ่ายภาพกลางคืนโดยถือด้วยมือ (Handheld Night)',
    brief: 'ถ่ายภาพถนนยามค่ำคืนโดยไม่ใช้ขาตั้ง ไม่ให้ภาพสั่นไหว (ชัตเตอร์ >= 1/60s) และแสงพอดี',
    goalExplanation:
      'การถือกล้องด้วยมือในที่แสงน้อย (EV 2) ต้องรักษาชัตเตอร์ไม่ให้ช้ากว่า 1/60s เพื่อป้องกันมือสั่น จึงต้องเปิดรูรับแสงกว้างสุด (f/1.4 หรือ f/2.0) และดัน ISO ขึ้นเป็น 1600–6400',
    targetEnvironmentId: 'night_street',
    targetCondition: (aperture, shutter, iso, evDelta) => {
      const isSafeHandheld = shutter.value <= 1 / 60;
      const isWide = aperture <= 2.8;
      const isHighIso = iso >= 1600;
      const isBalanced = Math.abs(evDelta) <= 0.5;

      if (!isSafeHandheld) {
        return {
          success: false,
          feedback: `ชัตเตอร์ ${shutter.label} ช้ากว่า 1/60s! ถ้าไม่ใช้ขาตั้ง ภาพจะเบลอจากการสั่นของมือ`,
        };
      }
      if (!isWide) {
        return {
          success: false,
          feedback: `ในที่แสงน้อย ต้องเปิดรับแสงให้มากที่สุด ให้เปิดรูรับแสงกว้าง f/1.4 หรือ f/2.0`,
        };
      }
      if (!isHighIso) {
        return {
          success: false,
          feedback: `การถ่ายกลางคืนด้วยมือเปล่า จำเป็นต้องเร่งความไวแสง ดัน ISO ขึ้นเป็น 1600 หรือ 3200+`,
        };
      }
      if (!isBalanced) {
        return {
          success: false,
          feedback: `ความเร็วปลอดภัยจากมือสั่นแล้ว แต่แสงยัง${evDelta > 0 ? 'สว่างเกิน' : 'มืดไป'} (${evDelta > 0 ? '+' : ''}${evDelta.toFixed(1)} EV) ปรับสมดุลเพิ่มอีกนิด`,
        };
      }
      return {
        success: true,
        feedback: 'ยอดเยี่ยมที่สุด! ถือกล้องถ่ายกลางคืนได้คมชัด ไม่สั่นไหว และได้แสงสว่างพอดีแม้ในสภาพแสงน้อยมาก',
      };
    },
  },
];
