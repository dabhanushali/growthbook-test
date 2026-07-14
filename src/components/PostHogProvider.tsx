"use client";

import { ReactNode, useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";

// Initialize PostHog client side only
// A PostHog project key always starts with "phc_" and is at least 30 chars long.
// If the env var is a placeholder/test key we skip init to avoid 401/404 noise.
const isRealPostHogKey = (key: string) =>
  key.startsWith("phc_") && key.length > 20 && !key.includes("test_key");

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  if (isRealPostHogKey(posthogKey)) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageview: false,
      // Disable features that make extra API calls — avoids 404/401 when the
      // PostHog project has no surveys or remote-config set up.
      disable_surveys: true,
      advanced_disable_decide: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });
  } else if (process.env.NODE_ENV === "development") {
    console.warn(
      "[PostHog] Skipping init — NEXT_PUBLIC_POSTHOG_KEY is a placeholder.\n" +
      "To enable analytics, replace it with your real project key from app.posthog.com."
    );
  }
}

// Sub-component to capture pageview events on path/query changes
function PostHogPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== "undefined") {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + "?" + searchParams.toString();
      }
      console.log("PostHog Pageview Captured:", url);
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

interface Props {
  children: ReactNode;
}

export function PostHogProvider({ children }: Props) {
  return (
    <PHProvider client={posthog}>
      <PostHogPageviewTracker />
      {children}
    </PHProvider>
  );
}
