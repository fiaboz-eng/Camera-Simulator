export interface ShutterSpeedOption {
  label: string;
  value: number; // in seconds, e.g. 1/125 = 0.008
  fractionText: string;
}

export const APERTURE_VALUES: number[] = [1.4, 2.0, 2.8, 4.0, 5.6, 8.0, 11.0, 16.0, 22.0];

export const SHUTTER_SPEEDS: ShutterSpeedOption[] = [
  { label: '1/2000s', value: 1 / 2000, fractionText: '1/2000' },
  { label: '1/1000s', value: 1 / 1000, fractionText: '1/1000' },
  { label: '1/500s', value: 1 / 500, fractionText: '1/500' },
  { label: '1/250s', value: 1 / 250, fractionText: '1/250' },
  { label: '1/125s', value: 1 / 125, fractionText: '1/125' },
  { label: '1/60s', value: 1 / 60, fractionText: '1/60' },
  { label: '1/30s', value: 1 / 30, fractionText: '1/30' },
  { label: '1/15s', value: 1 / 15, fractionText: '1/15' },
  { label: '1/8s', value: 1 / 8, fractionText: '1/8' },
  { label: '1/4s', value: 1 / 4, fractionText: '1/4' },
  { label: '1/2s', value: 1 / 2, fractionText: '1/2' },
];

export const ISO_VALUES: number[] = [100, 200, 400, 800, 1600, 3200, 6400];

export type CameraMode = 'M' | 'Av' | 'Tv' | 'P';

export interface AmbientEnvironment {
  id: string;
  name: string;
  ev: number;
  description: string;
  icon: string;
}

export const AMBIENT_ENVIRONMENTS: AmbientEnvironment[] = [
  {
    id: 'baseline_target',
    name: 'แสงมาตรฐานสตูดิโอ (Target EV 12)',
    ev: 12.0,
    description: 'สภาพแสงอ้างอิงมาตรฐานสำหรับการทดสอบ เหมาะแก่การเรียนรู้ (EV 12)',
    icon: 'Lamp',
  },
  {
    id: 'bright_sun',
    name: 'แดดจ้ากลางแจ้ง (EV 14)',
    ev: 14.0,
    description: 'แสงแดดจัดตอนเที่ยงวัน ฟ้าโปร่ง แสงสว่างจ้ามาก',
    icon: 'Sun',
  },
  {
    id: 'golden_hour',
    name: 'แสงสีทองยามเย็น (EV 11)',
    ev: 11.0,
    description: 'แสงแดดอุ่นช่วงพระอาทิตย์ตก แสงนุ่มนวล ทิศทางแสงสวยงาม',
    icon: 'Sunset',
  },
  {
    id: 'overcast',
    name: 'วันฟ้าครึ้มเมฆมาก (EV 9)',
    ev: 9.0,
    description: 'เมฆบังดวงอาทิตย์ แสงกระจายนุ่ม เงาจาง เหมาะกับภาพแอ็กชัน',
    icon: 'CloudSun',
  },
  {
    id: 'indoor_studio',
    name: 'ในร่ม / ห้องสตูดิโอ (EV 6)',
    ev: 6.0,
    description: 'แสงไฟในห้องและโคมไฟสตูดิโอทั่วไป แสงค่อนข้างน้อย',
    icon: 'Lamp',
  },
  {
    id: 'night_street',
    name: 'ท้องถนนยามค่ำคืน (EV 2)',
    ev: 2.0,
    description: 'แสงไฟนีออนและเสาไฟริมถนน แสงน้อยมาก ท้าทายเซนเซอร์กล้อง',
    icon: 'Moon',
  },
];

export type SceneType = 'studio_wheel' | 'night_traffic' | 'hummingbird';

export interface SceneOption {
  id: SceneType;
  title: string;
  description: string;
}

export const SCENE_OPTIONS: SceneOption[] = [
  {
    id: 'studio_wheel',
    title: 'วงล้อสีหมุนเร็วในสตูดิโอ (Kinetic Wheel)',
    description: 'วงล้อสีหมุนเร็วและขาตั้งแบบคมชัด เหมาะสำหรับดูโบเก้และการหยุดภาพ',
  },
  {
    id: 'night_traffic',
    title: 'ไฟรถวิ่งในเมืองยามค่ำคืน (Night City)',
    description: 'ไฟหน้ารถและไฟท้ายรถวิ่งเป็นเส้นสาย เหมาะกับชัตเตอร์ช้า',
  },
  {
    id: 'hummingbird',
    title: 'นกฮัมมิ่งเบิร์ดกระพือปีกเร็วในสวน (Hummingbird)',
    description: 'ปีกนกกระพือ 40 ครั้งต่อวินาที ท้าทายชัตเตอร์ความเร็วสูง',
  },
];

export interface PhotoSnapshot {
  id: string;
  timestamp: number;
  dataUrl: string;
  aperture: number;
  shutterText: string;
  iso: number;
  evDelta: number;
  environmentName: string;
  status: 'under' | 'correct' | 'over';
}

export interface LearningChallenge {
  id: string;
  title: string;
  brief: string;
  goalExplanation: string;
  targetEnvironmentId: string;
  targetCondition: (
    aperture: number,
    shutter: ShutterSpeedOption,
    iso: number,
    evDelta: number
  ) => {
    success: boolean;
    feedback: string;
  };
}

export interface MissionCriterion {
  id: string;
  label: string;
  targetDescription: string;
}

export interface MissionCheck {
  label: string;
  passed: boolean;
  currentValueText: string;
  detail: string;
}

export interface MissionValidationResult {
  passed: boolean;
  score: number; // 0 to 100
  title: string;
  explanation: string;
  checks: MissionCheck[];
}

export interface MissionScenario {
  id: string;
  number: number;
  title: string;
  badge: string;
  brief: string;
  environmentId: string;
  sceneId: SceneType;
  primaryGoal: string;
  criteria: MissionCriterion[];
  validate: (
    aperture: number,
    shutter: ShutterSpeedOption,
    iso: number,
    deltaEV: number
  ) => MissionValidationResult;
}

export const MISSION_SCENARIOS: MissionScenario[] = [
  {
    id: 'portrait_bokeh',
    number: 1,
    title: 'ถ่ายภาพบุคคลหน้าชัดหลังเบลอ (Portrait Bokeh)',
    badge: 'หน้าชัดหลังเบลอ',
    brief: 'ฝึกถ่ายภาพบุคคลให้ตัวแบบคมชัด โดดเด่น และฉากหลังละลายเบลอสวยงาม (โบเก้นุ่มนวล) พร้อมคุมแสงให้พอดี 0.0 EV',
    environmentId: 'baseline_target',
    sceneId: 'studio_wheel',
    primaryGoal: 'รูรับแสงกว้าง f <= 2.8 และคุมแสงให้พอดี (|EV| <= 0.4)',
    criteria: [
      {
        id: 'aperture',
        label: 'รูรับแสง (Aperture)',
        targetDescription: 'ใช้ f/2.8 หรือกว้างกว่านั้น (f/1.4, f/2.0, f/2.8) เพื่อให้ฉากหลังเบลอ',
      },
      {
        id: 'exposure',
        label: 'ความสว่างพอดี (Exposure)',
        targetDescription: 'คุมสเกลวัดแสงให้อยู่ในช่วง +/- 0.4 EV เพื่อให้แสงพอดีเป็นธรรมชาติ',
      },
    ],
    validate: (aperture, shutter, iso, deltaEV) => {
      const aperturePassed = aperture <= 2.8;
      const exposurePassed = Math.abs(deltaEV) <= 0.4;
      const allPassed = aperturePassed && exposurePassed;

      const checks: MissionCheck[] = [
        {
          label: 'ความกว้างรูรับแสง (f <= 2.8)',
          passed: aperturePassed,
          currentValueText: `f/${aperture.toFixed(1)}`,
          detail: aperturePassed
            ? `ยอดเยี่ยม! รูรับแสงกว้าง f/${aperture.toFixed(1)} ช่วยละลายฉากหลังเป็นโบเก้นุ่มนวล ตัวแบบดูมีมิติ`
            : `ค่า f/${aperture.toFixed(1)} แคบเกินไป ทำให้ฉากหลังยังชัดแย่งสายตา ให้เปิดรูรับแสงกว้างขึ้นที่ f/2.8, f/2.0 หรือ f/1.4`,
        },
        {
          label: 'ความสว่างภาพพอดี (|EV| <= 0.4)',
          passed: exposurePassed,
          currentValueText: `${deltaEV > 0 ? '+' : ''}${deltaEV.toFixed(1)} EV`,
          detail: exposurePassed
            ? 'แสงพอดีสมบูรณ์แบบ: ไม่มืดทึบและไม่สว่างจนขาวโพลน'
            : deltaEV > 0
            ? `ภาพสว่างจ้าเกินไป (+${deltaEV.toFixed(1)} EV)! เมื่อเปิดรูรับแสงกว้าง แสงจะเข้าเยอะมาก ให้เร่งความเร็วชัตเตอร์ให้ไวขึ้นเพื่อลดแสง`
            : `ภาพมืดเกินไป (${deltaEV.toFixed(1)} EV)! ให้ลดความเร็วชัตเตอร์ลงหรือดัน ISO ขึ้นอีกเล็กน้อย`,
        },
      ];

      const score = (aperturePassed ? 50 : 0) + (exposurePassed ? 50 : Math.max(0, 50 - Math.round(Math.abs(deltaEV) * 20)));

      return {
        passed: allPassed,
        score: allPassed ? 100 : score,
        title: allPassed ? 'ผ่านภารกิจยอดเยี่ยม!' : 'ยังไม่ผ่าน ลองปรับอีกนิดนะ',
        explanation: allPassed
          ? 'เทคนิคยอดเยี่ยมมาก! การถ่ายภาพบุคคล (Portrait) นิยมใช้รูรับแสงกว้างเพื่อเบลอฉากหลังรบกวนออกไป และคุณสามารถปรับชัตเตอร์กับ ISO ได้สมดุล ทำให้ภาพสว่างกำลังพอดี'
          : !aperturePassed
          ? 'หัวใจของภาพ Portrait คือการแยกตัวแบบออกจากฉากหลัง รูรับแสงที่แคบ (f/4 ขึ้นไป) จะทำให้ฉากหลังชัดเกินไป'
          : 'คุณเลือกรูรับแสงได้ถูกต้องแล้ว แต่แสงยังไม่สมดุล สังเกตแถบสเกลวัดแสงแล้วปรับชัตเตอร์หรือ ISO ให้เข็มชี้ตรงกลาง (0.0 EV)',
        checks,
      };
    },
  },
  {
    id: 'sports_action',
    number: 2,
    title: 'ถ่ายภาพกีฬาหยุดการเคลื่อนไหว (Sports Action)',
    badge: 'หยุดภาพเสี้ยววินาที',
    brief: 'ฝึกหยุดการเคลื่อนไหวของวัตถุที่หมุนเร็วให้คมชัด ไร้รอยเบลอ ในสภาพแสงวันฟ้าครึ้ม (EV 9.0)',
    environmentId: 'overcast',
    sceneId: 'studio_wheel',
    primaryGoal: 'ชัตเตอร์ไว >= 1/1000s ในวันฟ้าครึ้ม และคุมแสงให้พอดี',
    criteria: [
      {
        id: 'shutter',
        label: 'ความเร็วชัตเตอร์',
        targetDescription: 'ใช้ 1/1000s หรือ 1/2000s เพื่อหยุดการเคลื่อนไหวนิ่งสนิท',
      },
      {
        id: 'exposure',
        label: 'ความสว่างพอดี (Exposure)',
        targetDescription: 'คุมสเกลวัดแสงให้อยู่ในช่วง +/- 0.4 EV ในสภาพแสงฟ้าครึ้ม',
      },
    ],
    validate: (aperture, shutter, iso, deltaEV) => {
      const shutterPassed = shutter.value <= 1 / 1000;
      const exposurePassed = Math.abs(deltaEV) <= 0.4;
      const allPassed = shutterPassed && exposurePassed;

      const checks: MissionCheck[] = [
        {
          label: 'ชัตเตอร์หยุดแอ็กชัน (>= 1/1000s)',
          passed: shutterPassed,
          currentValueText: shutter.label,
          detail: shutterPassed
            ? `ยอดเยี่ยม! ความเร็ว ${shutter.label} จับภาพวัตถุที่หมุนเร็วให้นิ่งสนิท คมชัดทุกรายละเอียด`
            : `ชัตเตอร์ ${shutter.label} ยังช้าเกินไป วัตถุที่เคลื่อนไหวเร็วจะเบลอเป็นสาย ให้ปรับเป็น 1/1000s หรือ 1/2000s`,
        },
        {
          label: 'ความสว่างในวันฟ้าครึ้ม (|EV| <= 0.4)',
          passed: exposurePassed,
          currentValueText: `${deltaEV > 0 ? '+' : ''}${deltaEV.toFixed(1)} EV`,
          detail: exposurePassed
            ? 'แสงพอดีสมบูรณ์แบบ: เซนเซอร์ได้รับแสงเพียงพอแม้จะเปิดชัตเตอร์เพียงเสี้ยววินาที'
            : deltaEV < 0
            ? `ภาพมืดเกินไป (${Math.abs(deltaEV).toFixed(1)} EV)! ชัตเตอร์ที่เร็วมากในวันแสงน้อยจะทำให้แสงเข้าน้อย ให้เปิดรูรับแสงกว้างขึ้น (f/1.4-2.8) และดัน ISO ช่วย`
            : `ภาพสว่างเกินไป (+${deltaEV.toFixed(1)} EV) ให้ลดค่า ISO ลงหรือหรี่รูรับแสงเล็กน้อย`,
        },
      ];

      const score = (shutterPassed ? 50 : 0) + (exposurePassed ? 50 : Math.max(0, 50 - Math.round(Math.abs(deltaEV) * 20)));

      return {
        passed: allPassed,
        score: allPassed ? 100 : score,
        title: allPassed ? 'หยุดภาพเคลื่อนไหวสำเร็จ!' : 'ยังหยุดภาพได้ไม่สมบูรณ์',
        explanation: allPassed
          ? 'ถ่ายภาพกีฬาได้อย่างมืออาชีพ! คุณเข้าใจว่าชัตเตอร์ที่เร็วเสี้ยววินาทีทำให้แสงเข้าน้อยลง จึงชดเชยด้วยการเปิดรูรับแสงกว้างและดัน ISO ได้อย่างลงตัว'
          : !shutterPassed
          ? 'การถ่ายภาพกีฬาหรือวัตถุที่เคลื่อนที่เร็ว ถ้าชัตเตอร์ช้ากว่า 1/1000s ภาพจะเกิด Motion Blur เสมอ'
          : 'ชัตเตอร์เร็วมากพอแล้ว แต่ภาพมืดเกินไป เพราะเวลาที่แสงส่องลงเซนเซอร์สั้นมาก ให้เปิดรูรับแสงกว้างขึ้นหรือดัน ISO เพิ่มขึ้น',
        checks,
      };
    },
  },
  {
    id: 'low_light_indoor',
    number: 3,
    title: 'ถ่ายภาพในร่มแสงน้อยโดยถือกล้องด้วยมือ (Low Light Handheld)',
    badge: 'คุมภาพสั่น & ลด Noise',
    brief: 'ฝึกถ่ายภาพในห้องแสงน้อยโดยไม่ใช้ขาตั้งกล้อง ต้องไม่ให้ภาพสั่นไหว (ชัตเตอร์ >= 1/125s) และภาพไม่แตก (ISO <= 1600)',
    environmentId: 'indoor_studio',
    sceneId: 'studio_wheel',
    primaryGoal: 'ชัตเตอร์ >= 1/125s, ISO <= 1600, แสงพอดี',
    criteria: [
      {
        id: 'shutter',
        label: 'ความเร็วชัตเตอร์ปลอดภัย',
        targetDescription: '1/125s หรือเร็วกว่า เพื่อป้องกันภาพเบลอจากมือสั่น',
      },
      {
        id: 'iso',
        label: 'ควบคุมเม็ดเกรนรบกวน',
        targetDescription: 'ISO ไม่เกิน 1600 เพื่อไม่ให้ภาพแตกและมี Noise รบกวน',
      },
      {
        id: 'exposure',
        label: 'ความสว่างพอดี (Exposure)',
        targetDescription: 'คุมสเกลวัดแสงให้อยู่ในช่วง +/- 0.4 EV',
      },
    ],
    validate: (aperture, shutter, iso, deltaEV) => {
      const shutterPassed = shutter.value <= 1 / 125;
      const isoPassed = iso <= 1600;
      const exposurePassed = Math.abs(deltaEV) <= 0.4;
      const allPassed = shutterPassed && isoPassed && exposurePassed;

      const checks: MissionCheck[] = [
        {
          label: 'ชัตเตอร์ปลอดภัยจากการสั่น (>= 1/125s)',
          passed: shutterPassed,
          currentValueText: shutter.label,
          detail: shutterPassed
            ? `ความเร็ว ${shutter.label} ปลอดภัยจากการสั่นไหวของมือขณะถือถ่าย`
            : `ความเร็ว ${shutter.label} ช้าเกินไป การถือกล้องด้วยมือจะทำให้ภาพเบลอจากมือสั่น ให้ใช้ 1/125s หรือไวกว่า`,
        },
        {
          label: 'ควบคุม Noise รบกวน (ISO <= 1600)',
          passed: isoPassed,
          currentValueText: `ISO ${iso}`,
          detail: isoPassed
            ? `ISO ${iso} ให้เนื้อภาพที่เนียนละเอียด รายละเอียดคมชัด สัญญาณรบกวนต่ำ`
            : `ISO ${iso} สูงเกินไป ทำให้ภาพมีเม็ดเกรนสัญญาณรบกวน (Noise) หนาแน่นจนเสียรายละเอียด ให้ลดเหลือ 1600 หรือต่ำกว่า`,
        },
        {
          label: 'ความสว่างภาพพอดี (|EV| <= 0.4)',
          passed: exposurePassed,
          currentValueText: `${deltaEV > 0 ? '+' : ''}${deltaEV.toFixed(1)} EV`,
          detail: exposurePassed
            ? 'แสงพอดีสมบูรณ์แบบ: ภาพไม่มืดและรักษาเนื้อสัมผัสได้ดี'
            : deltaEV < 0
            ? `ภาพมืดเกินไป (${Math.abs(deltaEV).toFixed(1)} EV)! เมื่อถูกจำกัดชัตเตอร์และ ISO ทางออกเดียวคือเปิดรูรับแสงกว้างขึ้น (เช่น f/1.4 หรือ f/2.0) เพื่อดึงแสงเข้ามา`
            : `ภาพสว่างเกินไป (+${deltaEV.toFixed(1)} EV) หรี่รูรับแสงลงเล็กน้อย`,
        },
      ];

      let score = 0;
      if (shutterPassed) score += 34;
      if (isoPassed) score += 33;
      if (exposurePassed) score += 33;
      else score += Math.max(0, 33 - Math.round(Math.abs(deltaEV) * 15));

      return {
        passed: allPassed,
        score: allPassed ? 100 : score,
        title: allPassed ? 'ถ่ายแสงน้อยได้อย่างยอดเยี่ยม!' : 'ยังไม่ผ่านเงื่อนไขแสงน้อย',
        explanation: allPassed
          ? 'แก้โจทย์แสงน้อยได้อย่างชาญฉลาด! คุณไม่ยอมลดชัตเตอร์จนภาพสั่น และไม่ดัน ISO จนภาพแตก แต่เลือกเปิดรูรับแสงให้กว้างที่สุดเพื่อกวาดแสงธรรมชาติเข้าสู่เซนเซอร์'
          : !shutterPassed
          ? 'ในที่แสงน้อย ถ้าชัตเตอร์ช้ากว่า 1/125s การถือกล้องด้วยมือจะสั่นไหวและทำให้ภาพไม่คม'
          : !isoPassed
          ? 'การดัน ISO สูงเกิน 1600 ช่วยให้ภาพสว่างจริง แต่จะทำให้ภาพเป็นเม็ดเกรนหยาบและสีซีดลง'
          : 'เพื่อรักษาทั้งความคมและภาพเนียนโดยไม่ดัน ISO ให้เปิดรูรับแสงของเลนส์ให้กว้างที่สุดเท่าที่จะทำได้ (เช่น f/1.4 หรือ f/2.0)',
        checks,
      };
    },
  },
];

