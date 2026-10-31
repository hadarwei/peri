// All user-facing strings live here. Keys are typed, so a typo is a compile error.
export const he = {
  tabs: {
    today: 'היום',
    calendar: 'יומן',
    me: 'אני',
  },
  dev: {
    logCount: 'מספר רישומים שנשמרו',
    addTestLog: 'הוסף רישום בדיקה',
    loading: 'טוען…',
    dbError: 'שגיאת מסד נתונים',
  },
} as const;

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : Join<K, Paths<T[K]>>;
}[keyof T & string];

export type StringKey = Paths<typeof he>;
