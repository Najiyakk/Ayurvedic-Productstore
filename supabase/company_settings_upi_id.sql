-- Run this in the Supabase SQL Editor.
-- Adds the UPI ID field used by the Admin Settings page and storefront payment page.

alter table public.company_settings
add column if not exists upi_id text;
