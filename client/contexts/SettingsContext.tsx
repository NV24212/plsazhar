import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface StoreSettings {
  // Store Information
  storeName: string;
  storeDescription: string;
  currency: string;
  currencySymbol: string;

  // Contact Information
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;

  // Order Messages
  orderSuccessMessageEn: string;
  orderSuccessMessageAr: string;
  orderInstructionsEn: string;
  orderInstructionsAr: string;
  preOrderConfirmationMessageEn?: string;
  preOrderConfirmationMessageAr?: string;

  // Business Hours
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };

  // Delivery & Pickup Messages
  pickupMessageEn?: string;
  pickupMessageAr?: string;
  deliveryMessageEn?: string;
  deliveryMessageAr?: string;

  // Payment Settings
  cashOnDeliveryEnabled: boolean;
  bankTransferEnabled: boolean;
  bankAccountInfo: string;

  // Operational Settings
  autoOrderConfirmation: boolean;
  lowStockThreshold: number;
  maxOrderQuantity: number;
  orderProcessingTime: string;
  deliveryConcerns: number;
  pickupOrderConfig: number;

  // Success Screen Controls
  successHeadlineEn?: string;
  successHeadlineAr?: string;
  successSubtextEn?: string;
  successSubtextAr?: string;
  displayOrderNumber?: boolean;
  displayOrderItems?: boolean;
  displayTotals?: boolean;
  displayNextSteps?: boolean;
  displayContact?: boolean;

  // UI Behavior
  enableDialogScroll?: boolean;
  autoScrollToSummary?: boolean;

  // Admin Settings
  adminPassword?: string;
  adminEmail?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;

  // New Advanced Settings
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

  // Delivery Settings
  deliveryFee?: number;
  freeDeliveryMinimum?: number;

  // Delivery Area Pricing
  deliveryAreaSitra?: number;
  deliveryAreaMuharraq?: number;
  deliveryAreaOther?: number;

  // Delivery Area Names
  deliveryAreaSitraNameEn?: string;
  deliveryAreaSitraNameAr?: string;
  deliveryAreaMuharraqlNameEn?: string;
  deliveryAreaMuharraqNameAr?: string;
  deliveryAreaOtherNameEn?: string;
  deliveryAreaOtherNameAr?: string;
}

interface SettingsContextType {
  settings: StoreSettings | null;
  loading: boolean;
  refetchSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (response.ok) {
        setSettings(data);
      } else {
        throw new Error(data.error || "Failed to fetch settings");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refetchSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
