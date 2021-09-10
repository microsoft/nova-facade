import * as React from "react";
import { render } from "@testing-library/react"
import {
  NovaCentralizedCommandingProvider,
  useNovaCentralizedCommanding,
} from "./nova-centralized-commanding-provider";
import {
  NovaCentralizedCommanding,
  EntityType,
  EntityAction,
  EntityStateTransition,
  EntityVisibilityState,
} from "@nova/types";

describe(useNovaCentralizedCommanding, () => {
  it("throws without a provider", () => {
    expect.assertions(1);

    const TestUndefinedContextComponent: React.FC = () => {
      try {
        useNovaCentralizedCommanding();
      } catch (e) {
        expect((e as Error).message).toMatch(
          "Nova Centralized Commanding provider must be initialized prior to consumption!"
        );
      }
      return null;
    };

    render(<TestUndefinedContextComponent />);
  });

  it("is able to access the commanding instance provided by the provider", () => {
    expect.assertions(2);

    const commanding = ({
      trigger: jest.fn(),
    } as unknown) as NovaCentralizedCommanding;

    const TestPassedContextComponent: React.FC = () => {
      const facadeFromContext = useNovaCentralizedCommanding();
      expect(facadeFromContext).toBe(commanding);
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
      expect(commanding.trigger).toBeCalledTimes(1);
      return null;
    };

    render(
      <NovaCentralizedCommandingProvider commanding={commanding} >
        <TestPassedContextComponent />
      </NovaCentralizedCommandingProvider>
    );
  });
});
