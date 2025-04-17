import * as React from "react";
import { render } from "vitest-browser-react";
import { describe, it, expect, vi } from "vitest";
import {
  NovaCentralizedCommandingProvider,
  useNovaCentralizedCommanding,
} from "./nova-centralized-commanding-provider";
import type { NovaCentralizedCommanding } from "@nova/types";
import {
  EntityType,
  EntityAction,
  EntityStateTransition,
  EntityVisibilityState,
} from "@nova/types";

describe(useNovaCentralizedCommanding, () => {
  it("throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      useNovaCentralizedCommanding();
      return null;
    };

    expect(() => render(<TestUndefinedContextComponent />)).toThrow(
      "Nova Centralized Commanding provider must be initialized prior to consumption!",
    );
  });

  it("is able to access the commanding instance provided by the provider", () => {
    expect.assertions(1);

    const commanding = {
      trigger: vi.fn(),
    } as unknown as NovaCentralizedCommanding;

    const TestPassedContextComponent: React.FC = () => {
      const facadeFromContext = useNovaCentralizedCommanding();
      const didTrigger = React.useRef(false);
      React.useEffect(() => {
        if (didTrigger.current) {
          return;
        }
        facadeFromContext.trigger({
          entity: {
            type: EntityType.teams_activity,
            action: EntityAction.default,
          },
          command: {
            stateTransition: EntityStateTransition.new,
            visibilityState: EntityVisibilityState.show,
          },
        });
        didTrigger.current = true;
      }, []);
      return null;
    };

    render(
      <NovaCentralizedCommandingProvider commanding={commanding}>
        <TestPassedContextComponent />
      </NovaCentralizedCommandingProvider>,
    );

    expect(commanding.trigger).toBeCalledTimes(1);
  });
});
