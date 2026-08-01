# GiftShop — Starter Scaffold

A working starting point for your gift e-commerce platform: Next.js 14 (App Router) +
TypeScript + Tailwind + Prisma + PostgreSQL + NextAuth (JWT credentials).

What's already wired up:
- Home, Shop (with search), Product Detail, Login, Register pages
- Registration API with bcrypt password hashing + Zod validation
- Login via NextAuth credentials provider, JWT sessions
- Prisma schema covering Users, Roles, Vendors, Products, Categories, Product Images,
  Orders, Order Items, Payments, Addresses, Coupons, Reviews, Wishlist, Cart
- Seed script with an admin user and two sample products

---

## Step 1 — Install prerequisites

- **Node.js 20 LTS** — https://nodejs.org
- **PostgreSQL** — either install locally, or use a free hosted instance (Railway,
  Render, Neon, or Supabase all work — Neon's free tier is the easiest to start with)
- **VS Code** with these extensions: `Prisma`, `ESLint`, `Tailwind CSS IntelliSense`

## Step 2 — Open the project in VS Code

1. Unzip the project and open the folder in VS Code (`File > Open Folder`).
2. Open the built-in terminal: `` Ctrl+` `` (Windows/Linux) or `` Cmd+` `` (Mac).

## Step 3 — Install dependencies

```bash
npm install
```

## Step 4 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:
- `DATABASE_URL` → your PostgreSQL connection string
- `NEXTAUTH_SECRET` → run `openssl rand -base64 32` and paste the output
  (on Windows, use `npx auth secret` or an online random string generator instead)

## Step 5 — Create the database tables

```bash
npx prisma migrate dev --name init
```

This reads `prisma/schema.prisma` and creates every table in your Postgres database.

## Step 6 — Seed sample data

```bash
npm run seed
```

Creates an admin user (`admin@giftshop.com` / `Admin123!`) and two sample products.

## Step 7 — Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 — you should see the home page. Visit `/shop` to see the
seeded products, `/register` to create a customer account, `/login` to sign in.

## Step 8 — Explore the database visually (optional but recommended)

```bash
npx prisma studio
```

Opens a GUI at http://localhost:5555 where you can browse/edit every table.

---

## Where to go from here (in order)

This scaffold covers the beginning of Phase 9 from your plan (repo, frontend,
backend, DB, auth). Build the rest in this order — each step is small enough to
finish and test in a day or two:

1. **Cart** — add a `POST /api/cart` route + a cart page reading `CartItem` for the
   logged-in user. Use `useSession()` from `next-auth/react` to get the current user.
2. **Checkout + Stripe** — install `stripe`, create a checkout API route that creates
   a Stripe Checkout Session from the user's cart, and a webhook route that marks the
   `Order` as `PAID` on success. (Add PayHere/WebxPay as a second payment option later
   for Sri Lanka — same pattern, different provider.)
3. **Order history + tracking** — `/orders` page reading `Order` + `OrderItem` for
   the logged-in user.
4. **Product images via Cloudinary** — install `cloudinary`, add an upload route,
   use it in the admin product form.
5. **Admin dashboard** — a `/admin` route group, protected by checking
   `session.user.role === "ADMIN"` in a layout, with CRUD forms for Product/Category.
6. **Reviews, Wishlist** — straightforward CRUD against the models already in the
   schema.
7. **Search/filter refinement, pagination** — the `/api/products` route already
   supports `?q=` and `?category=` and pagination; wire the shop page to use it
   instead of querying Prisma directly, once you add client-side filters.
8. **Security hardening** (Phase 6) — rate limiting (`@upstash/ratelimit` if using
   Redis), CSRF (NextAuth handles this for its own routes), input validation with Zod
   on every route (already the pattern in `register/route.ts`), secure cookies
   (NextAuth sets these by default in production over HTTPS).
9. **Performance** (Phase 7) — this scaffold already uses server components (SSR) for
   Shop/Product pages, `next/image` config for Cloudinary, and Prisma indexing via
   `@unique`/`@id`. Add explicit `@@index` on frequently filtered columns
   (e.g. `Product.categoryId`) as the catalog grows.
10. **Vendor portal, AI gift recommendations, loyalty/referral** (Phase 8) — build
    these last, after the core store is functional and live.

## Deployment (Phase 2)

- **Frontend + API**: push to GitHub, import into Vercel, set the same env vars there.
- **Database**: Railway, Render, or a managed Postgres (Neon/Supabase) — copy the
  connection string into Vercel's `DATABASE_URL`.
- Run `npx prisma migrate deploy` (not `migrate dev`) against production on each
  release.
