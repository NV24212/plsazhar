import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";

const defaultSettings = {
  storeName: "My Store",
  storeDescription: "A description of my store.",
  currency: "BHD",
  currencySymbol: "BD",
  contactPhone: "",
  contactEmail: "",
  contactAddress: "",
  orderSuccessMessageEn:
    "Thank you for your order! We'll process it within 2-4 hours and deliver within 1-3 business days.",
  orderSuccessMessageAr:
    "شكراً لك على طلبك! سنقوم بمعالجته خلال 2-4 ساعات والتوصيل خلال 1-3 أيام عمل.",
  orderInstructionsEn:
    "For any changes or questions about your order, please contact us.",
  orderInstructionsAr: "لأي تغييرات أو أسئلة حول طلبك، يرجى التواصل معنا.",
  businessHours: {
    monday: { open: "09:00", close: "18:00", isOpen: true },
    tuesday: { open: "09:00", close: "18:00", isOpen: true },
    wednesday: { open: "09:00", close: "18:00", isOpen: true },
    thursday: { open: "09:00", close: "18:00", isOpen: true },
    friday: { open: "09:00", close: "18:00", isOpen: true },
    saturday: { open: "09:00", close: "18:00", isOpen: true },
    sunday: { open: "09:00", close: "18:00", isOpen: true },
  },
  pickupMessageEn:
    "Please collect your order from our location during business hours.",
  pickupMessageAr: "يرجى استلام طلبك من موقعنا خلال ساعات العمل.",
  deliveryMessageEn:
    "Your order will be delivered to your address within 1-3 business days.",
  deliveryMessageAr: "سيتم توصيل طلبك إلى عنوانك خلال 1-3 أيام عمل.",
  cashOnDeliveryEnabled: true,
  bankTransferEnabled: false,
  bankAccountInfo: "",
  autoOrderConfirmation: true,
  lowStockThreshold: 5,
  maxOrderQuantity: 10,
  orderProcessingTime: "2-4 hours",
  deliveryConcerns: 1.5,
  pickupOrderConfig: 0,
  successHeadlineEn: "Order Confirmed!",
  successHeadlineAr: "تم تأكيد الطلب!",
  successSubtextEn: "We'll share updates by phone as your order progresses.",
  successSubtextAr: "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك.",
  displayOrderNumber: true,
  displayOrderItems: true,
  displayTotals: true,
  displayNextSteps: true,
  displayContact: true,
  enableDialogScroll: true,
  autoScrollToSummary: true,
  adminPassword: "",
  adminEmail: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  enableNotifications: true,
  enableAnalytics: true,
  enableBackup: true,
  maxImageSize: 5,
  enableImageCompression: true,
  enableAutoSave: true,
  enableDarkMode: false,
  enableAccessibility: true,
  enablePerformanceMode: false,
  enableDebugMode: false,
  deliveryFee: 1.5,
  freeDeliveryMinimum: 20,
  deliveryAreaSitra: 1.0,
  deliveryAreaMuharraq: 1.5,
  deliveryAreaOther: 2.0,
  deliveryAreaSitraNameEn: "Sitra",
  deliveryAreaSitraNameAr: "سترة",
  deliveryAreaMuharraqlNameEn: "Muharraq, Askar, Jao",
  deliveryAreaMuharraqNameAr: "المحرق، عسكر، جو",
  deliveryAreaOtherNameEn: "Other Cities",
  deliveryAreaOtherNameAr: "مدن أخرى",
};

let fallbackSettings = { ...defaultSettings };

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

    if (data && data.value) {
      const settings = { ...defaultSettings, ...data.value };
      res.json(settings);
    } else {
      res.json(defaultSettings);
    }
  } catch (e) {
    console.error("Supabase error in getSettings, returning fallback:", e.message);
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
    res.status(200).json({ success: true, settings: data.value });
  } catch (e) {
    console.error(
      "Supabase error in updateSettings, updating in-memory fallback as safeguard:",
      e.message,
    );
    fallbackSettings = { ...fallbackSettings, ...newSettings };
    res.status(200).json({ success: true, settings: fallbackSettings });
  }
};
