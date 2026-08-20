import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { buyerProfiles, categories, orderItems, orders, products, reviews, sellerProfiles, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { canTransitionOrder, isReviewRating, slugify } from "../marketplaceRules";

function ensureAdmin(role: string) {
  if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Marketplace database is unavailable." });
  return db;
}

const productInput = z.object({
  name: z.string().trim().min(3).max(160),
  categoryName: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(5000),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Use a price with up to two decimal places."),
  stock: z.number().int().min(0).max(100000),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

const productUpdateInput = z.object({
  productId: z.number().int().positive(),
  name: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(5000),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Use a price with up to two decimal places."),
  stock: z.number().int().min(0).max(100000),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const marketplaceRouter = router({
  catalog: router({
    categories: publicProcedure.query(async () => {
      const db = await requireDb();
      return db.select().from(categories).orderBy(categories.name);
    }),
    publishedProducts: publicProcedure.input(z.object({ search: z.string().optional() }).optional()).query(async ({ input }) => {
      const db = await requireDb();
      const rows = await db.select().from(products).where(eq(products.status, "published")).orderBy(desc(products.createdAt));
      const search = input?.search?.trim().toLowerCase();
      const matched = search ? rows.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(search)) : rows;
      return Promise.all(matched.map(async (product) => {
        const category = (await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1))[0];
        const seller = (await db.select().from(sellerProfiles).where(eq(sellerProfiles.id, product.sellerId)).limit(1))[0];
        return { ...product, categoryName: category?.name ?? "Marketplace", shopName: seller?.shopName ?? "Independent seller" };
      }));
    }),
    productBySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(async ({ input }) => {
      const db = await requireDb();
      const product = (await db.select().from(products).where(and(eq(products.slug, input.slug), eq(products.status, "published"))).limit(1))[0];
      if (!product) return null;
      const category = (await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1))[0];
      const seller = (await db.select().from(sellerProfiles).where(eq(sellerProfiles.id, product.sellerId)).limit(1))[0];
      return { ...product, categoryName: category?.name ?? "Marketplace", shopName: seller?.shopName ?? "Independent seller" };
    }),
    productReviews: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(async ({ input }) => {
      const db = await requireDb();
      const rows = await db.select().from(reviews).where(and(eq(reviews.productId, input.productId), eq(reviews.isVisible, true))).orderBy(desc(reviews.createdAt));
      return rows.map((review) => ({ id: review.id, rating: review.rating, body: review.body, createdAt: review.createdAt, reviewer: "Verified buyer" }));
    }),
  }),
  seller: router({
    myProfile: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return (await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, ctx.user.id)).limit(1))[0] ?? null;
    }),
    applySeller: protectedProcedure.input(z.object({ shopName: z.string().trim().min(3).max(120), shopDescription: z.string().trim().min(20).max(3000) })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.insert(sellerProfiles).values({ userId: ctx.user.id, shopName: input.shopName, shopDescription: input.shopDescription, isApproved: false }).onDuplicateKeyUpdate({ set: { shopName: input.shopName, shopDescription: input.shopDescription } });
      return { success: true };
    }),
    products: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const profile = (await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, ctx.user.id)).limit(1))[0];
      if (!profile) return [];
      return db.select().from(products).where(eq(products.sellerId, profile.id)).orderBy(desc(products.updatedAt));
    }),
    createProduct: protectedProcedure.input(productInput).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const profile = (await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, ctx.user.id)).limit(1))[0];
      if (!profile) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a seller profile before submitting a product." });
      const categorySlug = slugify(input.categoryName);
      let category = (await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1))[0];
      if (!category) {
        await db.insert(categories).values({ name: input.categoryName, slug: categorySlug, description: `Seller-submitted category: ${input.categoryName}` });
        category = (await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1))[0];
      }
      const baseSlug = slugify(input.name) || "product";
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      await db.insert(products).values({ sellerId: profile.id, categoryId: category.id, name: input.name, slug, description: input.description, price: input.price, stock: input.stock, imageUrl: input.imageUrl || null, status: "pending", isFeatured: false });
      return { success: true, slug, status: "pending" as const };
    }),
    updateProduct: protectedProcedure.input(productUpdateInput).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const profile = (await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, ctx.user.id)).limit(1))[0];
      if (!profile) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a seller profile before editing a product." });
      const product = (await db.select().from(products).where(and(eq(products.id, input.productId), eq(products.sellerId, profile.id))).limit(1))[0];
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "This listing is not available to edit." });
      await db.update(products).set({ name: input.name, description: input.description, price: input.price, stock: input.stock, imageUrl: input.imageUrl || null, status: "pending" }).where(eq(products.id, product.id));
      return { success: true, status: "pending" as const };
    }),
    archiveProduct: protectedProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const profile = (await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, ctx.user.id)).limit(1))[0];
      if (!profile) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Create a seller profile before archiving a product." });
      const product = (await db.select().from(products).where(and(eq(products.id, input.productId), eq(products.sellerId, profile.id))).limit(1))[0];
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "This listing is not available to archive." });
      await db.update(products).set({ status: "archived" }).where(eq(products.id, product.id));
      return { success: true };
    }),
  }),
  buyer: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return (await db.select().from(buyerProfiles).where(eq(buyerProfiles.userId, ctx.user.id)).limit(1))[0] ?? null;
    }),
    updateProfile: protectedProcedure.input(z.object({ displayName: z.string().trim().max(120), shippingAddress: z.string().trim().max(2000), marketplaceUpdates: z.boolean() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.insert(buyerProfiles).values({ userId: ctx.user.id, displayName: input.displayName || null, shippingAddress: input.shippingAddress || null, marketplaceUpdates: input.marketplaceUpdates }).onDuplicateKeyUpdate({ set: { displayName: input.displayName || null, shippingAddress: input.shippingAddress || null, marketplaceUpdates: input.marketplaceUpdates } });
      return { success: true };
    }),
    createPlaceholderOrder: protectedProcedure.input(z.object({ shippingAddress: z.string().trim().min(10).max(2000), items: z.array(z.object({ name: z.string().trim().min(1).max(160), quantity: z.number().int().min(1).max(1000), unitPrice: z.number().positive().max(100000), productId: z.number().int().positive().optional(), sellerId: z.number().int().positive().optional() })).min(1) })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const subtotal = input.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
      const reference = `CC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      await db.insert(orders).values({ buyerId: ctx.user.id, reference, status: "pending", subtotal: subtotal.toFixed(2), shippingAmount: "0.00", total: subtotal.toFixed(2), shippingAddress: input.shippingAddress, paymentStatus: "placeholder" });
      const order = (await db.select().from(orders).where(eq(orders.reference, reference)).limit(1))[0];
      await db.insert(orderItems).values(input.items.map((item) => ({ orderId: order.id, productId: item.productId ?? 0, sellerId: item.sellerId ?? 0, productName: item.name, unitPrice: item.unitPrice.toFixed(2), quantity: item.quantity })));
      return { reference, orderId: order.id };
    }),
    orders: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const buyerOrders = await db.select().from(orders).where(eq(orders.buyerId, ctx.user.id)).orderBy(desc(orders.createdAt));
      return Promise.all(buyerOrders.map(async (order) => ({ ...order, items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)) })));
    }),
    submitReview: protectedProcedure.input(z.object({ orderItemId: z.number().int().positive(), rating: z.number(), body: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      if (!isReviewRating(input.rating)) throw new TRPCError({ code: "BAD_REQUEST", message: "A review rating must be a whole number from 1 to 5." });
      const db = await requireDb();
      const item = (await db.select().from(orderItems).where(eq(orderItems.id, input.orderItemId)).limit(1))[0];
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Order item not found." });
      const order = (await db.select().from(orders).where(and(eq(orders.id, item.orderId), eq(orders.buyerId, ctx.user.id))).limit(1))[0];
      if (!order || order.status !== "completed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Reviews are available only for completed orders." });
      const existing = (await db.select().from(reviews).where(eq(reviews.orderItemId, item.id)).limit(1))[0];
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "This order item already has a review." });
      await db.insert(reviews).values({ orderItemId: item.id, productId: item.productId, sellerId: item.sellerId, buyerId: ctx.user.id, rating: input.rating, body: input.body || null, isVisible: true });
      return { success: true };
    }),
  }),
  admin: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      ensureAdmin(ctx.user.role);
      const db = await requireDb();
      const [allUsers, allProducts, allOrders] = await Promise.all([db.select().from(users), db.select().from(products), db.select().from(orders)]);
      return { userCount: allUsers.length, productCount: allProducts.length, pendingProductCount: allProducts.filter((product) => product.status === "pending").length, orderCount: allOrders.length };
    }),
    users: protectedProcedure.query(async ({ ctx }) => {
      ensureAdmin(ctx.user.role);
      const db = await requireDb();
      return db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
    }),
    setUserRole: protectedProcedure.input(z.object({ userId: z.number().int().positive(), role: z.enum(["user", "admin"]) })).mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.user.role);
      if (input.userId === ctx.user.id && input.role !== "admin") throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove your own administrator role." });
      const db = await requireDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),
    moderationQueue: protectedProcedure.query(async ({ ctx }) => {
      ensureAdmin(ctx.user.role);
      const db = await requireDb();
      return db.select().from(products).where(eq(products.status, "pending")).orderBy(desc(products.createdAt));
    }),
    orders: protectedProcedure.query(async ({ ctx }) => {
      ensureAdmin(ctx.user.role);
      const db = await requireDb();
      return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
    }),
    setOrderStatus: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), status: z.enum(["confirmed", "processing", "shipped", "completed", "cancelled"]) })).mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.user.role);
      const db = await requireDb();
      const order = (await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1))[0];
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      if (!canTransitionOrder(order.status, input.status)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "That order status transition is not permitted." });
      await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
      return { success: true };
    }),
    moderateProduct: protectedProcedure.input(z.object({ productId: z.number().int().positive(), status: z.enum(["published", "archived"]) })).mutation(async ({ ctx, input }) => {
      ensureAdmin(ctx.user.role);
      const db = await requireDb();
      await db.update(products).set({ status: input.status }).where(eq(products.id, input.productId));
      return { success: true };
    }),
  }),
});
