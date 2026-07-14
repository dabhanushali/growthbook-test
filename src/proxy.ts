import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GrowthBook } from "@growthbook/growthbook";
import { LOCAL_MOCK_FEATURES } from "./lib/gb-features";

export async function proxy(request: NextRequest) {
  // 1. Get or generate anonymous ID
  let anonId = request.cookies.get("gb_anon_id")?.value;
  let didGenerateAnonId = false;
  if (!anonId) {
    anonId = "anon_" + Math.random().toString(36).substring(2, 11);
    didGenerateAnonId = true;
  }

  // 2. Resolve attributes
  // Country: from Vercel header, fallback to cookie, fallback to default "US"
  const country = request.headers.get("x-vercel-ip-country") || request.cookies.get("gb_country")?.value || "US";
  
  // Device: parse User-Agent
  const userAgent = request.headers.get("user-agent") || "";
  const device = /Mobi|Android/i.test(userAgent) ? "mobile" : "desktop";

  // Targeting attributes simulated by the POC Console
  const role = request.cookies.get("gb_role")?.value || "guest";
  const plan = request.cookies.get("gb_plan")?.value || "free";
  const isLoggedIn = request.cookies.get("gb_logged_in")?.value === "true";

  const attributes = {
    id: anonId,
    device,
    country,
    role,
    plan,
    isLoggedIn,
  };

  // 3. Retrieve feature flags definitions
  // In production, we'd cache these in Vercel Edge Config or Redis.
  // For the POC, we fetch from the local API with a 200ms timeout fallback.
  let features = LOCAL_MOCK_FEATURES;
  const apiHost = process.env.NEXT_PUBLIC_GROWTHBOOK_API_HOST || "http://localhost:3100";
  const clientKey = process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY;

  if (clientKey) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 200); // 200ms timeout
      const res = await fetch(`${apiHost}/api/features/${clientKey}`, {
        signal: controller.signal,
      });
      clearTimeout(id);
      if (res.ok) {
        const json = await res.json();
        if (json.features) {
          features = json.features;
        }
      }
    } catch (e) {
      // Fetch failed or timed out, falls back to LOCAL_MOCK_FEATURES
    }
  }

  // 4. Instantiate GrowthBook for verification / validation checks at Edge if needed
  const gb = new GrowthBook({
    features,
    attributes,
  });

  // 5. Clone request headers and inject resolved features & attributes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-gb-features", JSON.stringify(features));
  requestHeaders.set("x-gb-attributes", JSON.stringify(attributes));

  // 6. Create response and copy headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 7. If we generated a new anonymous ID, set it in the cookies of the response
  if (didGenerateAnonId) {
    response.cookies.set("gb_anon_id", anonId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // Allow client-side JS to read
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static resources (images, css, js) and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
