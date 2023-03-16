import type { Source } from "./nova-eventing.interface";

/**
 * Describes the commanding contract that can be used to communicate between two logical actors within a host application.
 * This contract is not designed to be used within the React layer - Eventing should be used to allow UI components to
 * bubble events to the logical actor hosting the UI, which will translate the events into internal actions, or into
 * commands to send to other logical actors.
 *
 * Usage: logical actors should small independent packages that define the commands they support using this contract.
 * Other actors can take a dependency on the command package of another actor, and use it to send correctly typed commands.
 */

export interface NovaCommanding {
  /**
   * The fire-and-forget interface for sending a command to another
   * actor within the host application.
   * @param commandWrapper
   */
  trigger(commandWrapper: CommandWrapper): Promise<void>;
}

export interface CommandWrapper {
  command: NovaCommand<unknown>;
  source?: Source;
}

/**
 * NovaCommand is the generic contract used to allow one logical actor
 * to communicate actions requests to another actor.
 */
export interface NovaCommand<TData> {
  // The logical actor within the host application for the requested action
  actor: string;
  // The action - valid actions are defined by the actor
  action: string;
  // Optional hint about where to perform the action (may not be honored)
  location?: Location;
  // Optional data object defining the action (should be serializable)
  data?: TData;
}

/**
 * Location is an optional hint about where an action should take place.
 * By default, the location is left up to the actor to determine.
 */
export const Location = {
  default: "default",
  new: "new",
} as const;
