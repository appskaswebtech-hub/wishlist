// app/config/plans.ts

export interface Plan {
    key: string;
    label: string;
    price: number;
    trialDays: number;
    features: string[];
    color: string;
    popular: boolean;
}

export const PLANS: Record<string, Plan> = {
    basic: {
        key: "basic",
        label: "Basic",
        price: 5,
        trialDays: 7,
        color: "#F6F6F7",
        popular: false,
        features: [
            "Up to 10 wishlist items per customer",
            "Heart icons on product cards",
            "Wishlist page",
            "Email support",
        ],
    },
    pro: {
        key: "pro",
        label: "Pro",
        price: 10,
        trialDays: 7,
        color: "#F0F4FF",
        popular: true,
        features: [
            "Up to 20 wishlist items per customer",
            "Everything in Basic",
            "Guest wishlist support",
            "Header badge count",
            "Priority support",
        ],
    },
    advanced: {
        key: "advanced",
        label: "Advanced",
        price: 15,
        trialDays: 7,
        color: "#F3F0FF",
        popular: false,
        features: [
            "Up to 30 wishlist items per customer",
            "Everything in Pro",
            "Analytics dashboard",
            "API & Webhook access",
            "Dedicated support",
        ],
    },
};

export const PLAN_KEYS = Object.keys(PLANS);