import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";

/**
 * Fetches the application settings from the database.
 * Looks for a specific key 'storeConfig' and returns its JSON value.
 */
export const getSettings: RequestHandler = async (req, res) => {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "storeConfig")
    .single();

  // 'PGRST116' is the code for "exact one row not found".
  // We want to ignore this error and return a default object,
  // but log other unexpected errors.
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching settings:", error.message);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }

  if (data) {
    // Return the value object from the database
    res.json(data.value);
  } else {
    // If no settings are found, return an empty object to ensure the frontend doesn't break.
    res.json({});
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

  const { data, error } = await supabase
    .from("app_settings")
    .upsert({ key: "storeConfig", value: newSettings }, { onConflict: "key" })
    .select()
    .single();

  if (error) {
    console.error("Error updating settings:", error.message);
    return res.status(500).json({ error: "Failed to update settings" });
  }

  res.status(200).json({ success: true, settings: data.value });
};
