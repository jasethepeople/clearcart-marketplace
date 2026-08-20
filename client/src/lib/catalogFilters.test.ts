import { describe, expect, it } from "vitest";
import { filterCatalogProducts } from "./catalogFilters";
import type { CatalogProduct } from "./catalog";

const products: CatalogProduct[] = [
  { id: "1", slug: "low", name: "Candle", category: "Home", price: 24, description: "A quiet candle", longDescription: "A quiet candle for home", stock: 3, image: "x", material: "wax", dispatch: "today", seller: "Maker", featured: false },
  { id: "2", slug: "mid", name: "Board", category: "Table", price: 72, description: "A crafted board", longDescription: "A crafted board for sharing", stock: 3, image: "x", material: "oak", dispatch: "today", seller: "Maker", featured: true },
  { id: "3", slug: "high", name: "Lamp", category: "Home", price: 168, description: "A reading lamp", longDescription: "A reading lamp for home", stock: 3, image: "x", material: "oak", dispatch: "today", seller: "Maker", featured: false },
];

const base = { search: "", category: "All", priceRange: "all" as const, minPrice: "", maxPrice: "", sort: "featured" as const };

describe("filterCatalogProducts", () => {
  it("combines category and preset price filters", () => {
    expect(filterCatalogProducts(products, { ...base, category: "Home", priceRange: "100-200" }).map((product) => product.name)).toEqual(["Lamp"]);
  });

  it("applies an optional custom price range and a name sort", () => {
    expect(filterCatalogProducts(products, { ...base, minPrice: "20", maxPrice: "80", sort: "name" }).map((product) => product.name)).toEqual(["Board", "Candle"]);
  });

  it("matches catalog searches across product fields", () => {
    expect(filterCatalogProducts(products, { ...base, search: "reading" }).map((product) => product.name)).toEqual(["Lamp"]);
  });
});
