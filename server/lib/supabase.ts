import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are properly configured (not placeholder values)
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl !== "your_supabase_project_url" &&
  supabaseServiceKey !== "your_supabase_service_role_key" &&
  supabaseUrl.startsWith("http");

let supabase: any = null;

if (isSupabaseConfigured) {
  try {
    // Create Supabase client with service role key for server-side operations
    supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("✅ Supabase client initialized successfully");

    // Initialize default categories if none exist
    initializeDefaultCategories();
  } catch (error) {
    console.error("❌ Failed to initialize Supabase client:", error);
    supabase = null;
  }
} else {
  console.warn(
    "⚠️  Supabase not configured. Using fallback in-memory storage.",
  );
  console.warn(
    "   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable database persistence.",
  );
}

// Initialize default categories if none exist
async function initializeDefaultCategories() {
  if (!supabase) return;

  try {
    const { data: existingCategories, error } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (error) {
      console.warn("Could not check existing categories:", error.message);
      return;
    }

    // If no categories exist, create default ones
    if (!existingCategories || existingCategories.length === 0) {
      console.log("No categories found, creating default categories...");

      const defaultCategories = [
        { id: "1", name: "Electronics" },
        { id: "2", name: "Accessories" },
        { id: "3", name: "Home & Office" },
      ];

      const { error: insertError } = await supabase
        .from("categories")
        .insert(defaultCategories);

      if (insertError) {
        console.warn(
          "Could not create default categories:",
          insertError.message,
        );
      } else {
        console.log("✅ Default categories created successfully");
      }
    }
  } catch (error) {
    console.warn("Could not initialize default categories:", error);
  }
}

export { supabase };

// Database types
export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  stock: number;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
  category_id?: string;
  total_stock: number;
  created_at?: string;
  updated_at?: string;
}

// In-memory fallback storage
let fallbackCategories: Category[] = [];

let fallbackProducts: Product[] = [];

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Product database operations with fallback
export const productDb = {
  // Get all products
  async getAll(): Promise<Product[]> {
    if (!supabase) {
      return fallbackProducts;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        return fallbackProducts;
      }

      return data || [];
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      return fallbackProducts;
    }
  },

  // Create a new product
  async create(
    product: Omit<Product, "id" | "created_at" | "updated_at">,
  ): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!supabase) {
      fallbackProducts.push(newProduct);
      return newProduct;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        fallbackProducts.push(newProduct);
        return newProduct;
      }

      return data;
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      fallbackProducts.push(newProduct);
      return newProduct;
    }
  },

  // Update a product
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    console.log("Updating product with ID:", id);
    console.log("ID type:", typeof id, "ID length:", id.length);
    console.log("Updates:", JSON.stringify(updates, null, 2));

    if (!supabase) {
      console.log("Using in-memory storage. Looking for product ID:", id);
      const normalizedId = String(id).trim();
      const index = fallbackProducts.findIndex(
        (p) => String(p.id).trim() === normalizedId,
      );
      if (index === -1) {
        throw new Error("Product not found");
      }
      fallbackProducts[index] = {
        ...fallbackProducts[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return fallbackProducts[index];
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
          "Error code:",
          error.code,
          "Error details:",
          error.details,
        );
        console.log("Looking for product ID in fallback storage:", id);
        console.log(
          "Available product IDs:",
          fallbackProducts.map((p) => p.id),
        );
        const normalizedId = String(id).trim();
        const index = fallbackProducts.findIndex(
          (p) => String(p.id).trim() === normalizedId,
        );
        if (index === -1) {
          throw new Error("Product not found");
        }
        fallbackProducts[index] = {
          ...fallbackProducts[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return fallbackProducts[index];
      }

      return data;
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      const normalizedId = String(id).trim();
      const index = fallbackProducts.findIndex(
        (p) => String(p.id).trim() === normalizedId,
      );
      if (index === -1) {
        throw new Error("Product not found");
      }
      fallbackProducts[index] = {
        ...fallbackProducts[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return fallbackProducts[index];
    }
  },

  // Delete a product
  async delete(id: string): Promise<void> {
    if (!supabase) {
      const normalizedId = String(id).trim();
      const index = fallbackProducts.findIndex(
        (p) => String(p.id).trim() === normalizedId,
      );
      if (index === -1) {
        throw new Error("Product not found");
      }
      fallbackProducts.splice(index, 1);
      return;
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        const normalizedId = String(id).trim();
        const index = fallbackProducts.findIndex(
          (p) => String(p.id).trim() === normalizedId,
        );
        if (index === -1) {
          throw new Error("Product not found");
        }
        fallbackProducts.splice(index, 1);
        return;
      }
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      const normalizedId = String(id).trim();
      const index = fallbackProducts.findIndex(
        (p) => String(p.id).trim() === normalizedId,
      );
      if (index === -1) {
        throw new Error("Product not found");
      }
      fallbackProducts.splice(index, 1);
    }
  },

  // Get a single product by ID
  async getById(id: string): Promise<Product | null> {
    if (!supabase) {
      const normalizedId = String(id).trim();
      return (
        fallbackProducts.find((p) => String(p.id).trim() === normalizedId) ||
        null
      );
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No rows returned
        }
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        const normalizedId = String(id).trim();
        return (
          fallbackProducts.find((p) => String(p.id).trim() === normalizedId) ||
          null
        );
      }

      return data;
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      const normalizedId = String(id).trim();
      return (
        fallbackProducts.find((p) => String(p.id).trim() === normalizedId) ||
        null
      );
    }
  },
};

// Category database operations with fallback
export const categoryDb = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    if (!supabase) {
      return fallbackCategories;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        return fallbackCategories;
      }

      return data || [];
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      return fallbackCategories;
    }
  },

  // Create a new category
  async create(
    category: Omit<Category, "id" | "created_at">,
  ): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    if (!supabase) {
      fallbackCategories.push(newCategory);
      return newCategory;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([newCategory])
        .select()
        .single();

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        fallbackCategories.push(newCategory);
        return newCategory;
      }

      return data;
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      fallbackCategories.push(newCategory);
      return newCategory;
    }
  },

  // Update a category
  async update(id: string, updates: Partial<Category>): Promise<Category> {
    if (!supabase) {
      const index = fallbackCategories.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Category not found");
      }
      fallbackCategories[index] = {
        ...fallbackCategories[index],
        ...updates,
      };
      return fallbackCategories[index];
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        const index = fallbackCategories.findIndex((c) => c.id === id);
        if (index === -1) {
          throw new Error("Category not found");
        }
        fallbackCategories[index] = {
          ...fallbackCategories[index],
          ...updates,
        };
        return fallbackCategories[index];
      }

      return data;
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      const index = fallbackCategories.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Category not found");
      }
      fallbackCategories[index] = {
        ...fallbackCategories[index],
        ...updates,
      };
      return fallbackCategories[index];
    }
  },

  // Delete a category
  async delete(id: string): Promise<void> {
    if (!supabase) {
      const index = fallbackCategories.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Category not found");
      }
      fallbackCategories.splice(index, 1);
      return;
    }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        const index = fallbackCategories.findIndex((c) => c.id === id);
        if (index === -1) {
          throw new Error("Category not found");
        }
        fallbackCategories.splice(index, 1);
        return;
      }
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      const index = fallbackCategories.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Category not found");
      }
      fallbackCategories.splice(index, 1);
    }
  },

  // Get a single category by ID
  async getById(id: string): Promise<Category | null> {
    if (!supabase) {
      return fallbackCategories.find((c) => c.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No rows returned
        }
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        return fallbackCategories.find((c) => c.id === id) || null;
      }

      return data;
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      return fallbackCategories.find((c) => c.id === id) || null;
    }
  },
};
