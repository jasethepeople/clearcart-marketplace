import { MarketplaceFooter } from "@/components/MarketplaceFooter";
import { MarketplaceHeader } from "@/components/MarketplaceHeader";
import { ProductCard } from "@/components/ProductCard";
import { catalogProducts, categories, type CatalogProduct } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { ArrowDownUp, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

export default function Catalog() {
  const [location, setLocation] = useLocation();
  const searchFromUrl = new URLSearchParams(location.split("?")[1] ?? "").get("search") ?? "";
  const [search, setSearch] = useState(searchFromUrl);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");
  const publishedQuery = trpc.marketplace.catalog.publishedProducts.useQuery(undefined);
  const databaseProducts: CatalogProduct[] = (publishedQuery.data ?? []).map((product) => ({ id: `db-${product.id}`, databaseId: product.id, sellerId: product.sellerId, slug: product.slug, name: product.name, category: product.categoryName, price: Number(product.price), description: product.description.slice(0, 110), longDescription: product.description, stock: product.stock, image: product.imageUrl || "/manus-storage/artisan-goods_268502db.jpg", material: "See seller listing", dispatch: "Seller-provided fulfillment", seller: product.shopName, featured: product.isFeatured }));
  const sourceProducts = databaseProducts.length ? databaseProducts : catalogProducts;
  const products = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const matches = sourceProducts.filter((product) => (activeCategory === "All" || product.category === activeCategory) && (!normalized || [product.name, product.description, product.category, product.seller].join(" ").toLowerCase().includes(normalized)));
    return [...matches].sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [activeCategory, search, sort, sourceProducts]);
  const submit = (event: React.FormEvent) => { event.preventDefault(); setLocation(`/catalog?search=${encodeURIComponent(search)}`); };

  return <div className="min-h-screen bg-[#faf8f4] text-stone-900"><MarketplaceHeader />
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 lg:px-8 lg:pt-16">
      <div className="grid gap-8 border-b border-stone-200 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a25c3d]">The collection</p><h1 className="mt-3 max-w-xl font-serif text-5xl leading-[.95] tracking-[-0.055em] sm:text-6xl">Useful, well-made things.</h1><p className="mt-5 max-w-lg text-[15px] leading-7 text-stone-600">Explore a considered marketplace of legal goods from independently reviewed sellers. Every listing is moderated against our marketplace standard.</p></div>
        <div className="flex items-center gap-2 text-sm text-stone-500"><SlidersHorizontal className="h-4 w-4" /> Filtered for thoughtful choices</div>
      </div>
      <div className="grid gap-5 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <form onSubmit={submit} className="flex h-12 items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 shadow-[0_6px_20px_rgba(48,42,33,.04)]"><Search className="h-4 w-4 text-stone-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, makers, or categories" className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400" />{search && <button type="button" onClick={() => { setSearch(""); setLocation("/catalog"); }} aria-label="Clear search"><X className="h-4 w-4 text-stone-400" /></button>}</form>
        <label className="flex h-12 items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-700"><ArrowDownUp className="h-4 w-4 text-stone-400" /><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="bg-transparent outline-none"><option value="featured">Featured first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-8"><button onClick={() => setActiveCategory("All")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${activeCategory === "All" ? "bg-[#243d33] text-white" : "border border-stone-200 bg-white text-stone-600 hover:border-[#243d33]"}`}>All pieces</button>{categories.map((category) => <button key={category.name} onClick={() => setActiveCategory(category.name)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${activeCategory === category.name ? "bg-[#243d33] text-white" : "border border-stone-200 bg-white text-stone-600 hover:border-[#243d33]"}`}>{category.name}</button>)}</div>
      <div className="mb-6 flex items-center justify-between"><p className="text-sm text-stone-500">{products.length} {products.length === 1 ? "piece" : "pieces"} in view</p><Link href="/policies#acceptable-use" className="text-sm font-medium text-[#243d33] underline decoration-stone-300 underline-offset-4">Marketplace standard</Link></div>
      {products.length ? <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-14 text-center"><p className="font-serif text-3xl">No pieces matched that search.</p><p className="mt-3 text-sm text-stone-500">Try a different term, or return to the full collection.</p><button onClick={() => { setSearch(""); setActiveCategory("All"); setLocation("/catalog"); }} className="mt-6 rounded-full bg-[#243d33] px-5 py-3 text-sm font-medium text-white">View all pieces</button></div>}
    </main><MarketplaceFooter /></div>;
}
