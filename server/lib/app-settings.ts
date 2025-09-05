import { supabase } from "./supabase";

export type AppSettings = {
  storeName: string;
  storeDescription: string;
  currency: string;
  currencySymbol: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  orderSuccessMessageEn: string;
  orderSuccessMessageAr: string;
  orderInstructionsEn: string;
  orderInstructionsAr: string;
  businessHours: Record<string, { open: string; close: string; isOpen: boolean }>;
  pickupMessageEn?: string;
  pickupMessageAr?: string;
  deliveryMessageEn?: string;
  deliveryMessageAr?: string;
  cashOnDeliveryEnabled: boolean;
  bankTransferEnabled: boolean;
  bankAccountInfo: string;
  autoOrderConfirmation: boolean;
  lowStockThreshold: number;
  maxOrderQuantity: number;
  orderProcessingTime: string;
  deliveryConcerns: number;
  pickupOrderConfig: number;
  successHeadlineEn?: string;
  successHeadlineAr?: string;
  successSubtextEn?: string;
  successSubtextAr?: string;
  displayOrderNumber?: boolean;
  displayOrderItems?: boolean;
  displayTotals?: boolean;
  displayNextSteps?: boolean;
  displayContact?: boolean;
  enableDialogScroll?: boolean;
  autoScrollToSummary?: boolean;
  adminPassword?: string;
  adminEmail?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  enableNotifications?: boolean;
  enableAnalytics?: boolean;
  enableBackup?: boolean;
  maxImageSize?: number;
  enableImageCompression?: boolean;
  enableAutoSave?: boolean;
  enableDarkMode?: boolean;
  enableAccessibility?: boolean;
  enablePerformanceMode?: boolean;
  enableDebugMode?: boolean;
  deliveryFee?: number;
  freeDeliveryMinimum?: number;
  deliveryAreaSitra?: number;
  deliveryAreaMuharraq?: number;
  deliveryAreaOther?: number;
  deliveryAreaSitraNameEn?: string;
  deliveryAreaSitraNameAr?: string;
  deliveryAreaMuharraqlNameEn?: string;
  deliveryAreaMuharraqNameAr?: string;
  deliveryAreaOtherNameEn?: string;
  deliveryAreaOtherNameAr?: string;
};

export const defaultSettings: AppSettings = {
  storeName: "My Store",
  storeDescription: "A description of my store.",
  currency: "BHD",
  currencySymbol: "BH",
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
  preOrderConfirmationMessageEn: "Are you sure you want to place the order?",
  preOrderConfirmationMessageAr: "هل أنت متأكد من إرسال الطلب؟",
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

export async function loadSettings(): Promise<AppSettings> {
  try {
    if (!supabase) return defaultSettings;
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "storeConfig")
      .single();
    if (error && error.code !== "PGRST116") throw error;
    if (data && (data as any).value) {
      return { ...defaultSettings, ...(data as any).value } as AppSettings;
    }
    return defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}
