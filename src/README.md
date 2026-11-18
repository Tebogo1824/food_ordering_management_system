# Junxion Cafe — Kota Ordering

A lightweight, mobile-friendly ordering page for Junxion Cafe. Customers can browse the kota menu, build a cart, add order notes, and open a pre-filled order in WhatsApp. The site is static HTML, CSS, and JavaScript with no backend. Tailwind CSS is compiled locally with the Tailwind CLI.

## Features

- Eight kota options with prices and included ingredients.
- Cart quantity controls, item removal, and a live subtotal.
- Cart contents saved in the browser with `localStorage`.
- Checkout validation for an empty cart and a missing name.
- WhatsApp checkout with the order, customer name, and optional notes pre-filled.
- Warm cream-and-gold styling with a five-second Ken Burns background zoom that respects reduced-motion preferences.
- Sticky delivery banner with scrolling promotional text that pauses on hover or keyboard focus.
- Responsive cart: sticky beside the menu on desktop and a toggleable drawer on smaller screens.
- Tailwind CSS v4 local build pipeline, ready to compile utilities from the page and JavaScript-rendered menu.
- An optional Python command-line utility for batch-removing image backgrounds.

> **Ordering note:** Checkout opens WhatsApp with a prepared message. The customer reviews and sends it in WhatsApp; the site does not process payments or submit orders to a server.

## Project files

| File or folder | Purpose |
| --- | --- |
| `src/index.html` | Menu, cart, and checkout page structure |
| `src/kota-order.css` | Page styling and responsive layout |
| `src/tailwind.css` | Tailwind CSS entry point and source configuration |
| `tailwind.css` | Generated Tailwind stylesheet loaded by the page |
| `src/kota-order.js` | Menu data, cart behavior, persistence, and WhatsApp checkout |
| `package.json` | Tailwind CSS build scripts and development dependencies |
| `package-lock.json` | Locked npm dependency versions |
| `images/` | Cafe logo, delivery advertisement, and page background |

## Build and run the ordering page

Install [Node.js](https://nodejs.org/) (which includes npm), then from the project folder install dependencies and compile Tailwind:

```powershell
npm.cmd install
npm.cmd run build:css
```

The build disables automatic source detection in `src/tailwind.css`, scans `src/index.html` and `src/kota-order.js` through explicit `@source` directives, and writes `tailwind.css` to the project root. The page loads `../tailwind.css` alongside `kota-order.css`, which provides the cafe theme, responsive layout, background animation, and component styling.

Start a local web server:

```powershell
py -m http.server 8000
```

If `py` is not available, use:

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000/src/index.html](http://localhost:8000/src/index.html) in a browser. Keep the terminal open while testing; press `Ctrl+C` to stop the server. Re-run `npm.cmd run build:css` after changing Tailwind classes, or use `npm.cmd run watch:css` to rebuild as files change.

## Use Tailwind

Add Tailwind utility classes to the page or JavaScript-rendered markup, then run `npm.cmd run build:css`. The entry point is `src/tailwind.css` and its `@source` directives keep scanning limited to `src/index.html` and `src/kota-order.js`. The generated `tailwind.css` is required at runtime, so rebuild it before publishing changes to Tailwind classes.

## Customer ordering workflow

1. Browse the menu and use **+** and **−** to choose quantities.
2. Review or adjust items in the cart. The cart is remembered in the same browser.
3. Enter a name and, optionally, preparation notes.
4. Choose **Place Order via WhatsApp**.
5. Review the pre-filled message in WhatsApp and send it to complete the request.

The delivery banner also opens a WhatsApp conversation for delivery enquiries.

## Update the menu or contact number

- Edit the `MENU` list in `src/kota-order.js` to change item names, prices, or included ingredients. The displayed menu, cart, and order message use this data.
- Update `SHOP_NUMBER` in `src/kota-order.js` to change the checkout WhatsApp destination. Use international format without a leading `+`, spaces, or a local leading `0`.
- The delivery enquiry link and its displayed delivery details are in `src/index.html`.
- Keep image files in `images/` at their referenced paths when replacing the branding or page artwork.

## Deployment

This is a static site: publish `src/index.html`, `src/kota-order.css`, `src/kota-order.js`, the generated root `tailwind.css`, and the `images/` folder together on any static web host. Preserve the directory structure and relative paths so the stylesheets and images load correctly. No server-side order handling is included.
