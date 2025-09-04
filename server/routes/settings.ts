import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";
import { defaultSettings, AppSettings } from "../lib/app-settings";

let fallbackSettings: AppSettings = { ...defaultSettings };

/**
 * Fetches the application settings from the database.
 * Looks for a specific key 'storeConfig' and returns its JSON value.
 */
export const getSettings: RequestHandler = async (req, res) => {
  if (!supabase) {
    return res.json(fallbackSettings);
  }

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "storeConfig")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data && (data as any).value) {
      const settings = { ...defaultSettings, ...(data as any).value } as AppSettings;
      res.json(settings);
    } else {
      res.json(defaultSettings);
    }
  } catch (e: any) {
    console.error("Supabase error in getSettings, returning fallback:", e?.message || e);
    res.json(fallbackSettings);
  }
};

/**
 * Updates the application settings in the database.
 * Uses 'upsert' to either create the settings row if it doesn't exist
 * or update it if it does.
 */
export const updateSettings: RequestHandler = async (req, res) => {
  const newSettings = req.body;

  if (!newSettings || typeof newSettings !== "object") {
    return res.status(400).json({ error: "Invalid settings data provided" });
  }

  if (!supabase) {
    fallbackSettings = { ...fallbackSettings, ...newSettings };
    return res.status(200).json({ success: true, settings: fallbackSettings });
  }

  try {
    const { data, error } = await supabase
      .from("app_settings")
      .upsert({ key: "storeConfig", value: newSettings }, { onConflict: "key" })
      .select()
      .single();

    if (error) {
      throw error;
    }
    const merged = { ...defaultSettings, ...(data as any).value } as AppSettings;
    fallbackSettings = merged;
    res.status(200).json({ success: true, settings: merged });
  } catch (e: any) {
    console.error(
      "Supabase error in updateSettings, updating in-memory fallback as safeguard:",
      e?.message || e,
    );
    fallbackSettings = { ...fallbackSettings, ...newSettings } as AppSettings;
    res.status(200).json({ success: true, settings: fallbackSettings });
  }
};
