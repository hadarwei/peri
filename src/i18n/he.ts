// All user-facing strings live here. Keys are typed, so a typo is a compile error.
export const he = {
  tabs: {
    today: 'היום',
    calendar: 'יומן',
    me: 'אני',
  },
  today: {
    greeting: 'בוקר טוב',
    privacyChip: 'הכול נשמר רק על המכשיר',
    settings: 'הגדרות',
    dayOfCycle: 'יום {day} מתוך {length}',
  },
  phase: {
    period: 'מחזור',
    follicular: 'לפני הביוץ',
    fertile: 'חלון פוריות',
    luteal: 'אחרי הביוץ',
  },
  predictions: {
    nextPeriod: 'המחזור הבא',
    ovulation: 'ביוץ משוער',
    inDays: 'בעוד {days} ימים',
    range: 'טווח: {from}-{to} ימים',
  },
  mood: {
    title: 'איך את מרגישה?',
    skip: 'אפשר לדלג',
    faces: ['קשה', 'לא מי יודע מה', 'בסדר', 'טוב', 'מעולה'],
  },
  streak: {
    days: '{days} ימים ברצף',
    note: 'כל כניסה נספרת, גם בלי לרשום',
  },
  didYouKnow: {
    title: 'הידעת?',
  },
  cloud: {
    hello: ['יום רגוע. מה נשמע?', 'בוקר טוב! אני כאן אם צריך.', 'שמחה לראות אותך!'],
    celebrate: ['כל הכבוד! פרח חדש צמח', 'איזה כיף, עוד רישום!', 'יופי! ככה ממשיכים.'],
  },
  duckState: {
    normal: 'רגיל',
    period: 'מחזור',
    pre: 'לפני ביוץ',
    fertile: 'פוריות',
    ovulation: 'ביוץ',
    late: 'מאחר',
    pregnancy: 'הריון',
    dreaming: 'חולם',
    traveling: 'מטייל',
  },
  dev: {
    logCount: 'מספר רישומים שנשמרו',
    addTestLog: 'הוסף רישום בדיקה',
    loading: 'טוען…',
    saved: 'נשמר',
    dbError: 'שגיאת מסד נתונים',
  },
} as const;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>>;
}[keyof T & string];

export type StringKey = Paths<typeof he>;
