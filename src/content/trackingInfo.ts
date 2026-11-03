/**
 * Short explanations of why tracking temperature or ovulation tests can help.
 * Educational text: every entry stays `reviewed: false` until a medical professional approves it,
 * and it is shown with a note saying so. Keep the claims general and cautious.
 */
export interface TrackingInfo {
  title: string;
  /** What it gives you. */
  benefits: string[];
  /** What it cannot do. */
  limits: string[];
  reviewed: boolean;
}

export const TEMPERATURE_INFO: TrackingInfo = {
  title: 'למה כדאי למדוד טמפרטורה בבוקר?',
  benefits: [
    'אחרי הביוץ הגוף מפריש יותר פרוגסטרון, וטמפרטורת הגוף במנוחה עולה מעט, בדרך כלל בכמה עשיריות מעלה, ונשארת גבוהה עד המחזור הבא.',
    'כשמודדים כל בוקר באותה שעה בערך, לפני שקמים מהמיטה, אפשר לראות את המעבר הזה בגרף. כך מזהים בדיעבד באיזה יום בערך קרה הביוץ, ואם הוא קרה.',
    'אחרי כמה מחזורים מתקבלת תמונה אישית: מתי הביוץ שלך נוטה לקרות ואיך המחזור שלך נראה.',
    'זה רגע אחד בבוקר, ואפשר להפעיל תזכורת.',
  ],
  limits: [
    'המדידה מראה שהביוץ כבר קרה. היא לא מנבאת אותו מראש.',
    'מחלה, אלכוהול, שינה לא טובה או שעת מדידה שונה משפיעים על התוצאה. בשביל זה יש תג "מדידה חריגה", ומדידה כזו לא נכנסת לקו בגרף.',
    'זה לא אמצעי מניעה ולא כלי אבחון.',
  ],
  reviewed: false,
};

export const TESTS_INFO: TrackingInfo = {
  title: 'למה כדאי לתעד בדיקות ביוץ?',
  benefits: [
    'בדיקת ביוץ (LH) בודקת בשתן עלייה בהורמון LH, שבדרך כלל קורית יום עד יומיים לפני הביוץ. תוצאה חיובית מסמנת שהביוץ קרוב.',
    'באפליקציה את מסמנת את התוצאה בעצמך (שלילי, קלוש או חיובי), ואפשר גם לצלם את הבדיקה. האפליקציה לא מנתחת את התמונה, והיא נשמרת רק במכשיר.',
    'יחד עם מדידת טמפרטורה מקבלים תמונה מלאה יותר: הבדיקה מצביעה על ביוץ קרוב, והטמפרטורה מראה בדיעבד שהוא קרה.',
  ],
  limits: [
    'בדיקה חיובית לא מבטיחה שהביוץ יקרה, וייתכנו גם תוצאות שמטעות.',
    'זה לא אמצעי מניעה ולא כלי אבחון.',
  ],
  reviewed: false,
};
