# Junxion Cafe — Kota Ordering

A lightweight, mobile-friendly ordering page for Junxion Cafe. Customers can browse the kota menu, build a cart, add order notes, and open a pre-filled order in WhatsApp. The site is static HTML, CSS, and JavaScript with no backend. Tailwind CSS is compiled locally with the Tailwind CLI.

## Features

- Eight kota options with prices and included ingredients.
- Cart quantity controls, item removal, and a live subtotal.
- Cart contents saved in the browser with `localStorage`.
- Checkout validation for an empty cart and missing customer/contact/delivery details.
- WhatsApp checkout with itemized quantities, delivery or collection, customer contact, totals, and optional notes pre-filled.
- Automatic delivery fees of R30 to Kanana and R35 to Orkney; collection has no delivery fee.
- Warm cream-and-gold styling with a five-second Ken Burns background zoom that respects reduced-motion preferences.
- Sticky delivery banner with scrolling promotional text that pauses on hover or keyboard focus.
- Responsive cart: sticky beside the menu on desktop and a toggleable drawer on smaller screens.
- Tailwind CSS v4 local build pipeline, ready to compile utilities from the page and JavaScript-rendered menu.
- An optional Python command-line utility in `Bg_remover/` for batch-removing image backgrounds.

> **Ordering note:** Checkout opens WhatsApp with a prepared message. The customer reviews and sends it in WhatsApp; the site does not process payments or submit orders to a server.

## Project files

| File or folder | Purpose |
| --- | --- |
| `src/index.html` | Menu, cart, and checkout page structure |
| `src/kota-order.css` | Page styling and responsive layout |
| `src/tailwind.css` | Tailwind CSS entry point and source configuration |
| `src/kota-order.js` | Menu data, cart behavior, persistence, and WhatsApp checkout |
| `scripts/` | Prepares the clean deployment output and copies static assets |
| `netlify.toml` | Netlify build command and publish directory |
| `dist/` | Generated deployment output; do not edit directly |
| `package.json` | Tailwind CSS build scripts and development dependencies |
| `package-lock.json` | Locked npm dependency versions |
| `Bg_remover/remove_background.py` | Optional batch image-background removal CLI |
| `images/` | Cafe logo, delivery advertisement, and page background |

## Build and run the ordering page

Install [Node.js](https://nodejs.org/) 20 or newer, then from the project folder install dependencies and build the deployable site:

```powershell
npm.cmd install
npm.cmd run build
```

The build prepares `dist/`, compiles Tailwind, and copies the HTML, custom CSS, JavaScript, and images into that directory. Tailwind scans `src/index.html` and `src/kota-order.js` through the explicit `@source` directives in `src/tailwind.css`.

To preview the production build locally, serve the `dist/` directory:

```powershell
py -m http.server 8000 --directory dist
```

If `py` is not available, use:

```powershell
python -m http.server 8000 --directory dist
```

Then open [http://localhost:8000/](http://localhost:8000/) in a browser. Keep the terminal open while testing; press `Ctrl+C` to stop the server. Re-run `npm.cmd run build` after changing source files. After building once, use `npm.cmd run watch:css` to rebuild Tailwind while editing utility classes.

## Use Tailwind

Add Tailwind utility classes to the page or JavaScript-rendered markup, then run `npm.cmd run build`. The entry point is `src/tailwind.css` and its `@source` directives keep scanning limited to `src/index.html` and `src/kota-order.js`. The generated stylesheet is written to `dist/tailwind.css`.

## Customer ordering workflow

1. Browse the menu and use **+** and **−** to choose quantities.
2. Review or adjust items in the cart. The cart is remembered in the same browser.
3. Enter a name and contact number, choose collection or delivery, and provide the full address for delivery. Preparation notes are optional.
4. Choose **Place Order via WhatsApp**.
5. Review the pre-filled message in WhatsApp and send it to complete the request.

The delivery banner also opens a WhatsApp conversation for delivery enquiries.

## Update the menu or contact number

- Edit the `MENU` list in `src/kota-order.js` to change item names, prices, or included ingredients. The displayed menu, cart, and order message use this data.
- Update `SHOP_NUMBER` in `src/kota-order.js` to change the checkout WhatsApp destination. Use international format without a leading `+`, spaces, or a local leading `0`.
- Update `DELIVERY_FEES` in `src/kota-order.js` and the matching fulfilment options in `src/index.html` if delivery prices change.
- The delivery enquiry link and its displayed delivery details are in `src/index.html`.
- Keep image files in `images/` at their referenced paths when replacing the branding or page artwork.

## Deploy on Netlify

The included `netlify.toml` configures Netlify to run `npm run build` and publish `dist/`. Connect the repository to Netlify and use the default build settings from this file; do not set the publish directory to `src/` or upload `dist/` as the source. Each deploy creates a fresh `dist/` output from the committed source files.

## Deployment

This is a static site: build it with `npm run build`, then publish the contents of `dist/` on any static web host. No server-side order handling is included.
