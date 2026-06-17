"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  ImagePlus,
  Lock,
  LogOut,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Package,
  Plus,
  RefreshCcw,
  Save,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  Upload
} from "lucide-react";
import { formatPrice, parseList } from "@/lib/format";
import { orderStatuses } from "@/lib/sampleData";

const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alnascloset.com";

const emptySmartUploadForm = {
  price: "",
  gender: "Auto",
  category: "Auto",
  color: "Auto",
  sizes: "S, M, L",
  stock: "10",
  notes: "",
  images: []
};

const emptyProductForm = {
  id: "",
  name: "",
  gender: "Women",
  category: "Suits",
  description: "",
  price: "",
  compare_at_price: "",
  sizes: "S, M, L",
  colors: "Black",
  stock: "10",
  status: "published",
  images: []
};

export default function AdminDashboard() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [smartUploadForm, setSmartUploadForm] = useState(emptySmartUploadForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [publishingDraft, setPublishingDraft] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadProducts();
      loadOrders();
      loadDrafts();
    }
  }, [authenticated]);

  const stats = useMemo(() => {
    const newOrders = orders.filter((order) => order.order_status === "New Order").length;
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const readyDrafts = drafts.filter((draft) => draft.status === "draft_ready").length;
    return { products: products.length, orders: orders.length, newOrders, totalSales, readyDrafts };
  }, [products, orders, drafts]);

  async function checkSession() {
    try {
      const response = await fetch("/api/admin/me", { cache: "no-store" });
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
    } catch {
      setAuthenticated(false);
    } finally {
      setChecking(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");
      setAuthenticated(true);
      setLoginForm({ username: "", password: "" });
    } catch (error) {
      setLoginError(error.message || "Login failed.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
  }

  async function loadProducts() {
    try {
      setError("");
      const response = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load products.");
      setProducts(data.products || []);
    } catch (error) {
      setError(error.message || "Could not load products.");
    }
  }

  async function loadOrders() {
    try {
      setError("");
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load orders.");
      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message || "Could not load orders.");
    }
  }

  async function loadDrafts() {
    try {
      setError("");
      const response = await fetch("/api/admin/ai-manager/drafts", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load AI product drafts.");
      setDrafts(data.drafts || []);
    } catch (error) {
      setError(error.message || "Could not load AI product drafts.");
    }
  }

  async function generateSmartDraft(event) {
    event.preventDefault();

    if (!smartUploadForm.price || Number(smartUploadForm.price) <= 0) {
      alert("Please enter the product price.");
      return;
    }

    if (smartUploadForm.images.length === 0) {
      alert("Please upload at least one raw product image.");
      return;
    }

    if (smartUploadForm.images.length > 4) {
      alert("Maximum 4 product images are allowed.");
      return;
    }

    const formData = new FormData();
    smartUploadForm.images.forEach((file) => formData.append("images", file));
    formData.append("price", smartUploadForm.price);
    formData.append("gender", smartUploadForm.gender);
    formData.append("category", smartUploadForm.category);
    formData.append("color", smartUploadForm.color);
    formData.append("sizes", smartUploadForm.sizes);
    formData.append("stock", smartUploadForm.stock);
    formData.append("notes", smartUploadForm.notes);

    try {
      setGeneratingDraft(true);
      setMessage("");
      setError("");
      const response = await fetch("/api/admin/ai-manager/generate-draft", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI Store Manager could not create draft.");

      setSmartUploadForm(emptySmartUploadForm);
      setMessage("AI Store Manager created a product draft. Review it below before publishing.");
      await loadDrafts();
    } catch (error) {
      setError(error.message || "AI Store Manager could not create draft.");
    } finally {
      setGeneratingDraft(false);
    }
  }

  async function publishDraft(draftId) {
    try {
      setPublishingDraft(draftId);
      setMessage("");
      setError("");
      const response = await fetch(`/api/admin/ai-manager/drafts/${draftId}/publish`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Draft could not be published.");

      setMessage("Product published successfully from AI Store Manager draft.");
      await loadDrafts();
      await loadProducts();
    } catch (error) {
      setError(error.message || "Draft could not be published.");
    } finally {
      setPublishingDraft("");
    }
  }

  async function rejectDraft(draftId) {
    if (!confirm("Reject this AI product draft?")) return;

    try {
      setPublishingDraft(draftId);
      setMessage("");
      setError("");
      const response = await fetch(`/api/admin/ai-manager/drafts/${draftId}/reject`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Draft could not be rejected.");

      setMessage("Draft rejected.");
      await loadDrafts();
    } catch (error) {
      setError(error.message || "Draft could not be rejected.");
    } finally {
      setPublishingDraft("");
    }
  }

  function editDraftInForm(draft) {
    setProductForm({
      id: "",
      name: draft.title || "",
      gender: draft.gender || "Women",
      category: draft.category || "Suits",
      description: draft.description || "",
      price: draft.price || "",
      compare_at_price: "",
      sizes: Array.isArray(draft.sizes) ? draft.sizes.join(", ") : "S, M, L",
      colors: Array.isArray(draft.colors) ? draft.colors.join(", ") : "Black",
      stock: draft.stock || "10",
      status: "published",
      images: Array.isArray(draft.images) ? draft.images : []
    });
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImages(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length + productForm.images.length > 4) {
      alert("Maximum 4 images are allowed for one product.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      setUploading(true);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      setProductForm((current) => ({ ...current, images: [...current.images, ...(data.urls || [])].slice(0, 4) }));
    } catch (error) {
      alert(error.message || "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function removeImage(index) {
    setProductForm((current) => ({ ...current, images: current.images.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function editProduct(product) {
    setProductForm({
      id: product.id,
      name: product.name || "",
      gender: product.gender || "Women",
      category: product.category || "Suits",
      description: product.description || "",
      price: product.price || "",
      compare_at_price: product.compare_at_price || "",
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
      stock: product.stock || "0",
      status: product.status || "published",
      images: Array.isArray(product.images) ? product.images : []
    });
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...productForm,
        sizes: parseList(productForm.sizes),
        colors: parseList(productForm.colors),
        price: Number(productForm.price),
        compare_at_price: productForm.compare_at_price ? Number(productForm.compare_at_price) : null,
        stock: Number(productForm.stock || 0),
        images: productForm.images.slice(0, 4)
      };

      const isEditing = Boolean(productForm.id);
      const response = await fetch(isEditing ? `/api/admin/products/${productForm.id}` : "/api/admin/products", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product could not be saved.");

      setProductForm(emptyProductForm);
      setMessage(isEditing ? "Product updated successfully." : "Product added successfully.");
      await loadProducts();
    } catch (error) {
      setError(error.message || "Product could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(productId) {
    if (!confirm("Delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product could not be deleted.");
      await loadProducts();
    } catch (error) {
      alert(error.message || "Product could not be deleted.");
    }
  }

  async function updateOrder(orderId, orderStatus) {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: orderStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Order could not be updated.");
      setOrders((current) => current.map((order) => (order.id === orderId ? data.order : order)));
    } catch (error) {
      alert(error.message || "Order could not be updated.");
    }
  }

  async function clearOrders() {
    if (!orders.length) {
      alert("There are no orders to clear.");
      return;
    }

    if (!confirm("Clear all orders and sales totals from the admin panel? This will delete saved orders from Supabase and cannot be undone.")) return;

    try {
      setMessage("");
      setError("");
      const response = await fetch("/api/admin/orders", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Orders could not be cleared.");
      setOrders([]);
      setMessage("Orders and sales totals cleared successfully.");
    } catch (error) {
      setError(error.message || "Orders could not be cleared.");
    }
  }

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-stone-950 text-white">Checking admin session...</main>;
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-950 px-5 text-stone-950">
        <form onSubmit={handleLogin} className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-950 text-white"><Lock size={24} /></div>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight">Admin Login</h1>
          <p className="mt-2 text-center text-sm text-stone-500">Private product and order management for Alna's Hub.</p>

          {loginError && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loginError}</div>}

          <div className="mt-8 space-y-4">
            <Input label="Username" value={loginForm.username} onChange={(value) => setLoginForm({ ...loginForm, username: value })} placeholder="Enter admin username" />
            <Input label="Password" type="password" value={loginForm.password} onChange={(value) => setLoginForm({ ...loginForm, password: value })} placeholder="Enter admin password" />
          </div>

          <button type="submit" className="mt-6 w-full rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white hover:bg-stone-800">Login to Admin Panel</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alna's Hub Admin</h1>
            <p className="text-sm text-stone-500">Hidden route. Customers cannot see this link on the website.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { loadProducts(); loadOrders(); loadDrafts(); }} className="flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold hover:bg-stone-100"><RefreshCcw size={16} /> Refresh</button>
            <button onClick={clearOrders} className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 size={16} /> Clear Orders/Sales</button>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"><LogOut size={16} /> Logout</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-4 md:grid-cols-5">
          <StatCard icon={<Package />} label="Products" value={stats.products} />
          <StatCard icon={<ShoppingBag />} label="Orders" value={stats.orders} />
          <StatCard icon={<SlidersHorizontal />} label="New Orders" value={stats.newOrders} />
          <StatCard icon={<Sparkles />} label="AI Drafts" value={stats.readyDrafts} />
          <StatCard icon={<CreditIcon />} label="Total Sales" value={formatPrice(stats.totalSales)} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={() => setActiveTab("products")} className={`rounded-full px-5 py-3 text-sm font-semibold ${activeTab === "products" ? "bg-stone-950 text-white" : "border border-stone-200 bg-white"}`}>Products</button>
          <button onClick={() => setActiveTab("orders")} className={`rounded-full px-5 py-3 text-sm font-semibold ${activeTab === "orders" ? "bg-stone-950 text-white" : "border border-stone-200 bg-white"}`}>Orders</button>
          <button onClick={() => setActiveTab("ai-manager")} className={`rounded-full px-5 py-3 text-sm font-semibold ${activeTab === "ai-manager" ? "bg-stone-950 text-white" : "border border-stone-200 bg-white"}`}>AI Store Manager</button>
        </div>

        {message && <Alert type="success" message={message} />}
        {error && <Alert type="error" message={error} />}

        {activeTab === "products" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <ProductForm
              productForm={productForm}
              setProductForm={setProductForm}
              saveProduct={saveProduct}
              saving={saving}
              uploading={uploading}
              uploadImages={uploadImages}
              removeImage={removeImage}
              resetForm={() => setProductForm(emptyProductForm)}
            />
            <ProductsTable products={products} onEdit={editProduct} onDelete={deleteProduct} />
          </div>
        )}

        {activeTab === "orders" && <OrdersTable orders={orders} onUpdateOrder={updateOrder} onClearOrders={clearOrders} />}

        {activeTab === "ai-manager" && (
          <AIStoreManager
            smartUploadForm={smartUploadForm}
            setSmartUploadForm={setSmartUploadForm}
            generateSmartDraft={generateSmartDraft}
            generatingDraft={generatingDraft}
            drafts={drafts}
            publishDraft={publishDraft}
            rejectDraft={rejectDraft}
            editDraftInForm={editDraftInForm}
            publishingDraft={publishingDraft}
          />
        )}
      </section>
    </main>
  );
}

function AIStoreManager({ smartUploadForm, setSmartUploadForm, generateSmartDraft, generatingDraft, drafts, publishDraft, rejectDraft, editDraftInForm, publishingDraft }) {
  function handleSmartFiles(event) {
    const files = Array.from(event.target.files || []).slice(0, 4);
    setSmartUploadForm({ ...smartUploadForm, images: files });
  }

  const readyDrafts = drafts.filter((draft) => draft.status !== "published");

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={generateSmartDraft} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-white"><Sparkles size={21} /></div>
          <div>
            <h2 className="text-xl font-bold">AI Store Manager</h2>
            <p className="text-sm text-stone-500">Upload raw product photos and price. It creates a product draft for approval.</p>
          </div>
        </div>

        <div className="rounded-3xl bg-stone-950 p-5 text-white">
          <p className="font-bold">Smart Product Upload</p>
          <p className="mt-2 text-sm leading-6 text-stone-300">Images are resized, centered, compressed, converted for fast loading, and uploaded to Supabase. Background removal runs automatically if you add a background-removal API key; otherwise it still optimizes and prepares clean website images.</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Input label="Price" type="number" value={smartUploadForm.price} onChange={(value) => setSmartUploadForm({ ...smartUploadForm, price: value })} placeholder="4299" />
          <Input label="Stock" type="number" value={smartUploadForm.stock} onChange={(value) => setSmartUploadForm({ ...smartUploadForm, stock: value })} placeholder="10" />
          <Select label="Gender Optional" value={smartUploadForm.gender} onChange={(value) => setSmartUploadForm({ ...smartUploadForm, gender: value })} options={["Auto", "Women"]} />
          <Select label="Product Type Optional" value={smartUploadForm.category} onChange={(value) => setSmartUploadForm({ ...smartUploadForm, category: value })} options={["Auto", "Suits"]} />
          <Input label="Color Optional" value={smartUploadForm.color} onChange={(value) => setSmartUploadForm({ ...smartUploadForm, color: value })} placeholder="Auto or Black" />
          <Input label="Sizes" value={smartUploadForm.sizes} onChange={(value) => setSmartUploadForm({ ...smartUploadForm, sizes: value })} placeholder="S, M, L" />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-stone-700">Notes Optional</label>
            <textarea value={smartUploadForm.notes} onChange={(event) => setSmartUploadForm({ ...smartUploadForm, notes: event.target.value })} placeholder="Example: premium office suit, summer fabric, formal black set" className="min-h-24 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
          <div className="mb-3 flex items-center gap-2 font-medium text-stone-800"><Upload size={18} /> Raw Product Images</div>
          <input type="file" accept="image/*" multiple onChange={handleSmartFiles} disabled={generatingDraft} />
          <p className="mt-2">{smartUploadForm.images.length}/4 raw images selected</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {smartUploadForm.images.map((file) => (
              <div key={`${file.name}-${file.size}`} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <img src={URL.createObjectURL(file)} alt={file.name} className="h-28 w-full object-cover" />
              </div>
            ))}
            {smartUploadForm.images.length === 0 && <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white text-stone-400"><ImagePlus /></div>}
          </div>
        </div>

        <button type="submit" disabled={generatingDraft} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white hover:bg-stone-800 disabled:opacity-60">
          <Sparkles size={18} /> {generatingDraft ? "Generating draft..." : "Generate Product Draft"}
        </button>
      </form>

      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Draft Preview & Approval</h2>
        <p className="mt-1 text-sm text-stone-500">Nothing goes live until you approve it.</p>

        <div className="mt-5 space-y-5">
          {readyDrafts.map((draft) => (
            <div key={draft.id} className="rounded-3xl border border-stone-200 p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(draft.images || []).slice(0, 4).map((image) => (
                  <img key={image} src={image} alt={draft.title} className="h-28 w-full rounded-2xl object-cover" />
                ))}
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">{draft.status}</span>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">{draft.gender} • {draft.category}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{draft.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{draft.description}</p>
                <p className="mt-3 font-bold">{formatPrice(draft.price)}</p>
                {draft.processing_note && <p className="mt-2 text-xs text-stone-500">{draft.processing_note}</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => publishDraft(draft.id)} disabled={Boolean(publishingDraft)} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"><CheckCircle2 size={16} /> {publishingDraft === draft.id ? "Publishing..." : "Approve & Publish"}</button>
                <button onClick={() => editDraftInForm(draft)} className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold hover:bg-stone-100"><Edit3 size={16} /> Edit Before Publish</button>
                <button onClick={() => rejectDraft(draft.id)} disabled={Boolean(publishingDraft)} className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"><XCircle size={16} /> Reject</button>
              </div>
            </div>
          ))}
          {readyDrafts.length === 0 && <p className="rounded-2xl bg-stone-50 p-5 text-center text-stone-500">No AI drafts yet. Upload raw product photos and generate your first draft.</p>}
        </div>
      </div>
    </div>
  );
}

function ProductForm({ productForm, setProductForm, saveProduct, saving, uploading, uploadImages, removeImage, resetForm }) {
  return (
    <form onSubmit={saveProduct} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100">{productForm.id ? <Edit3 size={20} /> : <Plus size={20} />}</div>
        <div>
          <h2 className="text-xl font-bold">{productForm.id ? "Edit Product" : "Add New Product"}</h2>
          <p className="text-sm text-stone-500">Maximum 4 images per product.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Product Name" value={productForm.name} onChange={(value) => setProductForm({ ...productForm, name: value })} placeholder="Women's Formal Suit Set" />
        <Input label="Price" type="number" value={productForm.price} onChange={(value) => setProductForm({ ...productForm, price: value })} placeholder="4299" />
        <Input label="Compare Price Optional" type="number" value={productForm.compare_at_price} onChange={(value) => setProductForm({ ...productForm, compare_at_price: value })} placeholder="5299" />
        <Input label="Stock" type="number" value={productForm.stock} onChange={(value) => setProductForm({ ...productForm, stock: value })} placeholder="10" />
        <Select label="Gender" value={productForm.gender} onChange={(value) => setProductForm({ ...productForm, gender: value })} options={["Women"]} />
        <Select label="Category" value={productForm.category} onChange={(value) => setProductForm({ ...productForm, category: value })} options={["Suits"]} />
        <Input label="Sizes" value={productForm.sizes} onChange={(value) => setProductForm({ ...productForm, sizes: value })} placeholder="S, M, L, XL" />
        <Input label="Colors" value={productForm.colors} onChange={(value) => setProductForm({ ...productForm, colors: value })} placeholder="Black, Navy, Beige" />
        <Select label="Status" value={productForm.status} onChange={(value) => setProductForm({ ...productForm, status: value })} options={["published", "draft"]} />
        <div />
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-stone-700">Description</label>
          <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="Write a short, clear product description." className="min-h-28 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
        <div className="mb-3 flex items-center gap-2 font-medium text-stone-800"><Upload size={18} /> Product Images</div>
        <input type="file" accept="image/*" multiple onChange={uploadImages} disabled={uploading || productForm.images.length >= 4} />
        <p className="mt-2">{uploading ? "Uploading..." : `${productForm.images.length}/4 images selected`}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {productForm.images.map((image, index) => (
            <div key={image} className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <img src={image} alt={`Product ${index + 1}`} className="h-28 w-full object-cover" />
              <button type="button" onClick={() => removeImage(index)} className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-600 shadow"><Trash2 size={14} /></button>
            </div>
          ))}
          {productForm.images.length === 0 && <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white text-stone-400"><ImagePlus /></div>}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white hover:bg-stone-800 disabled:opacity-60"><Save size={18} /> {saving ? "Saving..." : productForm.id ? "Update Product" : "Add Product"}</button>
        {productForm.id && <button type="button" onClick={resetForm} className="rounded-2xl border border-stone-200 px-5 py-3 font-semibold hover:bg-stone-100">Cancel</button>}
      </div>
    </form>
  );
}

function ProductsTable({ products, onEdit, onDelete }) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold">Manage Products</h2>
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="flex gap-4 rounded-3xl border border-stone-200 p-4">
            <img src={product.images?.[0] || "/placeholder-product.svg"} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{product.name}</p>
              <p className="mt-1 text-sm text-stone-500">{product.gender} • {product.category} • {product.status}</p>
              <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)} • Stock {product.stock}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => onEdit(product)} className="rounded-full border border-stone-200 p-2 hover:bg-stone-100" aria-label="Edit product"><Edit3 size={16} /></button>
              <button onClick={() => onDelete(product.id)} className="rounded-full border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label="Delete product"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="rounded-2xl bg-stone-50 p-5 text-center text-stone-500">No products yet.</p>}
      </div>
    </div>
  );
}

function getWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;

  return digits;
}

function getOrderItemsText(order) {
  const items = order.order_items || [];

  if (items.length === 0) return "- Order item details are saved in admin panel";

  return items
    .map((item) => {
      const size = item.selected_size ? `, Size: ${item.selected_size}` : "";
      const color = item.selected_color ? `, Color: ${item.selected_color}` : "";
      return `- ${item.product_name} × ${item.quantity}${size}${color} - ${formatPrice(item.line_total)}`;
    })
    .join("\n");
}

function createWhatsAppMessage(order) {
  return `Hello ${order.customer_name},\n\nThank you for your order from Alna's Hub.\n\nWebsite: ${storeUrl}\n\nOrder ID: ${order.order_number}\n\nOrder Details:\n${getOrderItemsText(order)}\n\nTotal Amount: ${formatPrice(order.total_amount)}\nPayment Method: ${order.payment_method}\nOrder Status: ${order.order_status}\n\nDelivery Address:\n${order.customer_address}, ${order.customer_city}\n\nWe have received your order and will contact you soon for confirmation.\n\nThank you,\nAlna's Hub`;
}

function getWhatsAppUrl(order) {
  const phone = getWhatsAppPhone(order.customer_phone);
  const message = createWhatsAppMessage(order);

  if (!phone) return "#";

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function OrdersTable({ orders, onUpdateOrder, onClearOrders }) {
  return (
    <div className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold">Orders</h2>
          <p className="mt-1 text-sm text-stone-500">Manage customer orders and clear old order records when needed.</p>
        </div>
        <button
          type="button"
          onClick={onClearOrders}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={orders.length === 0}
        >
          <Trash2 size={16} /> Clear Orders
        </button>
      </div>
      <div className="space-y-5">
        {orders.map((order) => {
          const whatsappUrl = getWhatsAppUrl(order);

          return (
            <div key={order.id} className="rounded-3xl border border-stone-200 p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-lg font-bold">{order.order_number}</p>
                  <p className="mt-1 text-sm text-stone-500">{order.customer_name} • {order.customer_phone}</p>
                  <p className="mt-1 text-sm text-stone-500">{order.customer_address}, {order.customer_city}</p>
                  <p className="mt-2 text-sm font-semibold">{formatPrice(order.total_amount)} • {order.payment_method} • {order.payment_status}</p>
                  {order.upi_transaction_id && <p className="mt-1 text-sm text-stone-500">UPI Ref: {order.upi_transaction_id}</p>}

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <MessageCircle size={16} /> Send WhatsApp Message
                  </a>
                  <p className="mt-2 text-xs text-stone-500">Opens WhatsApp with a ready-made order confirmation message.</p>
                </div>
                <Select label="Order Status" value={order.order_status} onChange={(value) => onUpdateOrder(order.id, value)} options={orderStatuses} />
              </div>
              <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                {(order.order_items || []).map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 border-b border-stone-200 py-2 text-sm last:border-b-0">
                    <span>{item.product_name} × {item.quantity} ({item.selected_size}, {item.selected_color})</span>
                    <span className="font-semibold">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && <p className="rounded-2xl bg-stone-50 p-5 text-center text-stone-500">No orders yet.</p>}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-100">{icon}</div><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-sm text-stone-500">{label}</p></div>;
}

function Alert({ message, type }) {
  const styles = type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700";
  return <div className={`mt-6 rounded-2xl border p-4 text-sm ${styles}`}>{message}</div>;
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
    <label className="block min-w-48">
      <span className="mb-2 block text-sm font-semibold text-stone-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function CreditIcon() {
  return <span className="text-sm font-bold">₹</span>;
}
