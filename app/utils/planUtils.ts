// app/utils/planUtils.ts

import db from "../db.server";

export async function getShopPlanFromDB(shop: string) {
    const record = await db.shopPlan.findUnique({ where: { shop } });

    if (!record) {
        return await db.shopPlan.create({
            data: {
                shop,
                plan: "none",
                status: "active",
            },
        });
    }

    return record;
}

export async function updateShopPlan(
    shop: string,
    plan: string,
    subscriptionId: string | null,
    trialDays?: number
) {
    const now = new Date();
    const trialEndsAt = trialDays
        ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
        : null;

    return db.shopPlan.upsert({
        where: { shop },
        update: {
            plan,
            subscriptionId,
            status: "active",
            billingStartedAt: subscriptionId ? now : null,
            trialEndsAt: trialEndsAt,
        },
        create: {
            shop,
            plan,
            subscriptionId,
            status: "active",
            billingStartedAt: subscriptionId ? now : null,
            trialEndsAt: trialEndsAt,
            wishlistCount: 0,
        },
    });
}

export async function cancelShopPlan(shop: string) {
    return db.shopPlan.update({
        where: { shop },
        data: {
            plan: "none",
            subscriptionId: null,
            status: "cancelled",
            billingStartedAt: null,
        },
    });
}