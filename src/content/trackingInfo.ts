/**
 * Short explanations of why tracking temperature or ovulation tests can help, plus a ready-made
 * question the user can paste into an AI chat to read more. Educational text: every entry stays
 * `reviewed: false` until a medical professional approves it, and it is shown with a note saying
 * so. Keep the claims general and cautious.
 */
export interface TrackingInfo {
  title: string;
  /** What it gives you (short). */
  benefits: string[];
  /** What it cannot do (short). */
  limits: string[];
  /** A question to copy and paste into an AI chat for a deeper explanation. */
  deeperPrompt: string;
  reviewed: boolean;
}

const PROMPT_RULES =
  'הסתמכי על מקורות רפואיים מהימנים (למשל Mayo Clinic או ACOG), כתבי ליד כל טענה מאיזה מקור היא, ואם את לא בטוחה במשהו, כתבי את זה במפורש. אל תמציאי מקורות או מספרים. זה לא ייעוץ רפואי.';

export const TEMPERATURE_INFO: TrackingInfo = {
  title: 'למה למדוד טמפרטורה בבוקר?',
  benefits: [
    'אחרי הביוץ הטמפרטורה במנוחה עולה מעט ונשארת גבוהה עד המחזור הבא.',
    'מדידה קבועה בבוקר, לפני שקמים, מראה את המעבר הזה בגרף. כך רואים בדיעבד מתי בערך קרה הביוץ.',
  ],
  limits: [
    'מראה שהביוץ כבר קרה, לא מנבאת אותו.',
    'שינה לא טובה, מחלה, אלכוהול ומדידה אחרי שקמת משפיעים. את אלה מסמנים כ"מדידה חריגה".',
    'לא אמצעי מניעה ולא אבחון.',
  ],
  deeperPrompt: `אני משתמשת באפליקציה למעקב מחזור ושוקלת למדוד כל בוקר את טמפרטורת הגוף במנוחה (BBT). הסבירי לי בעברית פשוטה ובקצרה: איך הטמפרטורה משתנה סביב הביוץ ולמה, איך מודדים נכון (באיזו שעה, לפני שקמים, איזה מד-חום), מה משפיע על המדידה (שינה, אלכוהול, מחלה, שעת מדידה), כמה מחזורים צריך כדי לראות דפוס, ומה המגבלות של השיטה. ${PROMPT_RULES}`,
  reviewed: false,
};

export const TESTS_INFO: TrackingInfo = {
  title: 'למה לתעד בדיקות ביוץ?',
  benefits: [
    'בדיקת ביוץ (LH) מזהה בשתן עלייה בהורמון שבדרך כלל קורית יום עד יומיים לפני הביוץ.',
    'יחד עם הטמפרטורה מתקבלת תמונה מלאה: הבדיקה מצביעה על ביוץ קרוב, והטמפרטורה מראה שהוא קרה.',
  ],
  limits: ['חיובית לא מבטיחה ביוץ, וייתכנו תוצאות מטעות.', 'לא אמצעי מניעה ולא אבחון.'],
  deeperPrompt: `אני משתמשת באפליקציה למעקב מחזור ושוקלת לתעד בדיקות ביוץ (LH) בשתן. הסבירי לי בעברית פשוטה ובקצרה: מה הבדיקה מודדת, באיזה ימים במחזור כדאי לבדוק ובאיזו שעה, איך קוראים תוצאה שלילית, קלושה וחיובית, כמה זמן אחרי תוצאה חיובית מתרחש הביוץ, מתי הבדיקה עלולה להטעות, ואיך היא משתלבת עם מדידת טמפרטורה. ${PROMPT_RULES}`,
  reviewed: false,
};
