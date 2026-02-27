interface AnalyticsEvent {
  event: string;
  userId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const provider = process.env.ANALYTICS_PROVIDER ?? "none";

  if (provider === "none") {
    return;
  }

  console.info(`[analytics:${provider}]`, event);
}
