Video Script: What Level of Complexity Can GrowthBook Handle?
"GrowthBook is not just a simple ON/OFF switch. It is built to support complex enterprise-level product targeting and statistical experimentation. Here is what it can handle, broken down into 4 levels:"
🚀 Level 1: Multi-Attribute Targeting (The Contextual Gate)
What it is: Gating features not just by one attribute (like country), but by a combination of real-time conditions.
The Complexity: You can write complex logical rules using MongoDB query operators ($or, $and, $in, $gt, regex matching).
Real-world Example:
"Show this new checkout flow ONLY if: User is in the US or UK AND their plan is Premium AND they are using a Mobile Device AND their account age is greater than 30 days."

🧪 Level 2: Advanced A/B/n & Multivariate Testing
What it is: Testing multiple variations at once with uneven weight distributions.
The Complexity: You are not limited to 50/50 splits. You can test 5 different design layouts (A, B, C, D, E) and set specific traffic percentages for each (e.g., 80% Control, and 5% for each of the 4 variations).
Real-world Example: Testing 4 different pricing page structures simultaneously to find the exact configuration that yields the highest checkout conversion.
🔀 Level 3: Overlapping Experiments & Namespaces (No Contamination)
What it is: Running multiple tests on the same page at the same time without them interfering with each other.
The Complexity: Namespaces partition your traffic. If you have two experiments on the checkout page, you can assign them to the same namespace. GrowthBook will ensure a user who enters Experiment A is automatically excluded from Experiment B. This prevents data contamination (users seeing conflicting changes).
Real-world Example: Running a CTA button test and a checkout progress-bar test at the same time, ensuring no single user gets exposed to both experiments.
⚙️ Level 4: Dynamic JSON Configurations (Remote Code Execution)
What it is: Returning full JSON objects to the code instead of simple booleans or strings.
The Complexity: You can control application logic and UI layouts dynamically from the GrowthBook UI.
Real-world Example: A feature flag that returns:
json
{
  "showBanner": true,
  "discountPercent": 15,
  "bannerColors": { "bg": "#ff0000", "text": "#ffffff" },
  "paymentGateways": ["stripe", "paypal"]
}
The developers write the code once, and Product Managers can change the discount, colors, and layout directly from the GrowthBook dashboard.
📊 Level 5: Enterprise Analytics & Variance Reduction (CUPED)
What it is: Handling millions of rows of data and running high-end statistics.
The Complexity:
CUPED (Controlled-experiment Using Pre-Experiment Data): GrowthBook uses pre-experiment user behavior to reduce variance, meaning you can achieve statistical significance up to 50% faster (saving weeks of run time).
Dimensional Analysis: You can break down A/B test results by browser, device, or country to see if a variant performed well in the US but failed in Europe.
Regression Adjustment & Outlier Filtering: Automatically stripping out bots or extreme power-users (e.g. someone buying $10,000 of items) who would skew the experiment statistics.