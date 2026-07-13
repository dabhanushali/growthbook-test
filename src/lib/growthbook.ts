import { GrowthBook } from "@growthbook/growthbook";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";

// Fetch features from the local/cloud GrowthBook instance
export async function getGrowthBookFeatures() {
  const apiHost = process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || "http://localhost:3100";
  const clientKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY;

  if (!clientKey) {
    console.error("GrowthBook Client Key is not configured!");
    return {};
  }

  const url = `${apiHost}/api/features/${clientKey}`;

  try {
    const res = await fetch(url, {
      // Revalidate cache every 10 seconds for development POC.
      next: { revalidate: 10 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch features: ${res.statusText}`);
    }
    const json = await res.json();
    return json.features || {};
  } catch (err) {
    console.error("Error fetching features from GrowthBook:", err);
    return {};
  }
}

// Fetch user attributes server-side from request contexts
export async function getServerAttributes() {
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
