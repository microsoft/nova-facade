const LocalizedString = Symbol("LocalizedString");

/**
 * Represents a localized string with placeholders.
 * This type will be used by the `relay-compiler` when generating types for
 * a string with placeholders.
 *
 * You should **not** have to use this type directly, instead use the `format` function
 * from the `useFormat` hook to unwrap the localized string and provide the placeholders.
 *
 * @param T The type of the placeholders object.
 * @example
 * ```ts
 * // Note: This would be part of a generated type, you should not have to write this yourself.
 * type MyLocalizedStrings = StringWithPlaceholders<{
 *  name: string;
 *  age: number;
 * }>;
 * ```
 */
export type StringWithPlaceholders<T extends Record<string, string | number>> =
  {
    [LocalizedString]: T;
  };

/**
 * Extract the placeholders from a localized string.
 * Guarantees that the placeholder object is not empty.
 */
export type Placeholders<T> = T extends StringWithPlaceholders<infer P>
  ? keyof P extends never // Make sure that the placeholder object is not empty
    ? never
    : P
  : never;

type UseFormat = () => (
  localizedStringFromGraphQL: unknown,
  placeholders: Record<string, string | number>,
) => string;

/**
 * The NovaLocalization type is used to provide the `useFormat` hook to the components.
 * The `useFormat` hook should support replacing placeholders in a localized string.
 *
 * You provide this type to the `NovaLocalizationProvider` component to make
 * it available to the components in your application.
 *
 * The components will be able to use `useFormat` from `@nova/react` to
 * access the `format` function.
 */
export type NovaLocalization = {
  useFormat: UseFormat;
};