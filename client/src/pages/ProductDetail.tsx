import { MarketplaceFooter } from "@/components/MarketplaceFooter";
import { MarketplaceHeader } from "@/components/MarketplaceHeader";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { catalogProducts, formatCurrency, type CatalogProduct } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, PackageCheck, ShieldCheck } from "lucide-react";
import { Link, Redirect, useRoute } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const productQuery = trpc.marketplace.catalog.productBySlug.useQuery({ slug: params?.slug ?? "unknown" });
  const databaseProduct: CatalogProduct | undefined = productQuery.data ? { id: `db-${productQuery.data.id}`, databaseId: productQuery.data.id, sellerId: productQuery.data.sellerId, slug: productQuery.data.slug, name: productQuery.data.name, category: productQuery.data.categoryName, price: Number(productQuery.data.price), description: productQuery.data.description.slice(0, 110), longDescription: productQuery.data.description, stock: productQuery.data.stock, image: productQuery.data.imageUrl || "/manus-storage/artisan-goods_268502db.jpg", material: "See seller listing", dispatch: "Seller-provided fulfillment", seller: productQuery.data.shopName, featured: productQuery.data.isFeatured } : undefined;
  const product = databaseProduct ?? catalogProducts.find((item) => item.slug === params?.slug);
  const reviewQuery = trpc.marketplace.catalog.productReviews.useQuery({ productId: product?.databaseId ?? 1 }, { enabled: Boolean(product?.databaseId) });
  const { addItem } = useCart();
  if (!product && !productQuery.isLoading) return <Redirect to="/catalog" />;
  if (!product) return <div className="min-h-screen bg-[#faf8f4]"><MarketplaceHeader /></div>;
  const related = catalogProducts.filter((item) => item.id !== product.id && item.category === product.category).concat(catalogProducts.filter((item) => item.id !== product.id && item.category !== product.category)).slice(0, 3);
  return <div className="min-h-screen bg-[#faf8f4] text-stone-900"><MarketplaceHeader />
    <main className="mx-auto max-w-7xl px-5 pb-24 pt-7 lg:px-8 lg:pt-10">
      <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-[#243d33]"><ArrowLeft className="h-4 w-4" />Back to collection</Link>
      <section className="mt-7 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="overflow-hidden rounded-2xl bg-stone-100 aspect-[1/1.1]"><img src={product.image} alt={product.name} className="h-full w-full object-cover" /></div>
        <div className="flex flex-col justify-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a25c3d]">{product.category}</p><h1 className="mt-4 font-serif text-5xl leading-[.95] tracking-[-0.055em] sm:text-6xl">{product.name}</h1><p className="mt-5 text-xl text-stone-700">{formatCurrency(product.price)}</p><p className="mt-6 max-w-xl text-[15px] leading-7 text-stone-600">{product.longDescription}</p>
          <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-stone-800">Availability</p><p className={`text-sm font-semibold ${product.stock > 0 ? "text-[#315545]" : "text-[#a25c3d]"}`}>{product.stock > 0 ? `${product.stock} in stock` : "Currently unavailable"}</p></div><button disabled={!product.stock} onClick={() => addItem(product)} className="mt-5 w-full rounded-lg bg-[#243d33] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#315545] disabled:cursor-not-allowed disabled:bg-stone-300">{product.stock ? "Add to bag" : "Sold out"}</button></div>
          <div className="mt-6 grid gap-4 text-sm text-stone-600"><div className="flex items-start gap-3"><PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#315545]" /><span>{product.dispatch}</span></div><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#315545]" /><span>Seller reviewed against our marketplace policy</span></div><div className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#315545]" /><span>Materials: {product.material}</span></div></div>
          <div className="mt-8 border-t border-stone-200 pt-5"><p className="text-sm text-stone-500">Sold by</p><p className="mt-1 font-serif text-xl">{product.seller}</p><div className="mt-4"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#a25c3d]">Verified buyer reviews</p>{reviewQuery.data?.length ? <div className="mt-3 grid gap-3">{reviewQuery.data.map((review) => <div key={review.id} className="rounded-xl bg-[#f0ede5] p-4"><p className="text-sm font-semibold text-[#315545]">{review.rating} / 5 · {review.reviewer}</p>{review.body && <p className="mt-2 text-sm leading-6 text-stone-600">{review.body}</p>}</div>)}</div> : <p className="mt-2 text-sm leading-6 text-stone-500">Reviews appear here only after verified buyers complete an order. No ratings have been published for this item yet.</p>}</div></div>
        </div>
      </section>
      <section className="mt-24 border-t border-stone-200 pt-12"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a25c3d]">Continue exploring</p><h2 className="mt-3 font-serif text-4xl tracking-[-0.04em]">More from the collection</h2></div><Link href="/catalog" className="hidden text-sm font-semibold text-[#243d33] sm:block">View all pieces</Link></div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>
    </main><MarketplaceFooter /></div>;
}
