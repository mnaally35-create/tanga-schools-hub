# TANGA SCHOOLS HUB

A Next.js + Supabase web platform foundation for a verified directory of secondary schools in Tanga Region, Tanzania. The project is structured for GitHub → Vercel continuous deployment and includes a PWA install foundation.

## Included in this package

- Public homepage with verified school directory search and ownership filters
- Public verified school profile pages
- School administrator account registration and login
- Authenticated school dashboard and school profile submission workflow
- Platform administrator verification screen (`/admin`)
- School news feed (reads published items from Supabase)
- Supabase browser and server clients using `@supabase/ssr`
- PWA manifest, icons and service worker foundation
- Responsive layout for desktop and mobile

## Requirements

- Node.js LTS (Node 22 LTS is recommended)
- npm
- Supabase project with the TANGA SCHOOLS HUB schema already applied

## 1. Configure environment variables

A ready-to-use `.env.local` for the connected TANGA SCHOOLS HUB Supabase project is included in this ZIP for local development. It contains only the public publishable key, not a secret/service-role key. Keep it local; `.gitignore` excludes it from GitHub. For Vercel, add the same two variable names in Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Never put a Supabase secret/service-role key in a browser environment variable or commit `.env.local` to GitHub. `.gitignore` already excludes local environment files.

## 2. Install and run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Before deployment, run:

```bash
npm run build
```

## 3. Supabase database requirements

This application expects the database tables and policies created for this project:

- `profiles`
- `districts`
- `schools`
- `platform_memberships`
- `school_memberships`
- `school_news`

It also expects the `schools` fields used by the app (`name`, `slug`, `school_type`, `registration_number`, `district_id`, `ward`, `address`, `description`, `phone`, `email`, `website`, `logo_url`, `status`, `created_by`, `verified_at`, `verified_by`) and the membership/news relationships.

The connected Supabase project has already been provisioned. The reference schema migration is included under `supabase/migrations/` for documentation/reproducibility on a fresh project only. Do not run it against the already-provisioned production project.

### Important admin setup

For security, the public registration flow does not grant anyone platform-admin privileges. Create the first trusted super administrator manually from Supabase SQL Editor after the administrator has registered and confirmed their account:

```sql
-- Replace the email with the confirmed administrator email.
insert into public.platform_memberships (user_id, role)
select id, 'super_admin'::public.platform_role
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict do nothing;
```

The admin then signs in and opens `/admin` to approve or reject submitted schools. Keep super-admin access restricted to trusted staff.

## 4. Email authentication setup

In Supabase Authentication → URL Configuration:

- Set Site URL to your production Vercel URL after deployment.
- Add `http://localhost:3000/auth/callback` to Redirect URLs for local testing.
- Add `https://YOUR-VERCEL-DOMAIN/auth/callback` to Redirect URLs after deployment.

If email confirmation is enabled, a new user must confirm their email before signing in. The school profile is submitted from the dashboard after sign-in.

## 5. Deploy with GitHub and Vercel

1. Create a **private** GitHub repository named `tanga-schools-hub`.
2. Extract this ZIP and open the extracted project folder in VS Code.
3. Create `.env.local` locally (do not commit it).
4. In the VS Code terminal run:

```bash
npm install
git init
git add .
git commit -m "Initial Tanga Schools Hub release"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/tanga-schools-hub.git
git push -u origin main
```

5. In Vercel choose Add New → Project and import the GitHub repository.
6. Add these Environment Variables in Vercel for Production, Preview and Development:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
7. Deploy. Future pushes to the connected branch will trigger Vercel deployments automatically.

## 6. Normal update workflow

Edit files in VS Code, then:

```bash
git add .
git commit -m "Describe your change"
git push
```

Vercel will build and deploy the new commit automatically. If the build fails, Vercel keeps the previous successful deployment available.

## Notes and current scope

This is a functional first release foundation, not a claim that every planned future module is complete. This release has no payment collection, subscriptions, paid listings, or paid tiers. All school directory participation is free for now. Student records, examination results, advanced analytics, bulk school imports, document workflows, messaging, and a full regional/district administration suite are future phases. School directory records are public only after a platform administrator verifies them. District names should be loaded from an authoritative, confirmed administrative list before launch.
