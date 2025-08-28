import { supabase } from "./supabase";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string; // Backward compatibility
  home?: string;
  road?: string;
  block?: string;
  town?: string;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

// In-memory fallback storage
let fallbackCustomers: Customer[] = [
  {
    id: "1",
    name: "Alice Johnson",
    phone: "+1 (555) 123-4567",
    address: "House 123, Road 15, Block 304, Springfield",
    home: "123",
    road: "15",
    block: "304",
    town: "Springfield",
    createdAt: "2024-01-10T10:00:00Z",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    name: "Bob Smith",
    phone: "+1 (555) 234-5678",
    address: "House 456, Road 22, Block 205, Manama",
    home: "456",
    road: "22",
    block: "205",
    town: "Manama",
    createdAt: "2024-01-12T14:30:00Z",
    created_at: "2024-01-12T14:30:00Z",
    updated_at: "2024-01-12T14:30:00Z",
  },
  {
    id: "3",
    name: "Carol Davis",
    phone: "+1 (555) 345-6789",
    address: "House 789, Road 33, Block 102, Riffa",
    home: "789",
    road: "33",
    block: "102",
    town: "Riffa",
    createdAt: "2024-01-14T09:15:00Z",
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z",
  },
];

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Transform database data to match frontend expectations
const transformCustomer = (customer: any): Customer => ({
  id: customer.id,
  name: customer.name,
  phone: customer.phone,
  address:
    customer.address ||
    `House ${customer.home || ""}, Road ${customer.road || ""}, Block ${customer.block || ""}, ${customer.town || ""}`.trim(),
  home: customer.home,
  road: customer.road,
  block: customer.block,
  town: customer.town,
  createdAt: customer.created_at || customer.createdAt,
  created_at: customer.created_at,
  updated_at: customer.updated_at,
});

export const customerDb = {
  // Get all customers
  async getAll(): Promise<Customer[]> {
    if (!supabase) {
      return fallbackCustomers;
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        return fallbackCustomers;
      }

      return (data || []).map(transformCustomer);
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      return fallbackCustomers;
    }
  },

  // Create a new customer
  async create(
    customer: Omit<Customer, "id" | "created_at" | "updated_at" | "createdAt">,
  ): Promise<Customer> {
    if (!supabase) {
      const newCustomer: Customer = {
        ...customer,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      fallbackCustomers.push(newCustomer);
      return newCustomer;
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .insert([
          {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            home: customer.home,
            road: customer.road,
            block: customer.block,
            town: customer.town,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return transformCustomer(data);
    } catch (error) {
      console.warn(
        "Supabase error, falling back to in-memory storage:",
        error,
      );
      const newCustomer: Customer = {
        ...customer,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      fallbackCustomers.push(newCustomer);
      return newCustomer;
    }
  },

  // Update a customer
  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (!supabase) {
      const index = fallbackCustomers.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Customer not found");
      }
      fallbackCustomers[index] = {
        ...fallbackCustomers[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return fallbackCustomers[index];
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        const index = fallbackCustomers.findIndex((c) => c.id === id);
        if (index === -1) {
          throw new Error("Customer not found");
        }
        fallbackCustomers[index] = {
          ...fallbackCustomers[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return fallbackCustomers[index];
      }

      return transformCustomer(data);
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      const index = fallbackCustomers.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Customer not found");
      }
      fallbackCustomers[index] = {
        ...fallbackCustomers[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return fallbackCustomers[index];
    }
  },

  // Delete a customer
  async delete(id: string): Promise<void> {
    if (!supabase) {
      const index = fallbackCustomers.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Customer not found");
      }
      fallbackCustomers.splice(index, 1);
      return;
    }

    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) {
        console.warn(
          "Supabase error, falling back to in-memory storage:",
          error.message,
        );
        const index = fallbackCustomers.findIndex((c) => c.id === id);
        if (index === -1) {
          throw new Error("Customer not found");
        }
        fallbackCustomers.splice(index, 1);
        return;
      }
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      const index = fallbackCustomers.findIndex((c) => c.id === id);
      if (index === -1) {
        throw new Error("Customer not found");
      }
      fallbackCustomers.splice(index, 1);
    }
  },

  // Get a single customer by ID
  async getById(id: string): Promise<Customer | null> {
    if (!supabase) {
      return fallbackCustomers.find((c) => c.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from("customers")
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
        return fallbackCustomers.find((c) => c.id === id) || null;
      }

      if (!data) return null;

      return transformCustomer(data);
    } catch (error) {
      console.warn("Supabase connection failed, using in-memory storage");
      return fallbackCustomers.find((c) => c.id === id) || null;
    }
  },
};
