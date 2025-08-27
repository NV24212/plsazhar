import { z } from "zod";

// Shared types
export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  stock: z.coerce.number().int().nonnegative(),
  image: z.string().optional().default(""),
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

// Helper: price string with up to 2 decimals or number
const priceInputSchema = z
  .union([
    z
      .string()
      .regex(/^\d+(?:\.\d{1,2})?$/, "Price must be a number with up to 2 decimals"),
    z.number(),
  ])
  .transform((v) => (typeof v === "number" ? v : parseFloat(v)));

// Product create schema (server expects supabase shape)
export const insertProductSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().default("").optional(),
    price: priceInputSchema,
    images: z.array(z.string()).default([]).optional(),
    variants: z.array(productVariantSchema).default([]).optional(),
    category_id: z
      .union([z.string().min(1), z.null()])
      .optional()
      .transform((v) => (v === "" ? null : v)),
    // Allow extra fields from clients without failing (e.g., totalStock, stock)
    total_stock: z.coerce.number().int().nonnegative().optional(),
    totalStock: z.coerce.number().int().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
  })
  .transform((data) => {
    // derive total_stock from variants if present
    const variants = data.variants ?? [];
    const derivedTotal =
      variants.length > 0
        ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
        : data.total_stock ?? data.totalStock ?? data.stock ?? 0;

    return {
      name: data.name.trim(),
      description: (data.description ?? "").toString(),
      price: data.price,
      images: Array.isArray(data.images) ? data.images : [],
      variants: variants.map((v) => ({
        id: v.id ?? `${Date.now().toString()}${Math.random().toString(36).slice(2, 9)}`,
        name: v.name,
        stock: v.stock,
        image: v.image ?? "",
      })),
      category_id: data.category_id ?? null,
      total_stock: derivedTotal,
    };
  });
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Product update schema (partial, but validate shapes)
export const updateProductSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: priceInputSchema.optional(),
    images: z.array(z.string()).optional(),
    variants: z.array(productVariantSchema).optional(),
    category_id: z.union([z.string().min(1), z.null()]).optional(),
    total_stock: z.coerce.number().int().nonnegative().optional(),
    totalStock: z.coerce.number().int().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
  })
  .transform((updates) => {
    const u: any = { ...updates };

    // Normalize empty category_id to null
    if (u.category_id === "") u.category_id = null;

    // Recalculate total_stock from variants if provided
    if (u.variants && Array.isArray(u.variants) && u.variants.length > 0) {
      u.total_stock = u.variants.reduce(
        (sum: number, v: { stock: number }) => sum + (v?.stock ?? 0),
        0,
      );
      // Ensure variant ids
      u.variants = u.variants.map((v: any) => ({
        id:
          v.id ?? `${Date.now().toString()}${Math.random().toString(36).slice(2, 9)}`,
        name: v.name,
        stock: v.stock,
        image: v.image ?? "",
      }));
    } else if (u.totalStock !== undefined) {
      u.total_stock = u.totalStock;
      delete u.totalStock;
    } else if (u.stock !== undefined) {
      u.total_stock = u.stock;
      delete u.stock;
    }

    return u;
  });
export type UpdateProduct = z.infer<typeof updateProductSchema>;

// Category schemas
export const insertCategorySchema = z.object({
  name: z.string().min(1, "Name is required").transform((s) => s.trim()),
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1).transform((s) => s.trim()).optional(),
});
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

// Customer schemas
const addressObjectSchema = z.object({
  home: z.string().min(1).optional(),
  road: z.string().min(1).optional(),
  block: z.string().min(1).optional(),
  town: z.string().min(1).optional(),
});

export const insertCustomerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    // Accept either a single string address or a structured object
    address: z.union([z.string().min(1), addressObjectSchema]).optional(),
    home: z.string().optional(),
    road: z.string().optional(),
    block: z.string().optional(),
    town: z.string().optional(),
  })
  .transform((c) => {
    let addressStr: string | undefined =
      typeof c.address === "string" ? c.address : undefined;
    const parts = {
      home: c.home ?? (typeof c.address === "object" ? c.address.home : undefined),
      road: c.road ?? (typeof c.address === "object" ? c.address.road : undefined),
      block:
        c.block ?? (typeof c.address === "object" ? c.address.block : undefined),
      town: c.town ?? (typeof c.address === "object" ? c.address.town : undefined),
    };
    if (!addressStr) {
      const segs = [
        parts.home ? `House ${parts.home}` : undefined,
        parts.road ? `Road ${parts.road}` : undefined,
        parts.block ? `Block ${parts.block}` : undefined,
        parts.town,
      ].filter(Boolean);
      addressStr = segs.join(", ");
    }
    return {
      name: c.name.trim(),
      phone: c.phone.trim(),
      address: addressStr ?? "",
      ...parts,
    };
  });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export const updateCustomerSchema = z
  .object({
    name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    address: z.union([z.string().min(1), addressObjectSchema]).optional(),
    home: z.string().optional(),
    road: z.string().optional(),
    block: z.string().optional(),
    town: z.string().optional(),
  })
  .transform((u) => {
    const out: any = { ...u };
    if (typeof u.address === "object") {
      out.home = out.home ?? u.address.home;
      out.road = out.road ?? u.address.road;
      out.block = out.block ?? u.address.block;
      out.town = out.town ?? u.address.town;
      delete out.address;
    }
    return out;
  });
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

// Order schemas
export const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().positive(),
  price: z
    .union([
      z
        .string()
        .regex(/^\d+(?:\.\d{1,2})?$/, "Price must be a number with up to 2 decimals"),
      z.number(),
    ])
    .transform((v) => (typeof v === "number" ? v : parseFloat(v))),
});
export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const insertOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  items: z.array(orderItemSchema).min(1, "Order items are required"),
  status: z
    .enum(["processing", "ready", "delivered", "picked-up"])
    .optional()
    .default("processing"),
  deliveryType: z.enum(["delivery", "pickup"]).optional().default("delivery"),
  deliveryArea: z.enum(["sitra", "muharraq", "other"]).optional().default("sitra"),
  notes: z.string().optional().default(""),
  total: z
    .union([
      z
        .string()
        .regex(/^\d+(?:\.\d{1,2})?$/)
        .transform((s) => parseFloat(s)),
      z.number(),
    ])
    .optional(),
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const updateOrderSchema = z.object({
  customerId: z.string().min(1).optional(),
  items: z.array(orderItemSchema).optional(),
  total: z
    .union([
      z
        .string()
        .regex(/^\d+(?:\.\d{1,2})?$/)
        .transform((s) => parseFloat(s)),
      z.number(),
    ])
    .optional(),
  status: z.enum(["processing", "ready", "delivered", "picked-up"]).optional(),
  deliveryType: z.enum(["delivery", "pickup"]).optional(),
  deliveryArea: z.enum(["sitra", "muharraq", "other"]).optional(),
  notes: z.string().optional(),
});
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
