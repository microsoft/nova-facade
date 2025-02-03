/**
 * @jest-environment jsdom
 */

import * as React from "react";
import type { StringWithPlaceholders, NovaLocalization } from "@nova/types";
import { render } from "@testing-library/react";
import { NovaLocalizationProvider, useFormat } from "./nova-localization";

describe(useFormat, () => {
  it("throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      useFormat();
      return null;
    };

    expect(() => render(<TestUndefinedContextComponent />)).toThrow(
      "Nova Localization provider must be initialized prior to consumption!",
    );
  });

  it("is able to access the `format` function provided by the provider", () => {
    expect.assertions(3);

    const formatFn = jest.fn();
    const localization: NovaLocalization = {
      useFormat: jest.fn().mockReturnValue(formatFn),
    };

    const TestPassedContextComponent: React.FC = () => {
      const format = useFormat();

      const greeting: StringWithPlaceholders<{ name: string }> =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "Hello, {name}!" as any;

      format(greeting, {
        name: "World",
      });

      return null;
    };

    render(
      <NovaLocalizationProvider localization={localization}>
        <TestPassedContextComponent />
      </NovaLocalizationProvider>,
    );

    // twice due to strict mode
    expect(localization.useFormat).toBeCalledTimes(2);
    expect(formatFn).toBeCalledTimes(2);

    expect(formatFn).toBeCalledWith("Hello, {name}!", {
      name: "World",
    });
  });

  it("works in the fallback scenario where the typ of the string with placeholders is a string (aka, no compiler support)", () => {
    expect.assertions(3);

    const formatFn = jest.fn();
    const localization: NovaLocalization = {
      useFormat: jest.fn().mockReturnValue(formatFn),
    };

    const TestPassedContextComponent: React.FC = () => {
      const format = useFormat();

      const greeting = "Hello, {name}!" as const;

      format(greeting, {
        name: "World",
      });

      return null;
    };

    render(
      <NovaLocalizationProvider localization={localization}>
        <TestPassedContextComponent />
      </NovaLocalizationProvider>,
    );

    // twice due to strict mode
    expect(localization.useFormat).toBeCalledTimes(2);
    expect(formatFn).toBeCalledTimes(2);

    expect(formatFn).toBeCalledWith("Hello, {name}!", {
      name: "World",
    });
  });
});
