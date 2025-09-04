import { Customer, Product, Order, Category } from "@/contexts/DataContext";

const API_BASE = "/api";

// Helper function for API calls with optimized retry logic
async function apiCall<T>(
  url: string,
  options?: RequestInit,
  retryCount = 0,
): Promise<T> {
  const maxRetries = 2;
  const retryDelay = 500 * (retryCount + 1); // Reduced: 500ms, 1s delay instead of 1s, 2s

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout to 8s

    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;

      try {
        // Read raw text once from the original response (we won't use it afterward)
        const raw = await response.text();
        let errorData: any = null;
        try {
          errorData = raw ? JSON.parse(raw) : null;
        } catch {
          errorData = null;
        }

        console.error("API Error details:", {
          url: `${API_BASE}${url}`,
          status: response.status,
          statusText: response.statusText,
          errorData: errorData ?? raw,
        });

        if (errorData?.error) {
          errorMessage = `${errorMessage} ${errorData.error}`;
        } else if (errorData?.message) {
          errorMessage = `${errorMessage} ${errorData.message}`;
        } else if (typeof raw === "string" && raw.trim().length > 0) {
          errorMessage = `${errorMessage} ${raw.trim()}`;
        } else {
          errorMessage = `${errorMessage} ${response.statusText}`;
        }

        // Append Zod field errors if present
        const fieldErrors = errorData?.details?.fieldErrors as
          | Record<string, string[]>
          | undefined;
        if (fieldErrors && typeof fieldErrors === "object") {
          const zodMsgs = Object.entries(fieldErrors)
            .flatMap(([key, arr]) => (Array.isArray(arr) ? arr.map((m) => `${key}: ${m}`) : []))
            .filter(Boolean);
          if (zodMsgs.length) {
            errorMessage = `${errorMessage} — ${zodMsgs.join("; ")}`;
          }
        }
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed (attempt ${retryCount + 1}):`, {
      url: `${API_BASE}${url}`,
      error: error instanceof Error ? error.message : String(error),
    });

    // Check if we should retry - only retry network errors
    if (
      retryCount < maxRetries &&
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("Network error"))
    ) {
      console.log(`Retrying API call in ${retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return apiCall<T>(url, options, retryCount + 1);
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error or server is unavailable");
  }
}

// Customer API with instant operations
export const customerApi = {
  getAll: () => apiCall<Customer[]>("/customers"),
  create: (customer: Omit<Customer, "id" | "createdAt">) =>
    apiCall<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    }),
  update: (id: string, customer: Partial<Customer>) =>
    apiCall<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    }),
  delete: (id: string) =>
    apiCall<void>(`/customers/${id}`, {
      method: "DELETE",
    }),
};

// Product API with instant operations
export const productApi = {
  getAll: () => apiCall<Product[]>("/products"),
  create: (product: Omit<Product, "id">) =>
    apiCall<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  update: (id: string, product: Partial<Product>) =>
    apiCall<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
  delete: (id: string) =>
    apiCall<void>(`/products/${id}`, {
      method: "DELETE",
    }),
};

// Order API with instant operations
export const orderApi = {
  getAll: () => apiCall<Order[]>("/orders"),
  create: (order: Omit<Order, "id" | "createdAt" | "updatedAt">) =>
    apiCall<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  update: (id: string, order: Partial<Order>) =>
    apiCall<Order>(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(order),
    }),
  delete: (id: string) =>
    apiCall<void>(`/orders/${id}`, {
      method: "DELETE",
    }),
};

// Category API with instant operations
export const categoryApi = {
  getAll: () => apiCall<Category[]>("/categories"),
  create: (category: Omit<Category, "id" | "createdAt">) =>
    apiCall<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    }),
  update: (id: string, category: Partial<Category>) =>
    apiCall<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category),
    }),
  delete: (id: string) =>
    apiCall<void>(`/categories/${id}`, {
      method: "DELETE",
    }),
};

// Convenience exports for store components
export const getProducts = productApi.getAll;
export const createCustomer = customerApi.create;
export const createOrder = orderApi.create;
