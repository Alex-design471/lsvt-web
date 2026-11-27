-- LS_VT webshop – rendeléskezelés (Supabase / Postgres)
-- Futtatás: Supabase SQL Editor, vagy migrációként. Utána: seed_products.sql.
--
-- Biztonsági modell
--   * A látogató (anon) semmilyen táblát nem olvashat és nem írhat közvetlenül.
--   * Rendelést csak a place_order() függvénnyel lehet leadni; az árakat a függvény
--     a products / product_variants táblából számolja, a böngészőből küldött árat figyelmen kívül hagyja.
--   * A rendeléseket csak az admins táblában szereplő, bejelentkezett felhasználók látják és módosítják.

create table if not exists public.products (
  id        integer primary key,
  name      text    not null,
  price     integer not null check (price >= 0),          -- alapár, bruttó Ft
  active    boolean not null default true
);

-- Méret (és ritkán szín) szerinti eltérő ár. Üres szín = minden színre érvényes.
create table if not exists public.product_variants (
  id         bigint generated always as identity primary key,
  product_id integer not null references public.products(id) on delete cascade,
  size       text    not null,
  color      text,
  price      integer not null check (price >= 0)
);
create index if not exists product_variants_product_idx on public.product_variants(product_id);

create sequence if not exists public.order_seq start 1001;

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_no        text not null unique,
  created_at      timestamptz not null default now(),
  status          text not null default 'uj'
                  check (status in ('uj','visszaigazolva','fizetve','feladva','teljesitve','torolve')),
  customer_name   text not null,
  phone           text not null,
  email           text not null,
  shipping_method text not null,
  payment_method  text not null,
  zip             text,
  city            text,
  address         text,
  note            text,
  items           jsonb   not null,      -- [{id, name, opts, q, unit_price, line_total}]
  subtotal        integer not null,      -- termékek összesen, bruttó Ft (szállítás nélkül)
  admin_note      text
);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.admins           enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins a where a.user_id = (select auth.uid())) $$;

drop policy if exists "admin olvas rendelést" on public.orders;
create policy "admin olvas rendelést" on public.orders
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "admin módosít rendelést" on public.orders;
create policy "admin módosít rendelést" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin látja magát" on public.admins;
create policy "admin látja magát" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Rendelés leadása. Bemenet:
-- {"customer":{"name","phone","email","shipping","payment","zip","city","address","note"},
--  "items":[{"id":123,"q":2,"opts":{"Méret":"L","Szín":"01-fekete"}}]}
create or replace function public.place_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  c        jsonb := payload -> 'customer';
  it       jsonb;
  prod     record;
  qty      int;
  unit     int;
  sz       text;
  col      text;
  lines    jsonb := '[]'::jsonb;
  total    int := 0;
  no       text;
  ship     text := coalesce(c ->> 'shipping', '');
begin
  if jsonb_typeof(payload -> 'items') <> 'array'
     or jsonb_array_length(payload -> 'items') = 0
     or jsonb_array_length(payload -> 'items') > 50 then
    raise exception 'Érvénytelen kosár';
  end if;
  if length(trim(coalesce(c ->> 'name', ''))) not between 2 and 120
     or length(trim(coalesce(c ->> 'phone', ''))) not between 6 and 40
     or coalesce(c ->> 'email', '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or length(c ->> 'email') > 200 then
    raise exception 'Hiányzó vagy hibás vevőadat';
  end if;
  if ship ilike 'Házhoz%' and (coalesce(trim(c ->> 'zip'), '') = '' or coalesce(trim(c ->> 'city'), '') = ''
                               or coalesce(trim(c ->> 'address'), '') = '') then
    raise exception 'Házhoz szállításhoz add meg a teljes címet';
  end if;

  for it in select * from jsonb_array_elements(payload -> 'items') loop
    qty := coalesce((it ->> 'q')::int, 0);
    if qty < 1 or qty > 99 then raise exception 'Érvénytelen mennyiség'; end if;
    select * into prod from public.products p where p.id = (it ->> 'id')::int and p.active;
    if not found then raise exception 'Ismeretlen vagy már nem elérhető termék: %', it ->> 'id'; end if;
    sz  := it -> 'opts' ->> 'Méret';
    col := it -> 'opts' ->> 'Szín';
    select v.price into unit from public.product_variants v
      where v.product_id = prod.id and v.size = sz and (v.color is null or v.color = col)
      order by (v.color is null) limit 1;
    unit := coalesce(unit, prod.price);
    lines := lines || jsonb_build_object('id', prod.id, 'name', prod.name, 'opts', coalesce(it -> 'opts', '{}'::jsonb),
                                         'q', qty, 'unit_price', unit, 'line_total', unit * qty);
    total := total + unit * qty;
  end loop;

  no := 'LSVT-' || to_char(now() at time zone 'Europe/Budapest', 'YYMMDD') || '-' || nextval('public.order_seq');
  insert into public.orders (order_no, customer_name, phone, email, shipping_method, payment_method,
                             zip, city, address, note, items, subtotal)
  values (no, trim(c ->> 'name'), trim(c ->> 'phone'), lower(trim(c ->> 'email')), left(ship, 80),
          left(coalesce(c ->> 'payment', ''), 80), left(c ->> 'zip', 12), left(c ->> 'city', 80),
          left(c ->> 'address', 200), left(c ->> 'note', 1000), lines, total);
  return jsonb_build_object('order_no', no, 'subtotal', total, 'items', lines);
end $$;

revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.admins to authenticated;
