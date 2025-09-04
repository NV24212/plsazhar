import { RequestHandler } from "express";
import { orderDb, Order, OrderItem } from "../lib/orders-db";
import { productDb } from "../lib/supabase";
import {
  insertOrderSchema,
  updateOrderSchema,
} from "../../shared/schema";

export const getAllOrders: RequestHandler = async (req, res) => {
  try {
    const orders = await orderDb.getAll();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    console.log("Creating order with data:", req.body);
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((i) => i.message).join("; "),
        details: parsed.error.flatten(),
      });
    }

    const {
      customerId,
      items,
      status,
      deliveryType,
      deliveryArea,
      notes,
      total,
    } = parsed.data;

    // Ensure items conform to OrderItem type (schema guarantees fields)
    const itemsTyped: OrderItem[] = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
      price: i.price,
    }));

    // Check stock availability before processing order
    for (const item of itemsTyped) {
      const product = await productDb.getById(item.productId);
      if (!product) {
        return res.status(400).json({
          error: `Product ${item.productId} not found`,
        });
      }

      if (item.variantId && item.variantId !== "no-variant") {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return res.status(400).json({
            error: `Variant ${item.variantId} not found for product ${product.name}`,
          });
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name} (${variant.name}). Available: ${variant.stock}, Requested: ${item.quantity}`,
          });
        }
      } else {
        if ((product.total_stock || 0) < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name}. Available: ${product.total_stock || 0}, Requested: ${item.quantity}`,
          });
        }
      }
    }

    // Calculate expected total using settings (area-based fees + free threshold)
    const itemsTotal = itemsTyped.reduce(
      (sum: number, item: OrderItem) => sum + item.price * item.quantity,
      0,
    );

    // Load settings to compute delivery fee consistently with client
    let deliveryFee = 0;
    try {
      const { defaultSettings, loadSettings } = await import("../lib/app-settings.js");
      const settings = await loadSettings().catch(() => defaultSettings);
      if (deliveryType === "delivery") {
        if (itemsTotal >= (settings.freeDeliveryMinimum ?? defaultSettings.freeDeliveryMinimum)) {
          deliveryFee = 0;
        } else {
          const areaFee =
            (deliveryArea === "sitra" && (settings.deliveryAreaSitra ?? defaultSettings.deliveryAreaSitra)) ||
            (deliveryArea === "muharraq" && (settings.deliveryAreaMuharraq ?? defaultSettings.deliveryAreaMuharraq)) ||
            (deliveryArea === "other" && (settings.deliveryAreaOther ?? defaultSettings.deliveryAreaOther));
          if (typeof areaFee === "number") {
            deliveryFee = areaFee;
          } else {
            deliveryFee = settings.deliveryFee ?? defaultSettings.deliveryFee ?? 0;
          }
        }
      }
    } catch {
      deliveryFee = deliveryType === "delivery" ? 1.5 : 0;
    }

    const expectedTotal = itemsTotal + deliveryFee;

    // Always use the server-calculated total as the source of truth.
    const finalTotal = expectedTotal;

    console.log("Total calculation:", {
      itemsTotal: itemsTotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      expectedTotal: expectedTotal.toFixed(2),
      requestTotal: total,
      finalTotal: finalTotal.toFixed(2),
    });

    const orderData: Omit<
      Order,
      "id" | "created_at" | "updated_at" | "createdAt" | "updatedAt"
    > = {
      customerId,
      items: itemsTyped,
      total: finalTotal,
      status: status || "processing",
      deliveryType: deliveryType || "delivery",
      deliveryArea: deliveryArea || "sitra",
      notes: notes || "",
    };

    console.log("Creating order with processed data:", orderData);
    let newOrder;
    try {
      newOrder = await orderDb.create(orderData);
      console.log("Order created successfully:", newOrder.id);
    } catch (createError) {
      console.error("Failed to create order in database:", createError);
      return res.status(500).json({
        error: "Failed to create order in database",
        details:
          createError instanceof Error
            ? createError.message
            : "Unknown database error",
      });
    }

    // Reduce stock after successful order creation
    for (const item of items) {
      const product = await productDb.getById(item.productId);
      if (product) {
        if (item.variantId && item.variantId !== "no-variant") {
          // Update variant stock
          const updatedVariants = product.variants.map((variant) => {
            if (variant.id === item.variantId) {
              return { ...variant, stock: variant.stock - item.quantity };
            }
            return variant;
          });

          // Recalculate total stock
          const newTotalStock = updatedVariants.reduce(
            (sum, v) => sum + v.stock,
            0,
          );

          await productDb.update(product.id, {
            variants: updatedVariants,
            total_stock: newTotalStock,
          });
        } else {
          // Update total stock directly
          const newTotalStock = (product.total_stock || 0) - item.quantity;
          await productDb.update(product.id, {
            total_stock: Math.max(0, newTotalStock),
          });
        }
      }
    }

    console.log(
      "Order created successfully with stock reduction:",
      newOrder.id,
    );
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const updateOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((i) => i.message).join("; "),
        details: parsed.error.flatten(),
      });
    }

    const updates = { ...parsed.data } as Partial<Order>;
    if (updates.items) {
      const itemsTyped: OrderItem[] = updates.items.map((i: any) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
      }));
      updates.items = itemsTyped;
      updates.total = itemsTyped.reduce(
        (sum: number, item: OrderItem) => sum + item.price * item.quantity,
        0,
      );
    }

    const updatedOrder = await orderDb.update(id, updates);
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(500).json({ error: "Failed to update order" });
    }
  }
};

export const deleteOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await orderDb.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(500).json({ error: "Failed to delete order" });
    }
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderDb.getById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};
