export interface NovaEventing {
  bubble(event: EventWrapper): Promise<void>;
}

export interface EventWrapper {
  event: NovaEvent<unknown>; // The event details for handling
  source: Source; // Details about the underlying event
}

export interface NovaEvent<T> {
  originator: string; // eg AppBar - matches to the Views root element for the control
  type: string; // eg AppTileClick - control will have multiple groups of events
  data?: () => T; // Optional function to generate the data associated with the event
}

export interface Source {
  timeStamp: number; // When the event occured
  inputType: keyof typeof InputType;
}

export const InputType = {
  unknown: "unknown", // Fallback for events triggered by the user from an unknown input
  mouse: "mouse",
  keyboard: "keyboard",
  touch: "touch",
  pen: "pen",
  programmatic: "programmatic", // Used for events triggered by code processes
} as const;
