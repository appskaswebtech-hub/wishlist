import type { LoaderFunctionArgs } from "@remix-run/node";
import { getStoreByShop } from "../services/wishlist.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) return new Response("Missing shop", { status: 400 });
  const store = await getStoreByShop(shop);
  if (!store) return new Response("Store not found", { status: 404 });

  // By NOT using {% layout none %}, Shopify automatically wraps this
  // inside the active theme layout — so header, footer, and nav all appear.
  const liquid = `
<style>
  :root {
    --wl-primary: #e74c6f;
    --wl-text: #1a1a1a;
    --wl-text-muted: #6b7280;
    --wl-border: #e5e7eb;
    --wl-radius: 12px;
    --wl-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --wl-shadow-hover: 0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04);
    --wl-columns: 4;
  }
  .wl-page { max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; font-family: inherit; color: var(--wl-text); }
  .wl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid var(--wl-border); }
  .wl-header h1 { font-size: 32px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
  .wl-header-right { display: flex; align-items: center; gap: 16px; }
  .wl-count { font-size: 14px; color: var(--wl-text-muted); background: #f3f4f6; padding: 6px 14px; border-radius: 20px; font-weight: 500; }
  .wl-share-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid var(--wl-border); border-radius: 8px; background: white; cursor: pointer; font-size: 13px; color: var(--wl-text-muted); transition: all 0.2s; }
  .wl-share-btn:hover { border-color: var(--wl-primary); color: var(--wl-primary); }
  .wl-grid { display: grid; grid-template-columns: repeat(var(--wl-columns), 1fr); gap: 24px; }
  @media (max-width: 1024px) { .wl-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 768px) { .wl-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
  @media (max-width: 480px) { .wl-grid { grid-template-columns: 1fr; } }
  .wl-card { background: #fff; border-radius: var(--wl-radius); overflow: hidden; box-shadow: var(--wl-shadow); transition: all 0.3s cubic-bezier(0.4,0,0.2,1); position: relative; }
  .wl-card:hover { box-shadow: var(--wl-shadow-hover); transform: translateY(-4px); }
  .wl-card-img-wrap { position: relative; overflow: hidden; aspect-ratio: 1; background: #f9fafb; }
  .wl-card-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
  .wl-card:hover .wl-card-img-wrap img { transform: scale(1.05); }
  .wl-card-remove { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; border: none; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.1); opacity: 0; transform: scale(0.8); }
  .wl-card:hover .wl-card-remove { opacity: 1; transform: scale(1); }
  .wl-card-remove svg { width: 16px; height: 16px; color: #9ca3af; transition: color 0.2s; }
  .wl-card-remove:hover svg { color: #ef4444; }
  .wl-badge-oos { position: absolute; top: 12px; left: 12px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #fef2f2; color: #dc2626; }
  .wl-card-info { padding: 16px; }
  .wl-card-vendor { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--wl-text-muted); margin-bottom: 4px; font-weight: 500; }
  .wl-card-title { font-size: 14px; font-weight: 600; line-height: 1.4; margin-bottom: 8px; }
  .wl-card-title a { text-decoration: none; color: inherit; transition: color 0.2s; }
  .wl-card-title a:hover { color: var(--wl-primary); }
  .wl-card-price { font-size: 16px; font-weight: 700; color: var(--wl-text); margin-bottom: 12px; }
  .wl-card-atc { width: 100%; padding: 10px 16px; border: 1.5px solid var(--wl-text); border-radius: 8px; background: transparent; color: var(--wl-text); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
  .wl-card-atc:hover { background: var(--wl-text); color: white; }
  .wl-card-atc:disabled { opacity: 0.4; cursor: not-allowed; }
  .wl-empty { text-align: center; padding: 100px 20px; grid-column: 1 / -1; }
  .wl-empty-icon { width: 80px; height: 80px; margin: 0 auto 24px; color: #d1d5db; }
  .wl-empty h2 { font-size: 22px; font-weight: 600; margin-bottom: 8px; }
  .wl-empty p { color: var(--wl-text-muted); font-size: 15px; max-width: 400px; margin: 0 auto 24px; line-height: 1.6; }
  .wl-empty-cta { display: inline-flex; padding: 12px 28px; background: var(--wl-text); color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; transition: opacity 0.2s; }
  .wl-empty-cta:hover { opacity: 0.85; }
  .wl-loading { grid-column: 1 / -1; text-align: center; padding: 80px 20px; }
  .wl-spinner { width: 40px; height: 40px; border: 3px solid #e5e7eb; border-top-color: var(--wl-primary); border-radius: 50%; animation: wl-spin 0.7s linear infinite; margin: 0 auto 16px; }
  @keyframes wl-spin { to { transform: rotate(360deg); } }
  .wl-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(100px); background: #1f2937; color: white; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); z-index: 1000; }
  .wl-toast.show { transform: translateX(-50%) translateY(0); }
  .wl-card.removing { opacity: 0; transform: scale(0.9); transition: all 0.3s ease; }
</style>

<div class="wl-page">
  <div class="wl-header">
    <h1>My Wishlist</h1>
    <div class="wl-header-right">
      <span class="wl-count" id="wl-count">Loading...</span>
      <button class="wl-share-btn" id="wl-share" style="display:none" onclick="window.__wlShare()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        Share
      </button>
    </div>
  </div>
  <div class="wl-grid" id="wl-grid">
    <div class="wl-loading">
      <div class="wl-spinner"></div>
      <p style="color:#9ca3af;font-size:14px">Loading your wishlist...</p>
    </div>
  </div>
</div>
<div class="wl-toast" id="wl-toast"></div>

<script>
(function() {
  var shop = {{ shop.permanent_domain | json }};
  var proxyUrl = {{ shop.url | json }} + "/apps/wishlist";
  var customerId = {{ customer.id | json }} || localStorage.getItem("wishlist_guest_id");

  if (!customerId) { showEmpty(); return; }

  fetch(proxyUrl + "/api/products?shop=" + encodeURIComponent(shop) + "&customerId=" + encodeURIComponent(customerId))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var items = data.items || [];
      var s = data.settings || {};

      if (s.gridColumns) document.documentElement.style.setProperty("--wl-columns", s.gridColumns);
      if (s.activeColor) document.documentElement.style.setProperty("--wl-primary", s.activeColor);
      if (s.showShareButton) document.getElementById("wl-share").style.display = "inline-flex";
      if (s.showItemCount !== false) {
        document.getElementById("wl-count").textContent = items.length + " item" + (items.length !== 1 ? "s" : "");
      } else {
        document.getElementById("wl-count").style.display = "none";
      }

      if (items.length === 0) { showEmpty(); return; }

      var html = "";
      items.forEach(function(item) {
        var p = item.product;
        if (!p) return;
        html += '<div class="wl-card" data-product-id="' + item.productId + '">';
        html += '<div class="wl-card-img-wrap">';
        if (p.image) {
          html += '<img src="' + p.image + '&width=600" alt="' + esc(p.imageAlt || p.title) + '" loading="lazy" />';
        } else {
          html += '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f3f4f6"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>';
        }
        html += '<button class="wl-card-remove" onclick="window.__wlRemove(\\'' + item.productId + '\\',\\'' + (item.variantId||'') + '\\')" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        if (!p.available) html += '<span class="wl-badge-oos">Sold Out</span>';
        html += '</div><div class="wl-card-info">';
        if (s.showVendor && p.vendor) html += '<div class="wl-card-vendor">' + esc(p.vendor) + '</div>';
        if (s.showTitle !== false) html += '<div class="wl-card-title"><a href="/products/' + p.handle + '">' + esc(p.title) + '</a></div>';
        if (s.showPrice !== false) html += '<div class="wl-card-price">' + money(p.price, p.currency) + '</div>';
        if (s.showAddToCart !== false) {
          html += p.available
            ? '<button class="wl-card-atc" onclick="window.__wlAddCart(\\'' + item.productId + '\\',\\'' + (item.variantId||'') + '\\')">Add to Cart</button>'
            : '<button class="wl-card-atc" disabled>Sold Out</button>';
        }
        html += '</div></div>';
      });
      document.getElementById("wl-grid").innerHTML = html;
    })
    .catch(function() {
      document.getElementById("wl-grid").innerHTML = '<div class="wl-empty"><p>Could not load your wishlist. Please try again.</p></div>';
    });

  function showEmpty() {
    document.getElementById("wl-count").textContent = "0 items";
    document.getElementById("wl-grid").innerHTML =
      '<div class="wl-empty">' +
        '<svg class="wl-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
        '<h2>Your wishlist is empty</h2>' +
        '<p>Browse our collection and tap the heart icon on products you love to save them here.</p>' +
        '<a href="/collections/all" class="wl-empty-cta">Start Shopping</a>' +
      '</div>';
  }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function money(a, c) { return new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(parseFloat(a)); }
  function toast(m) { var t = document.getElementById("wl-toast"); t.textContent = m; t.classList.add("show"); setTimeout(function() { t.classList.remove("show"); }, 2500); }

  window.__wlRemove = function(pid, vid) {
    var card = document.querySelector('[data-product-id="' + pid + '"]');
    if (card) card.classList.add("removing");
    fetch(proxyUrl + "/api/wishlist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop: shop, customerId: customerId, productId: pid, variantId: vid || null, action: "remove" })
    }).then(function() {
      setTimeout(function() {
        if (card) card.remove();
        var rem = document.querySelectorAll(".wl-card").length;
        document.getElementById("wl-count").textContent = rem + " item" + (rem !== 1 ? "s" : "");
        if (rem === 0) showEmpty();
      }, 300);
      toast("Removed from wishlist");
    });
  };
  window.__wlAddCart = function(pid, vid) {
    var id = vid || pid;
    fetch("/cart/add.js", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [{ id: parseInt(id), quantity: 1 }] }) })
      .then(function(r) { return r.json(); }).then(function() { toast("Added to cart!"); }).catch(function() { toast("Could not add to cart"); });
  };
  window.__wlShare = function() {
    if (navigator.share) navigator.share({ title: "My Wishlist", url: location.href });
    else if (navigator.clipboard) { navigator.clipboard.writeText(location.href); toast("Link copied!"); }
  };
})();
</script>
`;

  return new Response(liquid, {
    headers: { "Content-Type": "application/liquid" },
  });
};
