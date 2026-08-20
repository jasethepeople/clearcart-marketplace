import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useCart } from "@/contexts/CartContext";
import { ArrowUpRight, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function MarketplaceHeader() {
  const { user, loading } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setLocation(`/catalog?search=${encodeURIComponent(query)}`);
    setOpen(false);
  };
  const links = [
    ["Shop", "/catalog"],
    ["Categories", "/catalog"],
    ["Our standard", "/policies"],
  ];

  return <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#faf8f4]/92 backdrop-blur-xl">
    <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
      <Link href="/" className="flex items-center gap-2.5 font-serif text-2xl tracking-[-0.04em] text-stone-900">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#243d33] text-[12px] font-semibold text-[#f7f4ec]">C</span>
        clearcart
      </Link>
      <nav className="hidden items-center gap-8 md:flex">
        {links.map(([label, href]) => <Link key={label} href={href} className="text-sm font-medium text-stone-600 transition-colors hover:text-[#243d33]">{label}</Link>)}
      </nav>
      <div className="hidden items-center gap-3 md:flex">
        <form onSubmit={handleSearch} className="group flex h-10 w-40 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 transition-all focus-within:w-56 focus-within:border-[#9d7652]">
          <Search className="h-4 w-4 text-stone-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400" />
        </form>
        {loading ? <span className="h-9 w-9 animate-pulse rounded-full bg-stone-200" /> : user ? <Link href="/account" aria-label="Open account" className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:border-[#243d33] hover:text-[#243d33]"><UserRound className="h-4 w-4" /></Link> : <button onClick={() => startLogin()} className="rounded-full bg-[#243d33] px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-[#315545] active:scale-[.97]">Sign in</button>}
        <Link href="/cart" aria-label="Open shopping cart" className="relative grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:border-[#243d33] hover:text-[#243d33]"><ShoppingBag className="h-4 w-4" />{itemCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#c96f48] px-1 text-[10px] font-bold text-white">{itemCount}</span>}</Link>
      </div>
      <button className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 md:hidden" onClick={() => setOpen((current) => !current)} aria-label="Toggle navigation">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
    </div>
    {open && <div className="border-t border-stone-200 bg-[#faf8f4] px-5 py-5 md:hidden">
      <form onSubmit={handleSearch} className="mb-4 flex h-11 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3"><Search className="h-4 w-4 text-stone-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" className="w-full bg-transparent text-sm outline-none" /></form>
      <div className="grid gap-1">{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-2 py-3 text-sm font-medium text-stone-700">{label}<ArrowUpRight className="h-4 w-4" /></Link>)}</div>
      <div className="mt-4 grid grid-cols-2 gap-2"><Link href="/cart" onClick={() => setOpen(false)} className="rounded-lg border border-stone-200 px-3 py-3 text-center text-sm font-medium">Cart {itemCount ? `(${itemCount})` : ""}</Link>{user ? <Link href="/account" onClick={() => setOpen(false)} className="rounded-lg bg-[#243d33] px-3 py-3 text-center text-sm font-medium text-white">Account</Link> : <button onClick={() => startLogin()} className="rounded-lg bg-[#243d33] px-3 py-3 text-sm font-medium text-white">Sign in</button>}</div>
    </div>}
  </header>;
}
