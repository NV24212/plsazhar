import { supabase } from "./supabase";

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

export function createDbOperations<T extends { id: string; created_at?: string; updated_at?: string }>(
  tableName: string,
  fallbackStore: T[]
) {
  return {
    async getAll(): Promise<T[]> {
      if (!supabase) {
        return fallbackStore;
      }
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.warn(`Supabase error fetching from ${tableName}, falling back to in-memory:`, error.message);
        return fallbackStore;
      }
      return data || [];
    },

    async getById(id: string): Promise<T | null> {
      if (!supabase) {
        return fallbackStore.find((item) => item.id === id) || null;
      }
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        console.warn(`Supabase error fetching from ${tableName} by id, falling back to in-memory:`, error.message);
        return fallbackStore.find((item) => item.id === id) || null;
      }
      return data;
    },

    async create(item: Omit<T, "id" | "created_at" | "updated_at">): Promise<T> {
      const newItem = {
        ...item,
        id: generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as T;

      if (!supabase) {
        fallbackStore.push(newItem);
        return newItem;
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert([newItem])
        .select()
        .single();

      if (error) {
        console.warn(`Supabase error creating in ${tableName}, falling back to in-memory:`, error.message);
        fallbackStore.push(newItem);
        return newItem;
      }
      return data;
    },

    async update(id: string, updates: Partial<T>): Promise<T> {
        const itemUpdates = { ...updates, updated_at: new Date().toISOString() };
        if (!supabase) {
            const index = fallbackStore.findIndex((i) => i.id === id);
            if (index === -1) throw new Error(`${tableName} item not found`);
            fallbackStore[index] = { ...fallbackStore[index], ...itemUpdates };
            return fallbackStore[index];
        }

        const { data, error } = await supabase
            .from(tableName)
            .update(itemUpdates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.warn(`Supabase error updating in ${tableName}, falling back to in-memory:`, error.message);
            const index = fallbackStore.findIndex((i) => i.id === id);
            if (index === -1) throw new Error(`${tableName} item not found`);
            fallbackStore[index] = { ...fallbackStore[index], ...itemUpdates };
            return fallbackStore[index];
        }
        return data;
    },

    async delete(id: string): Promise<void> {
        if (!supabase) {
            const index = fallbackStore.findIndex((i) => i.id === id);
            if (index === -1) throw new Error(`${tableName} item not found`);
            fallbackStore.splice(index, 1);
            return;
        }

        const { error } = await supabase.from(tableName).delete().eq("id", id);

        if (error) {
            console.warn(`Supabase error deleting from ${tableName}, falling back to in-memory:`, error.message);
            const index = fallbackStore.findIndex((i) => i.id === id);
            if (index === -1) throw new Error(`${tableName} item not found`);
            fallbackStore.splice(index, 1);
        }
    },
  };
}
