/**
 * Make all properties in T nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Make specified properties in T nullable
 */
export type NullableProps<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

/**
 * Make all properties in T required and non-nullable
 */
export type RequiredNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

/**
 * Make specified properties in T optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified properties in T required
 */
export type RequiredProps<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Pick properties from T that match type U
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Omit properties from T that match type U
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * Make all nested properties in T partial
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Create union type of values in T
 */
export type ValueOf<T> = T[keyof T];

/**
 * Create a type for function parameters
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Create a type for function return type
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : never;

/**
 * Create a type with only methods from T
 */
export type Methods<T> = {
  [P in keyof T as T[P] extends Function ? P : never]: T[P];
};

/**
 * Create a type with only properties (non-methods) from T
 */
export type Properties<T> = {
  [P in keyof T as T[P] extends Function ? never : P]: T[P];
};

/**
 * Readonly version of T with all nested properties also readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Make all properties in T mutable
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Extract properties from T whose values extend U
 */
export type ExtractProps<T, U> = Pick<T, {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T]>;

/**
 * Make specified properties in T readonly
 */
export type ReadonlyProps<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>;

/**
 * Create a type where at least one property from K must exist in T
 */
export type RequireAtLeastOne<T, K extends keyof T = keyof T> = {
  [P in K]-?: Required<Pick<T, P>> & Partial<Pick<T, Exclude<K, P>>>
}[K] & Omit<T, K>;

// Example usage:
/*
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  updatedAt: Date;
}

// Make all properties nullable
type NullableUser = Nullable<User>;
// { id: number | null; name: string | null; email: string | null; age: number | null; updatedAt: Date | null; }

// Make specific properties nullable
type PartiallyNullableUser = NullableProps<User, 'email' | 'age'>;
// { id: number; name: string; email: string | null; age: number | null; updatedAt: Date; }

// Make all properties required and non-nullable
type StrictUser = RequiredNonNullable<User>;
// { id: number; name: string; email: string; age: number; updatedAt: Date; }

// Make specific properties optional
type UserWithOptionalEmail = Optional<User, 'email'>;
// { id: number; name: string; email?: string; age?: number; updatedAt: Date; }

// Pick properties by type
type UserDates = PickByType<User, Date>;
// { updatedAt: Date; }
*/