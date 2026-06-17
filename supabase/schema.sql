-- Alna's Hub Supabase Schema
-- Run this full file in Supabase SQL Editor.
-- Safe to run multiple times. It creates/updates tables and adds missing columns.

create extension if not exists "pgcrypto";

-- =========================
-- Live Products
-- =========================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid()
);

alter table public.products add column if not exists name text;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists gender text default 'Women';
alter table public.products add column if not exists category text default 'Suits';
alter table public.products add column if not exists description text default '';
alter table public.products add column if not exists price numeric(10,2) default 0;
alter table public.products add column if not exists compare_at_price numeric(10,2);
alter table public.products add column if not exists sizes text[] default '{}';
alter table public.products add column if not exists colors text[] default '{}';
alter table public.products add column if not exists images text[] default '{}';
alter table public.products add column if not exists stock integer default 0;
alter table public.products add column if not exists status text default 'published';
alter table public.products add column if not exists created_at timestamptz default now();
alter table public.products add column if not exists updated_at timestamptz default now();

create unique index if not exists products_slug_unique_idx on public.products(slug) where slug is not null;
create index if not exists products_status_created_at_idx on public.products(status, created_at desc);
create index if not exists products_gender_category_idx on public.products(gender, category);

-- =========================
-- Orders
-- =========================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid()
);

alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists customer_address text;
alter table public.orders add column if not exists customer_city text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists payment_status text default 'Pending';
alter table public.orders add column if not exists upi_transaction_id text;
alter table public.orders add column if not exists order_status text default 'New Order';
alter table public.orders add column if not exists subtotal numeric(10,2) default 0;
alter table public.orders add column if not exists delivery_charge numeric(10,2) default 0;
alter table public.orders add column if not exists total_amount numeric(10,2) default 0;
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists updated_at timestamptz default now();

create unique index if not exists orders_order_number_unique_idx on public.orders(order_number) where order_number is not null;
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(order_status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid()
);

alter table public.order_items add column if not exists order_id uuid references public.orders(id) on delete cascade;
alter table public.order_items add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.order_items add column if not exists product_name text;
alter table public.order_items add column if not exists selected_size text;
alter table public.order_items add column if not exists selected_color text;
alter table public.order_items add column if not exists unit_price numeric(10,2) default 0;
alter table public.order_items add column if not exists quantity integer default 1;
alter table public.order_items add column if not exists line_total numeric(10,2) default 0;
alter table public.order_items add column if not exists product_snapshot jsonb default '{}'::jsonb;
alter table public.order_items add column if not exists created_at timestamptz default now();

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- =========================
-- AI Store Manager Drafts
-- =========================
create table if not exists public.product_drafts (
  id uuid primary key default gen_random_uuid()
);

alter table public.product_drafts add column if not exists title text;
alter table public.product_drafts add column if not exists slug text;
alter table public.product_drafts add column if not exists description text default '';
alter table public.product_drafts add column if not exists gender text default 'Women';
alter table public.product_drafts add column if not exists category text default 'Suits';
alter table public.product_drafts add column if not exists product_type text;
alter table public.product_drafts add column if not exists color text;
alter table public.product_drafts add column if not exists colors text[] default '{}';
alter table public.product_drafts add column if not exists size text;
alter table public.product_drafts add column if not exists sizes text[] default '{}';
alter table public.product_drafts add column if not exists tags text[] default '{}';
alter table public.product_drafts add column if not exists price numeric(10,2) default 0;
alter table public.product_drafts add column if not exists stock integer default 0;
alter table public.product_drafts add column if not exists status text default 'draft_ready';
alter table public.product_drafts add column if not exists image_url text;
alter table public.product_drafts add column if not exists image_urls text[] default '{}';
alter table public.product_drafts add column if not exists image_path text;
alter table public.product_drafts add column if not exists image_paths text[] default '{}';
alter table public.product_drafts add column if not exists images text[] default '{}';
alter table public.product_drafts add column if not exists product_images jsonb default '[]'::jsonb;
alter table public.product_drafts add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.product_drafts add column if not exists raw_input jsonb default '{}'::jsonb;
alter table public.product_drafts add column if not exists processing_note text;
alter table public.product_drafts add column if not exists error_message text;
alter table public.product_drafts add column if not exists ai_notes text;
alter table public.product_drafts add column if not exists published_product_id uuid references public.products(id) on delete set null;
alter table public.product_drafts add column if not exists created_at timestamptz default now();
alter table public.product_drafts add column if not exists updated_at timestamptz default now();

create table if not exists public.product_draft_images (
  id uuid primary key default gen_random_uuid()
);

alter table public.product_draft_images add column if not exists draft_id uuid references public.product_drafts(id) on delete cascade;
alter table public.product_draft_images add column if not exists image_url text;
alter table public.product_draft_images add column if not exists image_path text;
alter table public.product_draft_images add column if not exists sort_order integer default 0;
alter table public.product_draft_images add column if not exists created_at timestamptz default now();

create index if not exists product_drafts_status_created_at_idx on public.product_drafts(status, created_at desc);
create index if not exists product_draft_images_draft_id_idx on public.product_draft_images(draft_id);

-- =========================
-- RLS + Service Role Policies
-- =========================
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_drafts enable row level security;
alter table public.product_draft_images enable row level security;

drop policy if exists "Service role can manage products" on public.products;
create policy "Service role can manage products" on public.products for all using (true) with check (true);

drop policy if exists "Service role can manage orders" on public.orders;
create policy "Service role can manage orders" on public.orders for all using (true) with check (true);

drop policy if exists "Service role can manage order items" on public.order_items;
create policy "Service role can manage order items" on public.order_items for all using (true) with check (true);

drop policy if exists "Service role can manage product drafts" on public.product_drafts;
create policy "Service role can manage product drafts" on public.product_drafts for all using (true) with check (true);

drop policy if exists "Service role can manage product draft images" on public.product_draft_images;
create policy "Service role can manage product draft images" on public.product_draft_images for all using (true) with check (true);

-- =========================
-- Storage Bucket
-- =========================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- =========================
-- Demo Products
-- =========================
insert into public.products
(name, slug, gender, category, description, price, compare_at_price, sizes, colors, images, stock, status)
values
('Men''s Classic Navy Suit', 'mens-classic-navy-suit', 'Men', 'Suits', 'A polished suit designed for office meetings, formal events, and business occasions.', 4999, 5999, array['M','L','XL'], array['Navy'], array['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=900&q=80'], 15, 'published'),
('Women''s Formal Suit Set', 'womens-formal-suit-set', 'Women', 'Suits', 'A clean professional suit set for work, interviews, and formal business styling.', 4299, 5299, array['S','M','L'], array['Black'], array['https://images.unsplash.com/photo-1520975682031-a0655ad01e8d?auto=format&fit=crop&w=900&q=80'], 12, 'published'),
('Office Fit Blazer', 'office-fit-blazer', 'Women', 'Blazers', 'A versatile blazer that works well with trousers, skirts, and dresses.', 2499, 2999, array['S','M','L','XL'], array['Beige'], array['https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=900&q=80'], 20, 'published'),
('Slim Business Trouser', 'slim-business-trouser', 'Men', 'Trousers', 'Comfortable formal trousers for daily office wear and professional use.', 1599, 1999, array['M','L','XL'], array['Charcoal'], array['https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80'], 30, 'published'),
('Rose Gold Chikankari Lawn Suit', 'rose-gold-chikankari-lawn-suit', 'Women', 'Suits', 'Soft rose gold lawn suit with chikankari-style embroidery and a light dupatta for daily elegance.', 2199, 3599, array['XS','S','M','L','XL'], array['Rose Gold','Cream'], array['/suits/pastel-pink-suit.jpg'], 18, 'published'),
('Navy Blue Mirror Work Suit Set', 'navy-blue-mirror-work-suit-set', 'Women', 'Suits', 'Navy blue suit with mirror work inspired detailing, perfect for evening gatherings and festive wear.', 2999, 4799, array['S','M','L','XL','XXL'], array['Navy Blue','Silver'], array['/suits/black-party-suit.jpg'], 11, 'published'),
('Mint Green Printed Lawn Suit', 'mint-green-printed-lawn-suit', 'Women', 'Suits', 'Fresh mint green printed lawn suit with a breezy dupatta for summer, casual outings, and comfortable styling.', 1899, 2999, array['XS','S','M','L','XL'], array['Mint Green','White'], array['/suits/sage-lawn-suit.jpg'], 22, 'published'),
('Royal Blue Embroidered Straight Suit', 'royal-blue-embroidered-straight-suit', 'Women', 'Suits', 'Royal blue straight suit with neat embroidery and a graceful dupatta for semi-formal and festive occasions.', 2799, 4499, array['S','M','L','XL'], array['Royal Blue'], array['/suits/lavender-suit.jpg'], 14, 'published'),
('Peach Organza Festive Suit Set', 'peach-organza-festive-suit-set', 'Women', 'Suits', 'Peach festive suit set with organza-style dupatta and delicate embroidery for family functions and celebrations.', 3199, 5199, array['S','M','L','XL','XXL'], array['Peach','Gold'], array['/suits/ivory-straight-suit.jpg'], 9, 'published'),
('Teal Green Palazzo Suit Set', 'teal-green-palazzo-suit-set', 'Women', 'Suits', 'Teal green palazzo suit set with a comfortable fit, embroidered accents, and a matching dupatta.', 2599, 3999, array['S','M','L','XL'], array['Teal Green'], array['/suits/maroon-palazzo-suit.jpg'], 13, 'published'),
('White Cotton Daily Wear Suit', 'white-cotton-daily-wear-suit', 'Women', 'Suits', 'Clean white cotton suit set made for simple everyday comfort with a soft dupatta and easy styling.', 1699, 2599, array['XS','S','M','L','XL','XXL'], array['White','Ivory'], array['/suits/ivory-straight-suit.jpg'], 25, 'published'),
('Mustard Yellow Anarkali Suit', 'mustard-yellow-anarkali-suit', 'Women', 'Suits', 'Bright mustard yellow anarkali suit with festive embroidery and a flowy silhouette for a standout ethnic look.', 2899, 4599, array['S','M','L','XL'], array['Mustard Yellow'], array['/suits/yellow-anarkali.jpg'], 10, 'published'),
('Wine Red Embroidered Sharara Suit', 'wine-red-embroidered-sharara-suit', 'Women', 'Suits', 'Wine red sharara suit with rich embroidery, designed for weddings, parties, and special festive nights.', 3499, 5999, array['S','M','L','XL','XXL'], array['Wine Red','Maroon'], array['/suits/maroon-palazzo-suit.jpg'], 7, 'published'),
('Sky Blue Printed Suit', 'sky-blue-printed-suit', 'Women', 'Suits', 'Sky blue printed suit with a soft look and relaxed fit for day events and comfortable wear.', 1999, 3199, array['XS','S','M','L','XL'], array['Sky Blue','White'], array['/suits/lavender-suit.jpg'], 19, 'published'),
('Olive Green Embroidered Suit Set', 'olive-green-embroidered-suit-set', 'Women', 'Suits', 'Olive green embroidered suit set with classic styling and a matching dupatta for elegant everyday dressing.', 2399, 3799, array['S','M','L','XL','XXL'], array['Olive Green'], array['/suits/sage-lawn-suit.jpg'], 16, 'published'),
('Beige Thread Work Straight Suit', 'beige-thread-work-straight-suit', 'Women', 'Suits', 'Beige straight suit with subtle thread work, ideal for office, casual occasions, and graceful modest styling.', 2299, 3499, array['XS','S','M','L','XL'], array['Beige','Cream'], array['/suits/ivory-straight-suit.jpg'], 20, 'published'),
('Black Gold Embroidered Suit Set', 'black-gold-embroidered-suit-set', 'Women', 'Suits', 'Black suit set with gold embroidery details for party wear, festive evenings, and elegant occasions.', 3399, 5499, array['S','M','L','XL'], array['Black','Gold'], array['/suits/black-party-suit.jpg'], 8, 'published'),
('Coral Pink Lawn Suit With Dupatta', 'coral-pink-lawn-suit-with-dupatta', 'Women', 'Suits', 'Coral pink lawn suit with soft embroidery and dupatta, made for a fresh feminine everyday look.', 2099, 3299, array['XS','S','M','L','XL'], array['Coral Pink','Peach'], array['/suits/pastel-pink-suit.jpg'], 17, 'published'),
('Emerald Green Festive Suit Set', 'emerald-green-festive-suit-set', 'Women', 'Suits', 'Emerald green festive suit with detailed accents and a polished finish for parties and family events.', 3299, 5299, array['S','M','L','XL','XXL'], array['Emerald Green'], array['/suits/sage-lawn-suit.jpg'], 9, 'published'),
('Lilac Embroidered Cotton Suit', 'lilac-embroidered-cotton-suit', 'Women', 'Suits', 'Lilac cotton suit with refined embroidery and a comfortable fit for semi-formal and casual wear.', 2199, 3499, array['XS','S','M','L','XL'], array['Lilac','Lavender'], array['/suits/lavender-suit.jpg'], 15, 'published'),
('Rust Orange Suit Set', 'rust-orange-suit-set', 'Women', 'Suits', 'Rust orange suit set with ethnic charm and a flattering fit for festive daytime occasions.', 2599, 4099, array['S','M','L','XL'], array['Rust Orange'], array['/suits/yellow-anarkali.jpg'], 12, 'published'),
('Cream Zari Work Suit Set', 'cream-zari-work-suit-set', 'Women', 'Suits', 'Cream suit set with zari-style detailing and a graceful dupatta for elegant traditional dressing.', 2999, 4799, array['S','M','L','XL','XXL'], array['Cream','Gold'], array['/suits/ivory-straight-suit.jpg'], 10, 'published'),
('Magenta Party Wear Suit', 'magenta-party-wear-suit', 'Women', 'Suits', 'Magenta party wear suit with festive embroidery and a bold color look for celebrations and special events.', 3199, 4999, array['S','M','L','XL'], array['Magenta','Pink'], array['/suits/maroon-palazzo-suit.jpg'], 8, 'published'),
('Aqua Blue Casual Lawn Suit', 'aqua-blue-casual-lawn-suit', 'Women', 'Suits', 'Aqua blue casual lawn suit made for light comfort, easy movement, and simple everyday ethnic style.', 1799, 2899, array['XS','S','M','L','XL','XXL'], array['Aqua Blue'], array['/suits/sage-lawn-suit.jpg'], 24, 'published')
on conflict (slug) do nothing;

notify pgrst, 'reload schema';
