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
    const res = await fetch(url, {
      next: { revalidate: 10 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch features: ${res.statusText}`);
    }
    const json = await res.json();
    return json.features || LOCAL_MOCK_FEATURES;
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
  const country = headerStore.get("x-vercel-ip-country") || "US";
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
