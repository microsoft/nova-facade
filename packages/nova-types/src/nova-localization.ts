const LocalizedString = Symbol("LocalizedString");

export type StringWithPlaceholders<T extends Record<string, string | number>> =
  {
    [LocalizedString]: T;
  };

export type Placeholders<T> = T extends StringWithPlaceholders<infer P>
  ? keyof P extends never // Make sure that the placeholder object is not empty
    ? never
    : P
  : never;

type UseFormat = () => (
  value: unknown,
  values: Record<string, string | number>,
) => string;

export type NovaLocalization = {
  useFormat: UseFormat;
};

export type FormatFn = <
  T extends StringWithPlaceholders<P>,
  P extends Record<string, string | number>,
>(
  localizedString: T,
  values: Placeholders<T>,
) => string;
