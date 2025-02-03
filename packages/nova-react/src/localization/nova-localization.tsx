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

export function useFormat(): typeof format {
  return useLocalization().useFormat();
}
