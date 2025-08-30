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

import { createDbOperations } from "./db-utils";

// In-memory fallback storage
let fallbackCategories: Category[] = [];
let fallbackProducts: Product[] = [];

// Product database operations
export const productDb = createDbOperations<Product>("products", fallbackProducts);

// Category database operations
export const categoryDb = createDbOperations<Category>("categories", fallbackCategories);
