import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  getStoreByShop,
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  isInWishlist,
  mergeGuestWishlist,
  getWishlistCount,
  getStoreSettingsByShop,
} from "../services/wishlist.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const customerId = url.searchParams.get("customerId");
  const productId = url.searchParams.get("productId");
  const action = url.searchParams.get("action");

  if (!shop || !customerId) {
    return json({ error: "Missing shop or customerId" }, { status: 400, headers: cors });
  }

  const store = await getStoreByShop(shop);
  if (!store || !store.isActive) {
    return json({ error: "Store not found" }, { status: 404, headers: cors });
  }

  if (action === "check" && productId) {
    const inWishlist = await isInWishlist(store.id, customerId, productId);
    return json({ inWishlist }, { headers: cors });
  }

  if (action === "count") {
    const count = await getWishlistCount(store.id, customerId);
    return json({ count }, { headers: cors });
  }

  if (action === "settings") {
    const settings = await getStoreSettingsByShop(shop);
    return json({ settings }, { headers: cors });
  }

  const wishlist = await getWishlist(store.id, customerId);
  return json({ wishlist }, { headers: cors });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const body = await request.json();
  const { shop, customerId, productId, variantId, action } = body;

  if (!shop || !customerId) {
    return json({ error: "Missing shop or customerId" }, { status: 400, headers: cors });
  }

  const store = await getStoreByShop(shop);
  if (!store || !store.isActive) {
    return json({ error: "Store not found" }, { status: 404, headers: cors });
  }

  try {
    switch (action) {
      case "add": {
        if (!productId) return json({ error: "Missing productId" }, { status: 400, headers: cors });
        const item = await addWishlistItem(store.id, customerId, productId, variantId);
        return json({ success: true, item }, { headers: cors });
      }
      case "remove": {
        if (!productId) return json({ error: "Missing productId" }, { status: 400, headers: cors });
        await removeWishlistItem(store.id, customerId, productId, variantId);
        return json({ success: true }, { headers: cors });
      }
      case "merge": {
        const { guestId } = body;
        if (!guestId) return json({ error: "Missing guestId" }, { status: 400, headers: cors });
        await mergeGuestWishlist(store.id, guestId, customerId);
        return json({ success: true }, { headers: cors });
      }
      default:
        return json({ error: `Unknown action: ${action}` }, { status: 400, headers: cors });
    }
  } catch (error: any) {
    return json({ error: error.message || "Internal error" }, { status: 500, headers: cors });
  }
};
