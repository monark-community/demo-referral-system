# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (none are Unsplash+; each was downloaded from `images.unsplash.com`). They are resized to 2,000 px on the long edge, compressed (JPEG, q72), stored in `public/images/` and served with `next/image`. Photographers are credited on `/credits`, linked from the footer's legal line.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/invite.jpg` | https://unsplash.com/photos/aKC5r4WoLxY | SanDisk | https://unsplash.com/@sandisk | Home, "Who uses it": ambassadors; `/credits` |
| `public/images/workshop.jpg` | https://unsplash.com/photos/ovSMrhtQr_0 | Maxim Tolchinskiy | https://unsplash.com/@shaikhulud | Home, "Who uses it": student clubs; `/credits` |
| `public/images/meetup.jpg` | https://unsplash.com/photos/1-aA2Fadydc | Quilia | https://unsplash.com/@heyquilia | Home, "Who uses it": program organizers; `/credits` |

## Monark brand assets

From `lovable-migration/brand-refs/` and the [monark-community/website](https://github.com/monark-community/website) repo, used per `monark-brand-guidelines.md`:

| File | Source | Used for |
|-|-|-|
| `public/brand/monark-mark.svg`, `src/app/icon.svg` | brand-refs `logos/svg/standalone/logo-branded-standalone.svg` | Header brand, favicon, wallet prompt, connect gate, register card, OG image |
| `public/brand/monark-horizontal-{light,dark}.svg` | website `public/vectors/brand/horizontal/` | Footer Monark band |
| `public/brand/monark-vertical-{light,dark}.svg` | brand-refs `logos/svg/vertical/` | 404 page |
| `public/brand/monark-mesh.svg` | website `public/vectors/decorative/monark-mesh.svg` | Home hero only (once per site) |
| `public/brand/socials/*.svg` | website `public/vectors/socials/` | Footer social links (recoloured to `foreground` through a CSS mask) |

## Built in code

- Referral network graph (home hero and dashboard): `src/components/diagrams/network-graph.tsx`, flat orange lines and nodes, milestone rings, edge-draw and reward-dot animations.
- Trust-score gauge: `src/components/diagrams/trust-gauge.tsx`.
- Referral-record diagram (`/how-it-works`): `src/components/diagrams/record-diagram.tsx`.
- Four-step "link to reward" strip (home): line and outlined icon circles in JSX.
- QR code: `src/components/diagrams/qr-code.tsx`, encoded with `uqr`, rendered as SVG, downloadable.
- Open Graph image per locale: `src/app/[locale]/opengraph-image.tsx` (`next/og`).
- Wallet identicons: `react-jazzicon` through the `@monark/ui` `wallet` component.
- Icons: [Lucide](https://lucide.dev). Type: Nunito Sans via `next/font/google`.
