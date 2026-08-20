export type CatalogProduct = {
  id: string;
  databaseId?: number;
  sellerId?: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  longDescription: string;
  stock: number;
  image: string;
  material: string;
  dispatch: string;
  seller: string;
  featured?: boolean;
};

export const categories = [
  { name: "Home & Living", slug: "home-living", description: "Considered pieces for warm, useful spaces.", image: "/manus-storage/hero-home_b15e5d1b.jpg" },
  { name: "Wellbeing", slug: "wellbeing", description: "Objects and rituals for unhurried days.", image: "/manus-storage/wellness-goods_96ed1cd0.png" },
  { name: "Artisan Table", slug: "artisan-table", description: "Small-batch goods made for gathering.", image: "/manus-storage/artisan-goods_268502db.jpg" },
  { name: "Wardrobe", slug: "wardrobe", description: "Thoughtful essentials with enduring appeal.", image: "/manus-storage/apparel_40e798d3.jpg" },
] as const;

export const catalogProducts: CatalogProduct[] = [
  {
    id: "oak-lamp",
    slug: "solid-oak-table-lamp",
    name: "Solid Oak Table Lamp",
    category: "Home & Living",
    price: 168,
    description: "A softly lit everyday object in turned oak and linen.",
    longDescription: "Built in a small studio from responsibly sourced oak, this lamp pairs a quietly sculptural base with an unbleached linen shade. Its understated profile belongs equally on a desk, bedside table, or reading corner.",
    stock: 8,
    image: "/manus-storage/hero-home_b15e5d1b.jpg",
    material: "Solid oak, linen, brass hardware",
    dispatch: "Ships in 2–4 business days",
    seller: "Atelier North",
    featured: true,
  },
  {
    id: "ritual-set",
    slug: "daily-ritual-set",
    name: "Daily Ritual Set",
    category: "Wellbeing",
    price: 46,
    description: "A refined collection of botanical essentials for a slower start.",
    longDescription: "A considered collection of small-batch essentials designed for everyday rituals. The set includes a botanical oil, a hand-poured candle, and a simple ceramic dish, all selected to bring a little more intention to familiar moments.",
    stock: 15,
    image: "/manus-storage/wellness-goods_96ed1cd0.png",
    material: "Plant-based wax, amber glass, glazed ceramic",
    dispatch: "Ships in 1–3 business days",
    seller: "Field & Form",
    featured: true,
  },
  {
    id: "gathering-board",
    slug: "hand-finished-gathering-board",
    name: "Hand-finished Gathering Board",
    category: "Artisan Table",
    price: 72,
    description: "A generous serving board made for long lunches and shared plates.",
    longDescription: "Hand-finished and made to be used often, this serving board brings a warm natural texture to the table. Each piece is individually finished, making subtle variations in grain part of its character.",
    stock: 6,
    image: "/manus-storage/artisan-goods_268502db.jpg",
    material: "Food-safe hardwood, natural oil finish",
    dispatch: "Ships in 3–5 business days",
    seller: "Common Table Co.",
    featured: true,
  },
  {
    id: "studio-tee",
    slug: "studio-weight-tee",
    name: "Studio Weight Tee",
    category: "Wardrobe",
    price: 58,
    description: "A relaxed, densely knit cotton tee for repeat wear.",
    longDescription: "A durable wardrobe foundation with a relaxed line and a substantial hand feel. The fabric is woven for everyday longevity and the clean silhouette is designed to work across seasons.",
    stock: 21,
    image: "/manus-storage/apparel_40e798d3.jpg",
    material: "100% organic cotton",
    dispatch: "Ships in 1–3 business days",
    seller: "Plain Sight Studio",
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
