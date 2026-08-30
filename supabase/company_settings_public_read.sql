-- Run this in the Supabase SQL Editor.
--
-- The storefront reads the store name, logo, contact details, and UPI ID before
-- a visitor logs in. This policy grants anonymous visitors read-only access to
-- the single public settings record. Existing admin write policies are left
-- unchanged.

alter table public.company_settings enable row level security;

drop policy if exists "Public can view company settings" on public.company_settings;

create policy "Public can view company settings"
on public.company_settings
for select
to anon, authenticated
using (true);
