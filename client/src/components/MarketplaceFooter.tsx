import { Link } from "wouter";

export function MarketplaceFooter() {
  return <footer className="border-t border-stone-200 bg-[#f0ede5]">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
      <div>
        <div className="font-serif text-3xl tracking-[-0.05em] text-stone-900">clearcart</div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">A carefully moderated marketplace for useful, considered goods from independent makers and responsible sellers.</p>
      </div>
      <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Marketplace</p><div className="grid gap-2 text-sm text-stone-700"><Link href="/catalog">Browse collection</Link><Link href="/seller">Sell with ClearCart</Link><Link href="/account">Buyer account</Link></div></div>
      <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Policies</p><div className="grid gap-2 text-sm text-stone-700"><Link href="/policies#terms">Terms of Service</Link><Link href="/policies#privacy">Privacy Policy</Link><Link href="/policies#acceptable-use">Acceptable Use</Link></div></div>
    </div>
    <div className="border-t border-stone-200 px-5 py-5 text-center text-xs text-stone-500">© {new Date().getFullYear()} ClearCart Marketplace. Built for lawful commerce.</div>
  </footer>;
}
