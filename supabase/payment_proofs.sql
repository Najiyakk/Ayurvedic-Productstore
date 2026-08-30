-- Run this once in the Supabase SQL Editor.
alter table public.orders
add column if not exists payment_proof_url text;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

drop policy if exists "Customers can upload payment proofs" on storage.objects;
create policy "Customers can upload payment proofs"
on storage.objects for insert
to authenticated
with check (bucket_id = 'payment-proofs');

drop policy if exists "Anyone can view payment proofs" on storage.objects;
create policy "Anyone can view payment proofs"
on storage.objects for select
to public
using (bucket_id = 'payment-proofs');