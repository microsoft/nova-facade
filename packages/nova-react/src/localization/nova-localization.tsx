import * as React from "react";
import type { NovaLocalization, FormatFn } from "@nova/types";
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

export function useFormat(): FormatFn {
  return useLocalization().useFormat();
}
