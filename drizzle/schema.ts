import { boolean, decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const sellerProfiles = mysqlTable("sellerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  shopName: varchar("shopName", { length: 120 }).notNull(),
  shopDescription: text("shopDescription"),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("sellerProfiles_userId_idx").on(table.userId)]);

export const buyerProfiles = mysqlTable("buyerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 120 }),
  shippingAddress: text("shippingAddress"),
  marketplaceUpdates: boolean("marketplaceUpdates").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("buyerProfiles_userId_idx").on(table.userId)]);

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").default(0).notNull(),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["draft", "pending", "published", "archived"]).default("draft").notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("products_sellerId_idx").on(table.sellerId),
  index("products_categoryId_idx").on(table.categoryId),
  index("products_status_idx").on(table.status),
]);

export const carts = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  cartId: int("cartId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("cartItems_cart_product_unq").on(table.cartId, table.productId),
  index("cartItems_cartId_idx").on(table.cartId),
]);

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(),
  reference: varchar("reference", { length: 32 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingAmount: decimal("shippingAmount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["not_required", "placeholder", "paid", "refunded"]).default("placeholder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("orders_buyerId_idx").on(table.buyerId), index("orders_status_idx").on(table.status)]);

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  sellerId: int("sellerId").notNull(),
  productName: varchar("productName", { length: 160 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
}, (table) => [index("orderItems_orderId_idx").on(table.orderId), index("orderItems_sellerId_idx").on(table.sellerId)]);

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  orderItemId: int("orderItemId").notNull().unique(),
  productId: int("productId").notNull(),
  sellerId: int("sellerId").notNull(),
  buyerId: int("buyerId").notNull(),
  rating: int("rating").notNull(),
  body: text("body"),
  isVisible: boolean("isVisible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("reviews_productId_idx").on(table.productId),
  index("reviews_sellerId_idx").on(table.sellerId),
  index("reviews_buyerId_idx").on(table.buyerId),
]);

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type BuyerProfile = typeof buyerProfiles.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Review = typeof reviews.$inferSelect;
