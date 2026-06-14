"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  User
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { menCategories, paymentMethods, womenCategories } from "@/lib/sampleData";

const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Aliwvide Store";
const upiId = process.env.NEXT_PUBLIC_UPI_ID || "aliwvidestore@upi";
const upiQrUrl = process.env.NEXT_PUBLIC_UPI_QR_URL || "";

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [category, setCategory] = useState("All");
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    paymentMethod: "Cash on Delivery",
    upiTransactionId: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setLoadError("");
      const response = await fetch("/api/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Products could not be loaded.");
      setProducts(data.products || []);
    } catch (error) {
      setLoadError(error.message || "Products could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesGender = gender === "All" || product.gender === gender;
    const matchesCategory = category === "All" || product.category === category;
    return matchesSearch && matchesGender && matchesCategory;
  });

  const cartTotal = cart.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);
  const deliveryCharge = cart.length > 0 ? Number(process.env.NEXT_PUBLIC_DELIVERY_CHARGE || 99) : 0;
  const grandTotal = cartTotal + deliveryCharge;
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  function addToCart(product, selectedSize, selectedColor) {
    setOrderPlaced(null);
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, selectedSize, selectedColor, quantity: 1 }];
    });
  }

  function updateQuantity(productId, selectedSize, selectedColor, type) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          const isSame = item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor;
          if (!isSame) return item;
          const nextQuantity = type === "increase" ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(productId, selectedSize, selectedColor) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => !(item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
      )
    );
  }

  async function handleCheckoutSubmit(event) {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Please add at least one product to cart before checkout.");
      return;
    }

    if (!checkoutForm.fullName || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.city) {
      alert("Please fill name, phone, address, and city to place the order.");
      return;
    }

    if (checkoutForm.paymentMethod === "Manual UPI Payment" && !checkoutForm.upiTransactionId) {
      alert("Please enter the UPI transaction ID after payment.");
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            full_name: checkoutForm.fullName,
            phone: checkoutForm.phone,
            address: checkoutForm.address,
            city: checkoutForm.city
          },
          payment_method: checkoutForm.paymentMethod,
          upi_transaction_id: checkoutForm.upiTransactionId,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            selected_size: item.selectedSize,
            selected_color: item.selectedColor
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order could not be placed.");

      setOrderPlaced(data);
      setCart([]);
      setCheckoutForm({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        paymentMethod: "Cash on Delivery",
        upiTransactionId: ""
      });
    } catch (error) {
      alert(error.message || "Order could not be placed.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 text-white shadow-sm">A</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{storeName}</h1>
              <p className="hidden text-xs text-stone-500 sm:block">Professional clothing for modern work</p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-stone-700 md:flex">
            <a href="#home" className="hover:text-stone-950">Home</a>
            <a href="#men" className="hover:text-stone-950">Men</a>
            <a href="#women" className="hover:text-stone-950">Women</a>
            <a href="#products" className="hover:text-stone-950">Products</a>
            <a href="#checkout" className="hover:text-stone-950">Checkout</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="rounded-full border border-stone-200 p-2 hover:bg-stone-100" aria-label="Account">
              <User size={18} />
            </button>
            <a href="#checkout" className="relative rounded-full bg-stone-950 p-2 text-white hover:bg-stone-800" aria-label="Cart">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      <section id="home" className="bg-stone-50 px-5 py-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] bg-stone-200 shadow-2xl">
            <img
              src="/hero-aliwvide-store.png"
              alt="Aliwvide Store new collection hero banner showing modern professional clothing for men and women"
              className="block h-auto w-full object-cover"
              loading="eager"
            />
            <a
              href="#products"
              className="absolute left-[5.5%] top-[67%] hidden h-14 w-56 rounded-sm focus:outline-none focus:ring-4 focus:ring-stone-950/30 md:block"
              aria-label="Shop Aliwvide Store collection"
            />
          </div>

          <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">New Collection</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Style that speaks who you are.</h2>
              <p className="mt-2 max-w-2xl text-stone-600">
                Timeless professional outfits, premium-looking essentials, and clean everyday workwear for men and women.
              </p>
            </div>
            <a href="#products" className="inline-flex w-fit rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800">
              Shop Now
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-5 md:grid-cols-2">
          <CategoryPanel id="men" title="Men" categories={menCategories} />
          <CategoryPanel id="women" title="Women" categories={womenCategories} />
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop Professional Wear</h2>
            <p className="mt-2 text-stone-600">Use simple filters to find business-ready clothing faster.</p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-stone-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-stone-500 md:w-64"
              />
            </div>

            <select value={gender} onChange={(event) => setGender(event.target.value)} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-500">
              <option>All</option>
              <option>Men</option>
              <option>Women</option>
            </select>

            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-stone-500">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {loadError && <Alert type="error" title="Products loading issue" message={loadError} />}
        {loading ? (
          <div className="rounded-[2rem] bg-white p-10 text-center text-stone-500 shadow-sm">Loading products...</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAddToCart={addToCart} />)}
          </div>
        )}
      </section>

      <section id="checkout" className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Cart & Checkout</h2>
          <p className="mt-2 text-stone-600">Customers can check products, change quantity, and place an order.</p>
        </div>

        {orderPlaced && (
          <div className="mb-6 flex items-start gap-3 rounded-[1.5rem] border border-green-200 bg-green-50 p-5 text-green-800">
            <CheckCircle2 className="mt-1" size={22} />
            <div>
              <p className="font-bold">Order placed successfully.</p>
              <p className="mt-1 text-sm">Order ID: <strong>{orderPlaced.order_number}</strong></p>
              <p className="mt-1 text-sm">Total: <strong>{formatPrice(orderPlaced.total_amount)}</strong> • Payment: {orderPlaced.payment_method}</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-xl font-bold">Shopping Cart</h3>

            {cart.length === 0 ? (
              <div className="rounded-3xl bg-stone-50 p-8 text-center">
                <ShoppingBag className="mx-auto text-stone-400" size={42} />
                <p className="mt-4 font-semibold text-stone-800">Your cart is empty</p>
                <p className="mt-1 text-sm text-stone-500">Add products from the collection to see checkout here.</p>
                <a href="#products" className="mt-5 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800">Continue Shopping</a>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 rounded-3xl border border-stone-200 p-4">
                    <img src={item.images?.[0] || "/placeholder-product.svg"} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
                    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="mt-1 text-sm text-stone-500">{item.gender} • {item.category} • Size {item.selectedSize} • {item.selectedColor}</p>
                        <p className="mt-1 text-sm font-semibold">{formatPrice(item.price)}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, "decrease")} className="rounded-full border border-stone-200 p-2 hover:bg-stone-100" aria-label="Decrease quantity">
                          <Minus size={16} />
                        </button>
                        <span className="min-w-6 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, "increase")} className="rounded-full border border-stone-200 p-2 hover:bg-stone-100" aria-label="Increase quantity">
                          <Plus size={16} />
                        </button>
                        <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="rounded-full border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Remove item">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100"><CreditCard size={20} /></div>
              <div>
                <h3 className="text-xl font-bold">Checkout Details</h3>
                <p className="text-sm text-stone-500">Cash on Delivery or Manual UPI only</p>
              </div>
            </div>

            <div className="mb-5 rounded-3xl bg-stone-50 p-5">
              <PriceRow label="Subtotal" value={cartTotal} />
              <PriceRow label="Delivery" value={deliveryCharge} />
              <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold">
                <span>Total</span><span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <Input label="Full Name" value={checkoutForm.fullName} onChange={(value) => setCheckoutForm({ ...checkoutForm, fullName: value })} placeholder="Customer name" />
              <Input label="Phone Number" value={checkoutForm.phone} onChange={(value) => setCheckoutForm({ ...checkoutForm, phone: value })} placeholder="Mobile number" />
              <Input label="Address" value={checkoutForm.address} onChange={(value) => setCheckoutForm({ ...checkoutForm, address: value })} placeholder="House number, street, area" />
              <Input label="City" value={checkoutForm.city} onChange={(value) => setCheckoutForm({ ...checkoutForm, city: value })} placeholder="City" />
              <Select label="Payment Method" value={checkoutForm.paymentMethod} onChange={(value) => setCheckoutForm({ ...checkoutForm, paymentMethod: value, upiTransactionId: "" })} options={paymentMethods} />

              {checkoutForm.paymentMethod === "Manual UPI Payment" && (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
                  {upiQrUrl ? (
                    <img src={upiQrUrl} alt="UPI QR Code" className="mx-auto h-44 w-44 rounded-2xl bg-white object-contain p-2 shadow-sm" />
                  ) : (
                    <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-stone-500 shadow-sm">UPI QR Code</div>
                  )}
                  <p className="mt-4 font-semibold text-stone-800">Scan and pay manually</p>
                  <p className="mt-1 text-sm text-stone-500">UPI ID: {upiId}</p>
                  <div className="mt-4 text-left">
                    <Input label="UPI Transaction ID" value={checkoutForm.upiTransactionId} onChange={(value) => setCheckoutForm({ ...checkoutForm, upiTransactionId: value })} placeholder="Enter UPI reference/transaction ID" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={checkoutLoading} className="w-full rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60">
                {checkoutLoading ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white px-5 py-8 text-center text-sm text-stone-500">© 2026 {storeName}. All rights reserved.</footer>
    </main>
  );
}

function CategoryPanel({ id, title, categories }) {
  return (
    <div id={id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-stone-600">Professional categories designed for easy browsing.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {categories.map((category) => <a href="#products" key={category} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left font-medium hover:border-stone-400 hover:bg-white">{category}</a>)}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "Free Size");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "Default");

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
      <div className="relative h-72 overflow-hidden bg-stone-100">
        <img src={product.images?.[0] || "/placeholder-product.svg"} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <button className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-sm" aria-label="Wishlist"><Heart size={18} /></button>
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">{product.gender}</span>
          <span className="text-xs text-stone-500">{product.category}</span>
        </div>
        <h3 className="font-bold leading-snug">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
            {(product.sizes?.length ? product.sizes : ["Free Size"]).map((size) => <option key={size}>{size}</option>)}
          </select>
          <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
            {(product.colors?.length ? product.colors : ["Default"]).map((color) => <option key={color}>{color}</option>)}
          </select>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold">{formatPrice(product.price)}</p>
            {product.compare_at_price ? <p className="text-xs text-stone-400 line-through">{formatPrice(product.compare_at_price)}</p> : null}
          </div>
          <button onClick={() => onAddToCart(product, selectedSize, selectedColor)} className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">Add</button>
        </div>
      </div>
    </article>
  );
}

function Alert({ title, message, type = "info" }) {
  const styles = type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-stone-200 bg-white text-stone-700";
  return <div className={`mb-5 rounded-2xl border p-4 text-sm ${styles}`}><strong>{title}</strong><p className="mt-1">{message}</p></div>;
}

function PriceRow({ label, value }) {
  return <div className="mt-3 flex justify-between text-sm first:mt-0"><span>{label}</span><span className="font-semibold">{formatPrice(value)}</span></div>;
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
