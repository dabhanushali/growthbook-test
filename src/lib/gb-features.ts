export const LOCAL_MOCK_FEATURES: Record<string, any> = {
  "new-homepage": {
    "defaultValue": false,
    "rules": [
      {
        "condition": { "country": { "$in": ["IN", "US"] } },
        "force": true
      }
    ]
  },
  "dark-mode": {
    "defaultValue": false,
    "rules": [
      {
        "condition": { "isLoggedIn": true },
        "force": true
      }
    ]
  },
  "ai-assistant": {
    "defaultValue": false,
    "rules": [
      {
        "condition": { "plan": { "$in": ["premium", "enterprise"] } },
        "force": true
      }
    ]
  },
  "new-checkout": {
    "defaultValue": false,
    "rules": [
      {
        "coverage": 0.5,
        "hashAttribute": "id",
        "force": true
      }
    ]
  },
  "homepage-hero": {
    "defaultValue": "control",
    "rules": [
      {
        "variations": ["control", "variant"],
        "weights": [0.5, 0.5],
        "hashAttribute": "id"
      }
    ]
  },
  "cta-button": {
    "defaultValue": "blue",
    "rules": [
      {
        "variations": ["blue", "green"],
        "weights": [0.5, 0.5],
        "hashAttribute": "id"
      }
    ]
  },
  "homepage-content": {
    "defaultValue": {
      "title": "Next.js Edge Experimentation & Flags",
      "description": "Welcome to the control hero section. Check out the targeting widgets on the right to trigger other variations."
    },
    "rules": [
      {
        "condition": { "country": "IN" },
        "force": {
          "title": "Namaste! Welcome to our Indian GrowthBook Experience",
          "description": "Evaluating local edge attributes in India."
        }
      },
      {
        "condition": { "country": "US" },
        "force": {
          "title": "Howdy! Welcome to our US GrowthBook Experience",
          "description": "Evaluating local edge attributes in the United States."
        }
      }
    ]
  },
  "signup-banner": {
    "defaultValue": false,
    "rules": [
      {
        "condition": { "isLoggedIn": false },
        "force": true
      }
    ]
  }
};
