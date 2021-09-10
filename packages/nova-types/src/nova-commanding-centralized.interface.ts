/**
 * Describes the commanding contract a Nova component can expect to be provided by the host application. Refer to the equally
 * named React hooks provided by the `@nova/react-facade` package for their functional details.
 * 
 * TODO This contract needs to be redesigned to:
 * - support a common contract but distributed command definitions
 * - decouple command triggering from layout information
 * 
 * The current version is functional for a small number of users, but will not scale, and blurs the boundaries of responsibility
 * between the command triggerer and the host framework (which should be responsible for establishing how the user's intent is 
 * expressed within the larger system).
 */

export interface NovaCentralizedCommanding {
  trigger(command: EntityCommand): Promise<void>;
}

export interface EntityCommandInput {
  visibilityState: EntityVisibilityState;
  stateTransition: EntityStateTransition;
}

export interface EntityInput {
  id?: string | null;
  type: EntityType;
  action: EntityAction;
  linkedEntity?: LinkedEntity | null;
}

export interface LinkedEntity {
  id: string;
  type: EntityType;
}

export interface EntityCommand {
  entity: EntityInput;
  command: EntityCommandInput;
}

export enum EntityVisibilityState {
  show = "show",
  hide = "hide",
  toggle = "toggle"
}

export enum EntityStateTransition {
  // Processes the given entity and adds it to the current state.
  none = "none",
  // Flushes the current state of all previously processed entities before processing the given entity.
  flush = "flush",
  // Excludes the current context from entity matching. Not supported outside of main context
  forceFlush = "forceFlush",
  // Produces a new entity state from the given entity to be stored in parallel to the current state.
  new = "new",
  // Extends the current state with the given state.
  extend = "extend"
}

export enum EntityAction {
  default = "default",
  view = "view",
  list = "list",
  signout = "signout",
  updateProfilePicture = "updateProfilePicture",
  updateDisplayName = "updateDisplayName"
}

export enum EntityType {
  identity = "identity",
  teams_activity = "teams_activity",
  teams_chat = "teams_chat",
  teams_channel = "teams_channel",
  teams_calendar = "teams_calendar",
  teams_calling = "teams_calling",
  outlook_mail = "outlook_mail",
  outlook_calendar = "outlook_calendar",
  outlook_people = "outlook_people",
  outlook_fileshub = "outlook_fileshub",
  outlook_tasks = "outlook_tasks",
  m365_app = "m365_app"
}
