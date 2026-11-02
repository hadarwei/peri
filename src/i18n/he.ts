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
  editCycle: {
    title: 'עריכת מחזור',
    subtitle: 'אפשר לשנות את היום הראשון של המחזור.',
    editDate: 'שינוי תאריך התחלה',
    delete: 'מחיקת המחזור',
    cancel: 'ביטול',
    confirmTitle: 'למחוק את המחזור?',
    confirmBody: 'הרישומים היומיים נשארים. רק המחזור נמחק, והתחזיות יתעדכנו.',
    confirmDelete: 'מחיקה',
  },
  addCycle: {
    open: 'הוספת מחזור קודם',
    title: 'מתי התחיל מחזור קודם?',
    subtitle:
      'מספיק לבחור את היום הראשון שבו הדימום התחיל. אפשר גם להוסיף כמה מחזורים, אחד אחרי השני.',
    save: 'שמירה',
    dontRemember: 'לא זוכרת',
    future: 'התאריך הזה עוד לא הגיע. אפשר לבחור יום שעבר.',
    exists: 'כבר יש מחזור שמתחיל ביום הזה.',
    saved: 'נשמר! אפשר להוסיף עוד מחזור, או לסיים.',
    another: 'הוספת מחזור נוסף',
    finish: 'סיימתי',
    failed: 'לא הצלחנו לשמור. אפשר לנסות שוב.',
  },
  history: {
    title: 'המחזורים שלי',
    empty: 'עוד אין מחזורים. כשהמחזור יתחיל, או כשיתווספו מחזורים קודמים, הם יופיעו כאן.',
    now: 'היום',
    days: '{days} ימים',
    daysSoFar: 'יום {days} במחזור הנוכחי',
    period: 'דימום: {days} ימים',
    periodUnknown: 'אורך הדימום לא נרשם',
  },
  calendar: {
    previousMonth: 'החודש הקודם',
    cycleDay: 'יום {day} במחזור',
    predicted: 'צפי',
    nothingLogged: 'לא נרשם דבר ביום הזה',
    futureDay: 'יום עתידי',
    edit: 'עריכה',
    add: 'הוספת רישום',
    nextMonth: 'החודש הבא',
  },
  checkin: {
    title: 'רישום יומי',
    open: 'לרישום היומי',
    done: 'סיימתי',
    skipToday: 'לדלג להיום',
    saveFailed: 'לא הצלחנו לשמור. אפשר לנסות שוב.',
    sameAsYesterday: 'כמו אתמול',
    symptoms: 'תסמינים',
    moreDetails: 'פרטים נוספים',
    flow: 'דימום',
    flowLevels: ['אין', 'קל', 'בינוני', 'חזק'],
    pain: 'כאב',
    painLevels: ['ללא', 'קל', 'בינוני', 'חזק'],
    energy: 'אנרגיה',
    note: 'הערה',
    notePlaceholder: 'משהו שחשוב לזכור מהיום',
    defaultSymptoms: ['התכווצויות', 'כאב ראש', 'עייפות', 'נפיחות', 'רגישות בחזה', 'שינויי מצב רוח'],
  },
  periodStart: {
    title: 'המחזור התחיל?',
    yes: 'כן, התחיל',
    notYet: 'עוד לא',
    started: 'המחזור התחיל. כמה חזק הדימום?',
    levels: ['קל', 'בינוני', 'חזק'],
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
    one: 'יום אחד ברצף',
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
    seedCycle: 'נתוני בדיקה: 3 מחזורים ורישומים',
    resetCycles: 'מחיקת מחזורים ורישומים',
    saved: 'נשמר',
    dbError: 'שגיאת מסד נתונים',
  },
} as const;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>>;
}[keyof T & string];

export type StringKey = Paths<typeof he>;
