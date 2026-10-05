export type Language = 'th' | 'en';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  sandboxMode: string;
  missionMode: string;
  liveView: string;
  targetLight: string;
  userCamera: string;
  deviation: string;
  balanced: string;
  underexposed: string;
  overexposed: string;
  correctExposure: string;
  tapToFocus: string;
  sensorInfo: string;
  actionFrozen: string;
  heavyBlur: string;
  normalShutter: string;
  presetsTitle: string;
  presetBokeh: string;
  presetAction: string;
  presetMotion: string;
  presetGrain: string;
  controlsDeckTitle: string;
  controlsDeckHint: string;
  apertureTitle: string;
  apertureSubtitle: string;
  apertureWideHint: string;
  apertureNarrowHint: string;
  aperturePhysics: string;
  shutterTitle: string;
  shutterSubtitle: string;
  shutterFastHint: string;
  shutterSlowHint: string;
  shutterPhysics: string;
  tripodWarning: string;
  handheldOk: string;
  isoTitle: string;
  isoSubtitle: string;
  isoCleanHint: string;
  isoNoiseHint: string;
  isoPhysics: string;
  meterTitle: string;
  meterSubtitle: string;
  takePhotoBtn: string;
  shutterReleaseBtn: string;
  summaryTitle: string;
  dofLabel: string;
  motionLabel: string;
  noiseLabel: string;
  ambientLabel: string;
  guideBtn: string;
  questsBtn: string;
  rollBtn: string;
  tryAgainBtn: string;
  adjustSettingsBtn: string;
  nextMissionBtn: string;
  missionPassedTitle: string;
  missionFailedTitle: string;
  scoreLabel: string;
  objectiveAchieved: string;
  criteriaIncomplete: string;
  assessmentTitle: string;
  validationChecklist: string;
  refCard1Title: string;
  refCard1Desc: string;
  refCard2Title: string;
  refCard2Desc: string;
  refCard3Title: string;
  refCard3Desc: string;
}

export const translations: Record<Language, Translations> = {
  th: {
    appTitle: 'โปรแกรมจำลองการตั้งค่ากล้องถ่ายภาพ',
    appSubtitle: 'เรียนรู้สามเหลี่ยมวัดแสง: รูรับแสง (Aperture) · ความเร็วชัตเตอร์ (Shutter Speed) · ค่าความไวแสง (ISO)',
    sandboxMode: 'โหมดทดลองอิสระ',
    missionMode: 'โหมดภารกิจฝึกถ่าย',
    liveView: 'ภาพสด 60FPS',
    targetLight: 'แสงสถานที่',
    userCamera: 'การตั้งค่ากล้อง',
    deviation: 'ค่าความต่างแสง',
    balanced: 'แสงพอดี',
    underexposed: 'ภาพมืดไป',
    overexposed: 'ภาพสว่างจ้าเกินไป',
    correctExposure: 'แสงกำลังพอดี (0.0 EV)',
    tapToFocus: 'แตะที่จอเพื่อล็อคโฟกัสอัตโนมัติ (AF)',
    sensorInfo: 'เซนเซอร์: 36×24mm Full-Frame CMOS',
    actionFrozen: 'หยุดการเคลื่อนไหวนิ่งสนิท',
    heavyBlur: 'ภาพเคลื่อนไหวเบลอเป็นสาย',
    normalShutter: 'ความเร็วชัตเตอร์ปกติ',
    presetsTitle: 'สูตรสำเร็จ:',
    presetBokeh: 'หน้าชัดหลังเบลอ',
    presetAction: 'หยุดภาพเคลื่อนไหว',
    presetMotion: 'สายน้ำ/ไฟวิ่ง',
    presetGrain: 'ทดสอบ Noise แสงน้อย',
    controlsDeckTitle: 'แผงควบคุมการตั้งค่ากล้อง',
    controlsDeckHint: '[คลิกที่ตัวเลขหรือลากแถบสไลเดอร์เพื่อปรับค่า]',
    apertureTitle: 'รูรับแสง (Aperture - Av)',
    apertureSubtitle: 'ความชัดลึก · หน้าชัดหลังเบลอ (โบเก้)',
    apertureWideHint: 'หน้าชัดหลังเบลอสวย (รูเปิดกว้าง)',
    apertureNarrowHint: 'ชัดลึกทั้งภาพ คมชัดยันฉากหลัง (รูแคบ)',
    aperturePhysics: 'เลข f น้อย: รูกว้าง แสงเข้าเยอะขึ้นเท่าตัว (+1 EV) ฉากหลังละลายสวยงาม',
    shutterTitle: 'ความเร็วชัตเตอร์ (Shutter Speed - Tv)',
    shutterSubtitle: 'ระยะเวลาเปิดรับแสง · หยุดภาพนิ่ง / เบลอสายน้ำ',
    shutterFastHint: 'หยุดการเคลื่อนไหวเสี้ยววินาที (คมกริบ)',
    shutterSlowHint: 'ภาพเบลอเป็นสายพริ้ว (Long Exposure)',
    shutterPhysics: 'ชัตเตอร์ไว: หยุดการเคลื่อนไหวได้นิ่ง แต่แสงจะเข้าได้น้อยลงตามเวลาที่สั้นลง',
    tripodWarning: 'ระวังภาพสั่น (ต้องใช้ขาตั้ง)',
    handheldOk: 'ถือถ่ายด้วยมือได้สบาย',
    isoTitle: 'ความไวแสงเซนเซอร์ (ISO)',
    isoSubtitle: 'กำลังขยายสัญญาณไฟฟ้า · สัญญาณรบกวน (Noise)',
    isoCleanHint: 'ภาพเนียนละเอียด ไร้สัญญาณรบกวน',
    isoNoiseHint: 'ภาพสว่างในที่มืด แต่มีเม็ดเกรนรบกวน (Noise)',
    isoPhysics: 'ISO สูง: ช่วยดึงความสว่างในที่มืด แต่จะขยายเม็ดเกรนสัญญาณรบกวน (Noise) ให้เห็นชัดขึ้น',
    meterTitle: 'สเกลวัดแสงในช่องมองภาพ (Light Meter)',
    meterSubtitle: '[ระบบวัดแสงเฉพาะจุดและเฉลี่ยทั้งภาพ]',
    takePhotoBtn: 'กดถ่ายภาพ & ตรวจการบ้าน [SPACE]',
    shutterReleaseBtn: 'กดชัตเตอร์ถ่ายภาพ [SPACE]',
    summaryTitle: 'สรุปผลทางฟิสิกส์ของการถ่ายภาพ',
    dofLabel: 'ระยะชัดลึก (DoF):',
    motionLabel: 'การเบลอจากการเคลื่อนไหว:',
    noiseLabel: 'ความเนียนของสัญญาณ (SNR):',
    ambientLabel: 'สภาพแสงรอบข้าง:',
    guideBtn: 'คู่มือสามเหลี่ยมวัดแสง',
    questsBtn: 'แบบฝึกหัด',
    rollBtn: 'ม้วนฟิล์มที่ถ่าย',
    tryAgainBtn: 'ลองปรับใหม่อีกครั้ง',
    adjustSettingsBtn: 'กลับไปปรับแต่งค่า',
    nextMissionBtn: 'ไปภารกิจถัดไป',
    missionPassedTitle: 'ยินดีด้วย! ภารกิจสำเร็จยอดเยี่ยม',
    missionFailedTitle: 'ยังไม่ผ่าน ลองปรับใหม่อีกนิดนะ',
    scoreLabel: 'คะแนนการประเมิน',
    objectiveAchieved: 'บรรลุเป้าหมายครบถ้วน',
    criteriaIncomplete: 'ยังมีเงื่อนไขที่ต้องแก้ไข',
    assessmentTitle: 'คำอธิบายเข้าใจง่ายจากช่างภาพ:',
    validationChecklist: 'รายการตรวจสอบเงื่อนไขภารกิจ:',
    refCard1Title: '01. หลักการทำงานของรูรับแสง (Aperture)',
    refCard1Desc: 'เลข f คืออัตราส่วนความกว้างของรูรับแสง ยิ่งเลขน้อย (เช่น f/1.4) รูจะยิ่งเปิดกว้าง แสงเข้าได้เยอะ และทำให้ฉากหลังละลายเบลอสวยงาม',
    refCard2Title: '02. ความเร็วชัตเตอร์กับการเคลื่อนไหว (Shutter Speed)',
    refCard2Desc: 'ควบคุมเวลาที่เซนเซอร์เปิดรับแสง ชัตเตอร์เร็ว (เช่น 1/1000s) จะจับภาพที่เคลื่อนไหวให้หยุดนิ่งสนิท ส่วนชัตเตอร์ช้าจะทำให้เกิดเส้นสายความเคลื่อนไหว',
    refCard3Title: '03. ค่าความไวแสง ISO และสัญญาณรบกวน (Noise)',
    refCard3Desc: 'ISO คือการขยายสัญญาณภาพด้วยไฟฟ้า เมื่อแสงธรรมชาติไม่พอ การดัน ISO ช่วยให้ภาพสว่างขึ้นได้ แต่แลกมาด้วยเม็ดเกรนระยิบระยับ (Noise)',
  },
  en: {
    appTitle: 'Interactive Camera Exposure Simulator',
    appSubtitle: 'Master the Exposure Triangle: Aperture · Shutter Speed · ISO Sensitivity',
    sandboxMode: 'Free Sandbox',
    missionMode: 'Mission Challenge',
    liveView: 'LIVE VIEW 60FPS',
    targetLight: 'Target Light',
    userCamera: 'User Camera',
    deviation: 'Deviation',
    balanced: 'Balanced',
    underexposed: 'Underexposed',
    overexposed: 'Overexposed',
    correctExposure: 'Balanced Exposure (0.0 EV)',
    tapToFocus: 'TAP VIEWPORT TO ACQUIRE AF LOCK',
    sensorInfo: 'SENSOR: 36×24mm Full-Frame CMOS',
    actionFrozen: 'ACTION FROZEN IN TIME',
    heavyBlur: 'HEAVY MOTION BLUR TRAILS',
    normalShutter: 'NORMAL SHUTTER SPEED',
    presetsTitle: 'PRESETS:',
    presetBokeh: 'Bokeh Portrait',
    presetAction: 'Freeze Action',
    presetMotion: 'Motion Trails',
    presetGrain: 'High ISO Grain',
    controlsDeckTitle: 'Camera Controls Deck',
    controlsDeckHint: '[Click tick stops or drag sliders to adjust]',
    apertureTitle: 'Aperture (Av)',
    apertureSubtitle: 'Depth of Field · Bokeh Rendition',
    apertureWideHint: 'Shallow Bokeh (Wide Open)',
    apertureNarrowHint: 'Deep Focus Throughout (Closed Down)',
    aperturePhysics: 'Lower f-number: Widens opening, lets in 2× more light per stop, blurs background.',
    shutterTitle: 'Shutter Speed (Tv)',
    shutterSubtitle: 'Exposure Time · Motion Rendition',
    shutterFastHint: 'Freeze Rapid Action (Instant)',
    shutterSlowHint: 'Long Exposure Motion Blur Trails',
    shutterPhysics: 'Faster speed: Freezes motion sharply, cuts photon collection time in half.',
    tripodWarning: 'TRIPOD REQUIRED (RISK OF SHAKE)',
    handheldOk: 'HANDHELD SAFE',
    isoTitle: 'ISO Sensitivity',
    isoSubtitle: 'Sensor Gain · Analog Amplification',
    isoCleanHint: 'Ultra Clean Signal (Low Noise)',
    isoNoiseHint: 'High Gain Amplification (Digital Noise)',
    isoPhysics: 'Higher ISO: Boosts electrical brightness in darkness, but introduces grain.',
    meterTitle: 'Viewfinder Light Meter',
    meterSubtitle: '[TTL Evaluative Metering]',
    takePhotoBtn: 'TAKE PHOTO & CHECK [SPACE]',
    shutterReleaseBtn: 'SHUTTER RELEASE [SPACE]',
    summaryTitle: 'Optical Physics Summary',
    dofLabel: 'Depth of Field (DoF):',
    motionLabel: 'Motion Blur Angle:',
    noiseLabel: 'Signal-to-Noise (SNR):',
    ambientLabel: 'Ambient Illumination:',
    guideBtn: 'Exposure Guide',
    questsBtn: 'Practice Quests',
    rollBtn: 'Captured Roll',
    tryAgainBtn: 'Try Again',
    adjustSettingsBtn: 'Adjust Settings',
    nextMissionBtn: 'Next Mission',
    missionPassedTitle: 'Mission Accomplished!',
    missionFailedTitle: 'Settings Need Adjustment',
    scoreLabel: 'Knowledge Evaluation Score',
    objectiveAchieved: 'Objective Achieved',
    criteriaIncomplete: 'Criteria Incomplete',
    assessmentTitle: 'Optical Physics Assessment:',
    validationChecklist: 'Objective Validation Checklist:',
    refCard1Title: '01. The Aperture Principle',
    refCard1Desc: 'f-stops represent the ratio of focal length to pupil diameter (N = f/D). Opening by 1 full stop doubles the light collection area (+1 EV) and narrows the in-focus plane.',
    refCard2Title: '02. Shutter Speed Dynamics',
    refCard2Desc: 'Controls temporal photon accumulation. Double the exposure time doubles light (+1 EV) while smearing fast angular motion across the sensor surface.',
    refCard3Title: '03. Sensor Gain & Noise Floor',
    refCard3Desc: 'ISO does not physically make the sensor more sensitive; it applies post-capture electronic gain to pixel voltage, amplifying both image data and baseline thermal noise.',
  },
};
