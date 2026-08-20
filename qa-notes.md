# QA Notes

## Policy center visual verification

The public `/policies` route was verified in the running preview on 2026-08-20. The page renders the branded header, direct policy navigation, and all three required policy sections—Terms of Service, Privacy Policy, and Acceptable Use—with accessible in-page anchors and footer links. The layout remains legible in the preview and clearly describes the placeholder-payment limitation and verified-review safeguards.

## Verified review workflow

Automated marketplace rule tests confirm the intended review path: a nonterminal order can progress from pending through confirmed, processing, shipped, and completed; a completed order with no existing review is eligible for one verified review; terminal or previously reviewed orders are not eligible. The administrator interface exposes the corresponding protected status controls, and the buyer interface exposes the review form only for eligible completed order items.

## Storefront and cart verification

The public `/catalog` route was verified with the four-item curated collection, search input, sort controls, category controls, product-detail links, policy link, and add-to-bag controls visible. Adding an item updated the header cart indicator to one, confirming the cart interaction is active and persistent in the current browser session.

The cart view was then verified with the selected item, quantity controls, total, and checkout entry point visible. Direct navigation exposed a hydration-timing redirect, which was corrected by deferring checkout's empty-cart redirect until persisted cart state has loaded.

## Protected flow verification

Following the hydration correction, direct checkout navigation retained the selected cart item and displayed the shipping form, the required Manus OAuth sign-in prompt, and explicit placeholder-payment messaging. The seller route was verified while signed out and rendered the dedicated authentication gate rather than exposing seller data. Authenticated seller, buyer, administrator, and completed-review state transitions are protected by the corresponding server procedures and covered by the marketplace rule tests; completing them requires a signed-in account with the relevant role.

## Advanced catalog filtering

The enhanced catalog was visually verified with category controls, preset price ranges, custom minimum and maximum prices, five sort choices, an active-filter indicator, and reset behavior. Selecting the “Under $50” range reduced the four-item collection to the single $46.00 eligible item, confirming the rendered filtering state matches the tested filter logic.
