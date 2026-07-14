"use client";

import { ReactNode, useEffect, useState } from "react";
import { GrowthBook } from "@growthbook/growthbook";
import { GrowthBookProvider as GBProvider } from "@growthbook/growthbook-react";
import posthog from "posthog-js";

interface Props {
  children: ReactNode;
  initialFeatures?: any;
  initialAttributes?: any;
}

export function GrowthBookProvider({ children, initialFeatures, initialAttributes }: Props) {
  // Initialize GrowthBook client instance once with server-loaded data
  const [gb] = useState(() => new GrowthBook({
    apiHost: process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST,
    clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY,
    enableDevMode: true,
    features: initialFeatures,
    attributes: initialAttributes,
    trackingCallback: (experiment, result) => {
      const userId = gb.getAttributes().id || "unknown_user";
      console.log("GrowthBook Experiment Exposed:", experiment.key, "Variant:", result.value);

      // 1. Track exposure event in PostHog
      posthog.capture("$experiment_started", {
        "Experiment ID": experiment.key,
        "Variant ID": String(result.value),
        $feature_flag_key: experiment.key,
        $feature_flag_variant: String(result.value),
      });

      // 2. Track exposure event in local Postgres (for GrowthBook stats engine queries)
      fetch("/api/log-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          experimentId: experiment.key,
          variationId: String(result.value),
        }),
      }).catch((e) => console.error("Failed to log exposure to Postgres:", e));
    },
  }));

  useEffect(() => {
    // Enable streaming for SSE live updates on the client — run only once.
    gb.init({ streaming: true });
  }, [gb]);

  useEffect(() => {
    // Sync server-resolved attributes into the client SDK whenever they change
    // (e.g. after a Re-roll or a cookie update from the POC Controller).
    // This is what makes A/B bucketing re-evaluate with the new user ID.
    if (initialAttributes) {
      const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
      gb.setAttributes({
        ...initialAttributes,
        device: deviceType, // override with the real client-detected value
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gb, JSON.stringify(initialAttributes)]);


  return <GBProvider growthbook={gb}>{children}</GBProvider>;
}
