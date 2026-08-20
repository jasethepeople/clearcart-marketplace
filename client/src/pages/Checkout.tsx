import { MarketplaceFooter } from "@/components/MarketplaceFooter";
import { MarketplaceHeader } from "@/components/MarketplaceHeader";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { CheckCircle2, ChevronLeft, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Link, Redirect, useLocation } from "wouter";

export default function Checkout() {
  const { user, loading } = useAuth();
  const { items, subtotal, clearCart, hydrated } = useCart();
  const [, setLocation] = useLocation();
  const [shipping, setShipping] = useState({ name: "", address: "", city: "", postalCode: "" });
  const createOrder = trpc.marketplace.buyer.createPlaceholderOrder.useMutation({
    onSuccess: ({ reference }) => {
      clearCart();
      setLocation(`/confirmation?order=${reference}`);
    },
  });
  if (hydrated && !items.length && !createOrder.isSuccess) return <Redirect to="/cart" />;
  if (!hydrated) return <div className="min-h-screen bg-[#faf8f4]"><MarketplaceHeader /><main className="mx-auto max-w-6xl px-5 py-20"><div className="h-8 w-64 animate-pulse rounded bg-stone-200" /></main></div>;
  const update = (key: keyof typeof shipping, value: string) => setShipping((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) { startLogin(); return; }
    createOrder.mutate({
      shippingAddress: `${shipping.name}\n${shipping.address}\n${shipping.city} ${shipping.postalCode}`,
      items: items.map((item) => ({ name: item.name, quantity: item.quantity, unitPrice: item.price, productId: item.databaseId, sellerId: item.sellerId })),
    });
  };

  return <div className="min-h-screen bg-[#faf8f4] text-stone-900"><MarketplaceHeader /><main className="mx-auto max-w-6xl px-5 pb-24 pt-10 lg:px-8 lg:pt-14"><Link href="/cart" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600"><ChevronLeft className="h-4 w-4" />Return to bag</Link><div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start"><form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#a25c3d]">Checkout</p><h1 className="mt-3 font-serif text-4xl tracking-[-.05em]">Shipping details</h1>{!loading && !user && <div className="mt-6 rounded-xl border border-[#d8af83] bg-[#fffaef] p-4 text-sm leading-6 text-stone-700">Sign in with Manus OAuth to place a placeholder order and access your order history. <button type="button" onClick={() => startLogin()} className="font-semibold text-[#243d33] underline underline-offset-2">Sign in now</button></div>}<div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium sm:col-span-2">Full name<input required value={shipping.name} onChange={(event) => update("name", event.target.value)} className="h-12 rounded-lg border border-stone-200 px-3 font-normal outline-none focus:border-[#315545]" placeholder="Your full name" /></label><label className="grid gap-2 text-sm font-medium sm:col-span-2">Address<input required value={shipping.address} onChange={(event) => update("address", event.target.value)} className="h-12 rounded-lg border border-stone-200 px-3 font-normal outline-none focus:border-[#315545]" placeholder="Street address" /></label><label className="grid gap-2 text-sm font-medium">City<input required value={shipping.city} onChange={(event) => update("city", event.target.value)} className="h-12 rounded-lg border border-stone-200 px-3 font-normal outline-none focus:border-[#315545]" placeholder="City" /></label><label className="grid gap-2 text-sm font-medium">Postal code<input required value={shipping.postalCode} onChange={(event) => update("postalCode", event.target.value)} className="h-12 rounded-lg border border-stone-200 px-3 font-normal outline-none focus:border-[#315545]" placeholder="Postal code" /></label></div><div className="mt-8 rounded-xl bg-[#f0ede5] p-5"><div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#315545]" /><h2 className="font-semibold">Payment placeholder</h2></div><p className="mt-2 text-sm leading-6 text-stone-600">No live payment processing is enabled. Placing this order creates a pending record for the signed-in buyer without collecting payment information.</p></div>{createOrder.error && <p className="mt-4 text-sm text-red-600">{createOrder.error.message}</p>}<button disabled={loading || createOrder.isPending} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#243d33] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#315545] disabled:bg-stone-300">{user ? (createOrder.isPending ? "Placing order…" : "Place placeholder order") : "Sign in to continue"}<CheckCircle2 className="h-4 w-4" /></button></form><aside className="rounded-2xl bg-[#f0ede5] p-6"><h2 className="font-serif text-3xl">Your order</h2><div className="mt-5 divide-y divide-stone-200">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-sm"><span className="leading-5 text-stone-700">{item.name} <span className="text-stone-400">× {item.quantity}</span></span><span className="shrink-0 font-medium">{formatCurrency(item.price * item.quantity)}</span></div>)}</div><div className="mt-5 flex justify-between border-t border-stone-300 pt-5"><span className="font-medium">Total</span><span className="font-serif text-3xl">{formatCurrency(subtotal)}</span></div></aside></div></main><MarketplaceFooter /></div>;
}
