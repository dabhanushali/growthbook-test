"use client";

import { ReactNode, useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";

// Initialize PostHog client side only
if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only", // capture profiles for identified users
      capture_pageview: false, // Turn off automatic pageviews to manage it manually inside Next.js
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug(); // Enable debug logs in development mode
        }
      },
    });
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
