import type { CatalogProduct } from "@/lib/catalog";

export type PriceRange = "all" | "under-50" | "50-100" | "100-200" | "over-200";
export type CatalogSort = "featured" | "low" | "high" | "newest" | "name";

export const priceRangeOptions: { value: PriceRange; label: string }[] = [
  { value: "all", label: "Any price" },
  { value: "under-50", label: "Under $50" },
  { value: "50-100", label: "$50 – $100" },
  { value: "100-200", label: "$100 – $200" },
  { value: "over-200", label: "$200 and above" },
];

function matchesPresetRange(price: number, range: PriceRange) {
  if (range === "under-50") return price < 50;
  if (range === "50-100") return price >= 50 && price <= 100;
  if (range === "100-200") return price > 100 && price <= 200;
  if (range === "over-200") return price > 200;
  return true;
}

export function filterCatalogProducts(products: CatalogProduct[], options: { search: string; category: string; priceRange: PriceRange; minPrice: string; maxPrice: string; sort: CatalogSort }) {
  const normalized = options.search.trim().toLowerCase();
  const min = options.minPrice === "" ? undefined : Number(options.minPrice);
  const max = options.maxPrice === "" ? undefined : Number(options.maxPrice);
  const filtered = products.filter((product) => {
    const searchMatches = !normalized || [product.name, product.description, product.category, product.seller].join(" ").toLowerCase().includes(normalized);
    const categoryMatches = options.category === "All" || product.category === options.category;
    const customRangeMatches = (min === undefined || product.price >= min) && (max === undefined || product.price <= max);
    return searchMatches && categoryMatches && matchesPresetRange(product.price, options.priceRange) && customRangeMatches;
  });
  return [...filtered].sort((a, b) => {
    if (options.sort === "low") return a.price - b.price;
    if (options.sort === "high") return b.price - a.price;
    if (options.sort === "name") return a.name.localeCompare(b.name);
    if (options.sort === "newest") return Number(Boolean(b.databaseId)) - Number(Boolean(a.databaseId));
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
  });
}
