export type TelemetryEvent = {
  name: string;
  props?: Record<string, any>;
};

export function track(event: TelemetryEvent) {
  // Placeholder: wire to real analytics later
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[telemetry]", event.name, event.props ?? {});
  }
}

