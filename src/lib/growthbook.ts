import { GrowthBook } from "@growthbook/growthbook";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";
import { LOCAL_MOCK_FEATURES } from "./gb-features";

// Fetch features from the local/cloud GrowthBook instance
export async function getGrowthBookFeatures() {
  // Check if headers were already injected by Edge Middleware to prevent duplicate parsing/fetching
  try {
    const headerStore = await nextHeaders();
    const gbFeaturesHeader = headerStore.get("x-gb-features");
    if (gbFeaturesHeader) {
      return JSON.parse(gbFeaturesHeader);
    }
  } catch (err) {
    console.warn("Could not read headers in getGrowthBookFeatures:", err);
  }

  const apiHost = process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || "http://localhost:3100";
  const clientKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY;

  if (!clientKey) {
    console.warn("GrowthBook Client Key is not configured. Falling back to local mock features.");
    return LOCAL_MOCK_FEATURES;
  }

  const url = `${apiHost}/api/features/${clientKey}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch features: ${res.statusText}`);
    }
    const json = await res.json();
    const apiFeatures: Record<string, any> = json.features || {};

    // Merge strategy: LOCAL_MOCK_FEATURES provides the targeting rule baseline.
    // If the live GrowthBook API has published rules for a flag, those win.
    // If the API returns a flag with NO rules (unpublished draft), the mock rules are used.
    // This lets the POC work without requiring every flag to be published in the dashboard.
    const merged: Record<string, any> = { ...LOCAL_MOCK_FEATURES };
    for (const [key, apiVal] of Object.entries(apiFeatures)) {
      const hasApiRules = apiVal.rules && apiVal.rules.length > 0;
      if (hasApiRules) {
        // Live published rules exist — use them
        merged[key] = apiVal;
      } else if (merged[key]) {
        // API returned the flag but with no rules (draft not published yet).
        // Keep the mock rules but respect the API's defaultValue if it differs.
        merged[key] = { ...merged[key], defaultValue: apiVal.defaultValue };
      } else {
        // Flag only exists in the API (not in mock) — add it as-is
        merged[key] = apiVal;
      }
    }
    return merged;
  } catch (err) {
    console.warn("Error fetching features from GrowthBook, using local mock features fallback:", err);
    return LOCAL_MOCK_FEATURES;
  }
}


// Fetch user attributes server-side from request contexts
export async function getServerAttributes() {
  try {
    const headerStore = await nextHeaders();
    const gbAttrsHeader = headerStore.get("x-gb-attributes");
    if (gbAttrsHeader) {
      return JSON.parse(gbAttrsHeader);
    }
  } catch (err) {
    console.warn("Could not read headers in getServerAttributes:", err);
  }

  const cookieStore = await nextCookies();
  const headerStore = await nextHeaders();
  
  // Retrieve or fallback for anonymous ID
  let anonId = cookieStore.get("gb_anon_id")?.value;
  if (!anonId) {
    // Generate fallback server ID for layout rendering (middleware will override this in cookie)
    anonId = "server_anon_" + Math.random().toString(36).substring(2, 11);
  }
  
  // Detect country & device type from headers
  // Priority: Vercel geo header → POC Controller cookie (gb_country) → default "US"
  const country =
    headerStore.get("x-vercel-ip-country") ||
    cookieStore.get("gb_country")?.value ||
    "US";
  const userAgent = headerStore.get("user-agent") || "";
  const device = /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop";
  
  // Custom interactive mock settings from cookies to test targeting rules
  const role = cookieStore.get("gb_role")?.value || "guest";
  const plan = cookieStore.get("gb_plan")?.value || "free";
  const isLoggedIn = cookieStore.get("gb_logged_in")?.value === "true";

  return {
    id: anonId,
    device,
    country,
    role,
    plan,
    isLoggedIn,
  };
}

// Helper to initialize GrowthBook for Server Components
export async function getServerGBInstance() {
  const features = await getGrowthBookFeatures();
  const attributes = await getServerAttributes();
  
  const gb = new GrowthBook({
    features,
    attributes,
  });
  
  return gb;
}
