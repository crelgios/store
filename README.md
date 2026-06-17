# Alna's Hub - Professional Clothing E-commerce Website

This is a complete Next.js + Supabase e-commerce starter for **Alna's Hub**.

Live website URL:

```txt
https://alnascloset.com
```

It includes:

- Customer storefront
- Men and Women business attire categories
- Product search and filters
- Cart and checkout
- Cash on Delivery checkout
- Manual UPI QR checkout
- Hidden admin route
- Admin login with HTTP-only cookie session
- Product add/edit/delete
- Up to 4 product images per product
- Supabase Storage upload support
- Order saving in Supabase
- Admin order management
- Admin WhatsApp order message button
- Robots and sitemap files

## Admin URL

The admin panel is hidden from the public menu.

```txt
/aliwvide-control-7291
```

You can change it by renaming the folder:

```txt
app/aliwvide-control-7291
```

Do not add this admin URL to your navbar or sitemap.

## 1. Install Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

Admin:

```txt
http://localhost:3000/aliwvide-control-7291
```

After deployment:

```txt
https://alnascloset.com/aliwvide-control-7291
```

## 2. Supabase Setup

Create a Supabase project, then open:

```txt
Supabase Dashboard > SQL Editor
```

Paste and run:

```txt
supabase/schema.sql
```

This creates:

- `products`
- `orders`
- `order_items`
- `product-images` storage bucket

## 3. Environment Variables

Copy `.env.example` to `.env.local` locally.

For Vercel, add these in:

```txt
Vercel Project > Settings > Environment Variables
```

Required:

```txt
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_USERNAME
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
NEXT_PUBLIC_UPI_ID
NEXT_PUBLIC_SITE_URL
```

Optional:

```txt
NEXT_PUBLIC_UPI_QR_URL
DELIVERY_CHARGE
NEXT_PUBLIC_DELIVERY_CHARGE
```

## 4. Manual UPI QR Payment

For manual UPI payment:

1. Upload your QR image somewhere public, for example Supabase Storage.
2. Copy the public image URL.
3. Add it to Vercel environment variable:

```txt
NEXT_PUBLIC_UPI_QR_URL=https://your-qr-image-url
NEXT_PUBLIC_STORE_WHATSAPP_NUMBER=919876543210
```

If you leave `NEXT_PUBLIC_UPI_QR_URL` empty, the checkout will show a simple placeholder box. If `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER` is empty, the customer WhatsApp button will not appear after checkout.

## 5. Deploy to GitHub and Vercel

```bash
git init
git add .
git commit -m "Initial Alna's Hub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alnas-closet.git
git push -u origin main
```

Then import the GitHub repo into Vercel.

Build command:

```bash
npm run build
```

Output directory:

```txt
.next
```

## 6. How Orders Work

Customer flow:

```txt
Customer adds product
→ fills checkout form
→ chooses Cash on Delivery or Manual UPI
→ places order
→ order saves in Supabase
→ admin sees the new order in hidden admin panel
```

Admin can update order status:

- New Order
- Confirmed
- Packed
- Shipped
- Delivered
- Cancelled

## 7. Admin WhatsApp Order Button

Inside the hidden admin panel, every order card includes a **Send WhatsApp Message** button. It opens WhatsApp Web with a ready-made message containing:

- Customer name
- Order number
- Ordered products, quantity, size, and color
- Total amount
- Payment method
- Delivery address

This does not send automatic SMS or email. The admin manually reviews the message and sends it from WhatsApp.

## 8. Important Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
- Never commit `.env.local` to GitHub.
- Use a strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- The hidden admin URL is not security by itself. The real security is the admin login and server-side checks.
- Keep the admin route out of the navbar and sitemap.

## 9. Files You Will Commonly Edit

Homepage/storefront:

```txt
components/Storefront.jsx
```

Admin dashboard:

```txt
components/AdminDashboard.jsx
```

Site metadata:

```txt
app/layout.js
```

Supabase database:

```txt
supabase/schema.sql
```

## 10. Product Image Limit

Admin can attach maximum 4 product images per product. This is enforced in both admin UI and backend API.

## Modern Storefront Update

This version no longer keeps the full customer journey on one long homepage.

Customer pages:

- `/` — modern homepage with hero banner, category cards, and featured products
- `/products` — product listing page with search, filters, and sort options
- `/products/[slug]` — product detail page with image gallery, size/color selection, and Add to Cart
- `/checkout` — separate cart and checkout page
- `/aliwvide-control-7291` — hidden admin panel login and management route

Product images and product cards now open individual product detail pages.
Cart data is stored in the browser until checkout, then the order is saved in Supabase PostgreSQL.

## Customer stock display update

Stock quantity is intentionally visible only inside the hidden admin panel. Customer-facing product cards and product detail pages do not show stock numbers or stock labels.

## AI Store Manager: Smart Product Upload

The admin panel includes an **AI Store Manager** tab at the hidden admin route:

```txt
https://alnascloset.com/aliwvide-control-7291
```

Workflow:

```txt
Upload 1-4 raw product images
Enter price
Optional: choose gender/category/color or leave Auto
Click Generate Product Draft
Review processed images, title, description, category, price
Click Approve & Publish
```

What it does now:

- resizes product images
- centers product images on a clean white canvas
- compresses images
- converts images to WebP
- uploads processed images to Supabase Storage
- creates a title and description draft
- saves the draft in Supabase
- publishes only after admin approval

### Background removal

For real automatic background removal, add this optional Vercel environment variable:

```txt
REMOVEBG_API_KEY=your_remove_bg_api_key
```

If you do not add this key, the AI Store Manager still optimizes product images, but it will not remove the background. This fallback is included so the site still works without paid services.

### Supabase SQL update

Run the full `supabase/schema.sql` file in Supabase SQL Editor again. It now includes the `product_drafts` table used by AI Store Manager.
