# Supabase project notes

The connected Supabase project was provisioned separately with the initial multi-school schema and row-level security policies. The Next.js app uses the public publishable key only. Never use a secret/service-role key in client-side code.

Expected tables: `profiles`, `districts`, `schools`, `platform_memberships`, `school_memberships`, `school_news`.

For a new installation, apply the approved database schema and RLS policies from the project's controlled migration history before connecting this frontend. The application ZIP intentionally does not replay production migrations automatically.
