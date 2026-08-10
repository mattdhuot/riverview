# Riverview Silage Dashboard

An at-a-glance corn silage planning dashboard prepared by Domnick Seeds for Riverview's West River Dairy near Morris, Minnesota.

The dashboard combines field-specific planting dates and hybrid GDU-to-black-layer requirements with:

- observed corn GDUs from Morris Municipal Airport;
- a rolling 14-day temperature forecast;
- historical daily GDU normals beyond the forecast window; and
- a planning target of black-layer GDU minus 300 for beginning whole-plant moisture checks.

Projected dates establish a field-checking order. Whole-plant moisture and field conditions should always be confirmed before chopping.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Verify

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Deploy

Import this repository into Vercel. Vercel detects the Next.js application and uses the default build settings.
