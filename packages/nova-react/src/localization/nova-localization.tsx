import * as React from "react";
import type {
  NovaLocalization,
  Placeholders,
  StringWithPlaceholders,
} from "@nova/types";
import invariant from "invariant";

const NovaLocalizationContext = React.createContext<NovaLocalization | null>(
  null,
);

type NovaLocalizationProviderProps = React.PropsWithChildren<{
  localization: NovaLocalization;
}>;

/**
 * The `NovaLocalizationProvider` component is used to provide the `NovaLocalization` object to the components in your application.
 *
 * You should wrap your application with this component to make the `useFormat` hook available to the components.
 *
 * @example
 * ```tsx
 * import { NovaLocalization } from "@nova/types";
 * import { NovaLocalizationProvider } from "@nova/react";
 *
 * const myLocalization: NovaLocalization = {
 *   useFormat: () => (localizedStringFromGraphQL, placeholders) => {
 *     // Your implementation here
 *   },
 * };
 *
 * const App = () => {
 *   return (
 *     <NovaLocalizationProvider localization={myLocalization}>
 *       <MyComponent />
 *     </NovaLocalizationProvider>
 *   );
 * };
 * ```
 */
export const NovaLocalizationProvider: React.FunctionComponent<
  NovaLocalizationProviderProps
> = ({ children, localization }) => {
  return (
    <NovaLocalizationContext.Provider value={localization}>
      {children}
    </NovaLocalizationContext.Provider>
  );
};
NovaLocalizationProvider.displayName = "NovaLocalizationProvider";

const useLocalization = (): NovaLocalization => {
  const localization = React.useContext(NovaLocalizationContext);

  invariant(
    localization !== null,
    "Nova Localization provider must be initialized prior to consumption!",
  );

  return localization;
};

function format<
  T extends StringWithPlaceholders<P>,
  P extends Record<string, string | number>,
>(localizedString: T, values: Placeholders<T>): string;
function format(
  localizedString: string,
  values: Record<string, string | number>,
): string;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function format(localizedString: unknown, values: unknown): string {
  invariant(
    false,
    "Nova Localization provider must be initialized prior to consumption!",
  );
}

/**
 * Hook to access the `format` function that can be used to replace placeholders in a localized string.
 *
 * This hook reads the `NovaLocalization` from the context. It calls `useFormat` from the `NovaLocalization` object.
 * If the `NovaLocalization` is not provided, it will throw an error.
 *
 * @returns The `format` function that can be used to replace placeholders in a localized string.
 *
 * @example
 * ```tsx
 * import { useFormat, useFragment } from "@nova/react";
 *
 * const MyComponent = () => {
 *   const format = useFormat();
 *   const viewData = useFragment(graphql`
 *     fragment MyComponent_viewData on ViewData {
 *       greetingLabel
 *     }`,
 *     props.viewData
 *   );
 *
 *   return <div>{format(viewData.greetingLabel, { name: "John" })}</div>;
 * };
 * ```
 */
export function useFormat(): typeof format {
  return useLocalization().useFormat();
}
