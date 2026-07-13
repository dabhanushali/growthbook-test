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
      console.log("GrowthBook Experiment Exposed:", experiment.key, "Variant:", result.key);
      
      // Track exposure event in PostHog
      posthog.capture("$experiment_started", {
        "Experiment ID": experiment.key,
        "Variant ID": result.key,
        $feature_flag_key: experiment.key,
        $feature_flag_variant: result.key,
      });
    },
  }));

  useEffect(() => {
    // Enable streaming for SSE live updates on the client
    gb.init({
      streaming: true,
    });
    
    // Supplement browser-only attributes on load
    const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
    gb.setAttributes({
      ...gb.getAttributes(),
      device: deviceType,
    });
  }, [gb]);

  return <GBProvider growthbook={gb}>{children}</GBProvider>;
}
