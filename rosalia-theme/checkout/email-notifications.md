# Rosalia — transactional email branding (MD17 §3)

Everything here is Shopify admin. No theme file is involved: notification
templates live on the shop, not the theme, so they survive a theme swap.

---

## 1. Global email brand

**Settings → Notifications → Customize email templates**

| Field | Value |
|---|---|
| Logo | `rosalia-logo-primary.png` (PNG, not SVG — Outlook won't render SVG) |
| Logo width | 140px |
| Accent color | `#7A3A54` |
| Background / secondary | `#FAF5F0` |
| Button color | `#7A3A54` |

---

## 2. Order confirmation

**Settings → Notifications → Order confirmation → Edit code**

Find the block that renders the greeting — it looks like:

```liquid
<h2>Thank you for your purchase!</h2>
<p>Hi {{ customer.first_name }}, we're getting your order ready to be shipped. We will notify you when it has been sent.</p>
```

Replace those two lines with:

```html
<h1 style="font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-style: italic; color: #7A3A54; font-size: 28px; line-height: 1.2; margin: 0 0 8px;">
  Your reset is on its way.
</h1>
<p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #6B5F62; line-height: 1.55; margin: 0;">
  Hi {{ customer.first_name }} — your bottle ships within 48 hours. We'll send tracking the moment it leaves.
</p>
```

Then find the closing block, just before Shopify's own footer, and add:

```html
<p style="font-family: Georgia, 'Times New Roman', serif; font-style: italic; font-size: 14px; color: #A29596; text-align: center; margin: 32px 0 0;">
  Questions? Reply to this email — a real person reads it.
</p>
```

---

## 3. Shipping confirmation

**Settings → Notifications → Shipping confirmation → Edit code**

Same pattern:

```html
<h1 style="font-family: Georgia, 'Times New Roman', serif; font-weight: 500; font-style: italic; color: #7A3A54; font-size: 28px; line-height: 1.2; margin: 0 0 8px;">
  It's on its way.
</h1>
<p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #6B5F62; line-height: 1.55; margin: 0;">
  Your bottle is in transit. Week 1 of your reset starts the day it arrives.
</p>
```

---

## 4. Rules for editing these templates

- Never touch the Liquid variables (`{{ order.name }}`, `{{ order.line_items }}`,
  `{{ customer.first_name }}`…). Deleting one breaks the email for every order.
- No `<link rel="stylesheet">` and no web fonts — Gmail, Outlook and Yahoo strip
  them. That's why the copy above uses Georgia and the system sans stack rather
  than Cormorant and Inter.
- Inline styles only. No `<style>` block, no classes.
- Stick to `h1`, `p`, `table`, `a`, `img`. No flexbox, no grid.
- Use **Preview** then **Send test email** to a Gmail *and* an Outlook address
  before you consider it done — they render differently.

---

## 5. Order of operations

The emails inherit the global brand from step 1, so do step 1 first. If you
edit a template and then change the global brand, your edits stay — but the
surrounding chrome shifts, so re-preview.
