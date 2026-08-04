/*
 * Rosalia — purchase tracking as a Custom Pixel (MD17 §2, modern path)
 *
 * WHERE THIS GOES
 * Shopify admin → Settings → Customer events → Add custom pixel →
 * name it "Rosalia — purchase" → paste this → Save → Connect.
 *
 * WHY THIS EXISTS
 * The Order status page "Additional scripts" box has been removed on shops
 * migrated to checkout extensibility. Custom pixels are the supported
 * replacement and work on every plan, including Basic. They run in a sandbox,
 * so there is no `document` and no theme JS here — only the analytics API.
 *
 * Meta CAPI already fires server-side through the Facebook & Instagram sales
 * channel. This covers the rest: a GTM-shaped dataLayer event, TikTok, and
 * Klaviyo — each guarded so an absent library is a no-op, not an error.
 */

analytics.subscribe('checkout_completed', (event) => {
  const checkout = event.data?.checkout;
  if (!checkout) return;

  const value = checkout.totalPrice?.amount ?? 0;
  const currency = checkout.currencyCode ?? 'USD';
  const orderId = checkout.order?.id ?? checkout.token;

  const items = (checkout.lineItems ?? []).map((line) => ({
    item_id: line.variant?.product?.id,
    item_name: line.variant?.product?.title,
    item_variant: line.variant?.title,
    price: line.variant?.price?.amount,
    quantity: line.quantity,
  }));

  /* GTM-shaped event, for whenever a container gets installed */
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'purchase',
    ecommerce: { transaction_id: orderId, value, currency, items },
  });

  if (typeof ttq !== 'undefined') {
    ttq.track('Purchase', {
      value,
      currency,
      content_id: items[0]?.item_id,
      content_type: 'product',
    });
  }

  if (typeof klaviyo !== 'undefined') {
    klaviyo.push([
      'track',
      'Order Placed',
      { order_id: orderId, total_price: value, currency, items },
    ]);
  }
});
