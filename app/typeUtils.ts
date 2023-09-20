export type Identity<T> = T;

export type Flatten<T> = Identity<{
  [K in keyof T]: T[K];
}>;

export type MightExist<T> = Flatten<
  Omit<
    {
      [P in keyof T]: T[P] extends (infer U)[]
        ? MightExist<U>[]
        : T[P] extends object
        ? MightExist<T[P]>
        : T[P];
    },
    "id"
  > & { id?: T extends { id: string } ? string : never }
>;
