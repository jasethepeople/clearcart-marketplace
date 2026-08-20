import { useCart } from "@/contexts/CartContext";
import { formatCurrency, type CatalogProduct } from "@/lib/catalog";
import { ArrowUpRight, Plus } from "lucide-react";
import { Link } from "wouter";

export function ProductCard({ product, priority = false }: { product: CatalogProduct; priority?: boolean }) {
  const { addItem } = useCart();
  return <article className="group">
    <Link href={`/products/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-stone-100 aspect-[4/4.55]">
      <img src={product.image} alt={product.name} loading={priority ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
      <span className="absolute left-3 top-3 rounded-full bg-[#faf8f4]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#243d33] backdrop-blur">{product.category}</span>
      <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-stone-800 opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
    </Link>
    <div className="flex items-start justify-between gap-3 px-1 pt-4"><div><Link href={`/products/${product.slug}`} className="font-serif text-lg leading-tight text-stone-900 transition-colors hover:text-[#a25c3d]">{product.name}</Link><p className="mt-1 text-sm text-stone-500">by {product.seller}</p></div><p className="pt-0.5 text-sm font-medium text-stone-800">{formatCurrency(product.price)}</p></div>
    <button onClick={() => addItem(product)} disabled={product.stock === 0} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#243d33] transition-colors hover:text-[#a25c3d] disabled:cursor-not-allowed disabled:text-stone-400"><Plus className="h-3.5 w-3.5" />{product.stock ? "Add to bag" : "Sold out"}</button>
  </article>;
}
