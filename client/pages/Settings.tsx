import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDialog } from "@/contexts/DialogContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Truck,
  Package,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  MessageSquare,
  Bell,
  Shield,
  User,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Upload,
  Wrench,
} from "lucide-react";
import SystemSettings from "@/components/SystemSettings";
import { diagnoseApiHealth } from "@/utils/apiDiagnostics";

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

const defaultSettings: StoreSettings = {
  storeName: "",
  storeDescription: "",
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
  successHeadlineAr: "تم تأك��د الطلب!",
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

export default function Settings() {
  const { t, language } = useLanguage();
  const { showConfirm, showAlert } = useDialog();
  const { products, orders, customers, refetchData } = useData();
  const { changePassword, updateEmail, adminInfo, fetchAdminInfo } = useAuth();
  const {
    settings: contextSettings,
    loading,
    refetchSettings,
  } = useSettings();
  const [formState, setFormState] = useState<StoreSettings | null>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("delivery");
  const [isSaving, setIsSaving] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (contextSettings) {
      setFormState({ ...defaultSettings, ...contextSettings });
    }
  }, [contextSettings]);

  useEffect(() => {
    if (!adminInfo?.email) return;
    // Update adminEmail only if changed to avoid render loops
    setFormState((prev) => {
      if (!prev) return prev;
      if (prev.adminEmail === adminInfo.email) return prev;
      return { ...prev, adminEmail: adminInfo.email };
    });
  }, [adminInfo?.email]);

  const handleInputChange = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleBusinessHoursChange = (
    day: string,
    field: string,
    value: any,
  ) => {
    setFormState((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day as keyof typeof prev.businessHours],
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  const handlePasswordChange = async () => {
    if (
      !formState.currentPassword ||
      !formState.newPassword ||
      !formState.confirmPassword
    ) {
      showAlert({
        title: t("message.error"),
        message: "All password fields are required",
        type: "error",
      });
      return;
    }

    if (formState.newPassword !== formState.confirmPassword) {
      showAlert({
        title: t("message.error"),
        message: t("settings.passwordsDoNotMatch"),
        type: "error",
      });
      return;
    }

    if (formState.newPassword.length < 6) {
      showAlert({
        title: t("message.error"),
        message: "Password must be at least 6 characters long",
        type: "error",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const success = await changePassword(
        formState.currentPassword,
        formState.newPassword,
      );

      if (success) {
        showAlert({
          title: t("common.success"),
          message: t("settings.passwordChanged"),
          type: "success",
        });

        // Clear password fields
        setFormState((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        showAlert({
          title: t("message.error"),
          message:
            "Failed to change password. Please check your current password.",
          type: "error",
        });
      }
    } catch (error) {
      showAlert({
        title: t("message.error"),
        message: "An error occurred while changing password",
        type: "error",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const saveSettings = async () => {
    if (!formState) return;

    setIsSaving(true);
    try {
      // Save settings to the server via API
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      // Handle admin email update if it changed
      if (
        adminInfo?.email &&
        formState.adminEmail &&
        adminInfo.email !== formState.adminEmail
      ) {
        const emailUpdateSuccess = await updateEmail(formState.adminEmail);
        if (!emailUpdateSuccess) {
          showAlert({
            title: t("message.error"),
            message: "Failed to update admin email",
            type: "error",
          });
          setIsSaving(false);
          return;
        }
        // Refresh admin info
        await fetchAdminInfo();
      }

      setHasChanges(false);
      // Persist to localStorage for components that read from it (e.g., checkout dialog)
      try {
        localStorage.setItem("storeSettings", JSON.stringify(formState));
      } catch {}
      showAlert({
        title: t("settings.saveSuccess"),
        message: t("settings.saveSuccess"),
        type: "success",
      });
      refetchSettings(); // Refetch settings to update the context
    } catch (error) {
      console.error("Save settings error:", error);
      showAlert({
        title: t("settings.saveError"),
        message: (error as Error).message || t("settings.saveError"),
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    const confirmed = await showConfirm({
      title: t("settings.reset"),
      message: t("settings.resetConfirm"),
      type: "warning",
    });

    if (confirmed) {
      // Just reload the page. This will trigger a re-fetch of settings from the server,
      // effectively resetting any unsaved client-side changes.
      window.location.reload();
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(formState, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "store-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setFormState((prev) => ({ ...prev, ...importedSettings }));
          setHasChanges(true);
          showAlert({
            title: t("checkout.settingsImported"),
            message: t("checkout.settingsImported"),
            type: "success",
          });
        } catch (error) {
          showAlert({
            title: t("checkout.importError"),
            message: t("checkout.importError"),
            type: "error",
          });
        }
      };
      reader.readAsText(file);
    }
  };


  const runDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const results = await diagnoseApiHealth();
      const successCount = results.filter((r) => r.success).length;
      const totalCount = results.length;

      showAlert({
        title: "API Diagnostics Complete",
        message: `${successCount}/${totalCount} endpoints working. Check console for details.`,
        type: successCount === totalCount ? "success" : "warning",
      });
    } catch (error) {
      showAlert({
        title: "Diagnostics Failed",
        message: "Failed to run API diagnostics",
        type: "error",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const tabs = [
    { id: "delivery", label: t("settings.deliverySettings"), icon: Truck },
    { id: "admin", label: t("settings.adminSettings"), icon: Shield },
  ];

  if (loading || !formState) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="flex gap-4">
          <div className="w-1/4 space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="w-3/4">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold auto-text">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground auto-text">
            {t("settings.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasChanges && (
            <Badge variant="destructive" className="auto-text">
              {t("settings.unsavedChanges")}
            </Badge>
          )}
          <Button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t("common.loading") : t("settings.save")}
          </Button>
          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("settings.reset")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Vertical Tab Navigation */}
        <div className="w-full md:w-1/4">
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full justify-start gap-2 text-base px-4 py-3 [dir=rtl]:flex-row-reverse"
                >
                  <Icon className="w-5 h-5" />
                  <span className="auto-text">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full md:w-3/4 space-y-6">
          {/* Delivery Settings */}
          {activeTab === "delivery" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Delivery Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {t("settings.deliveryPricing")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="freeDeliveryMinimum" className="auto-text">
                      {t("settings.freeDeliveryMinimum")}
                    </Label>
                    <Input
                      id="freeDeliveryMinimum"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formState.freeDeliveryMinimum || 0}
                      onChange={(e) =>
                        handleInputChange(
                          "freeDeliveryMinimum",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onFocus={(e) => {
                        if (e.target.value === "0") {
                          e.target.value = "";
                        }
                        // Scroll into view on mobile
                        setTimeout(() => {
                          e.target.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }, 100);
                      }}
                      className="ltr-text"
                      placeholder="20"
                    />
                    <p className="text-sm text-muted-foreground auto-text mt-1">
                      {t("settings.freeDeliveryMinimumHint")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Area Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {language === "ar"
                      ? "أسعار التوصيل حسب المنطقة"
                      : "Delivery Area Pricing"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium auto-text">
                      {language === "ar" ? "المنطقة الأولى" : "Area 1"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="deliveryAreaSitraNameEn"
                          className="auto-text"
                        >
                          {language === "ar"
                            ? "الاسم بالإنجليزية"
                            : "Name (English)"}
                        </Label>
                        <Input
                          id="deliveryAreaSitraNameEn"
                          value={formState.deliveryAreaSitraNameEn || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "deliveryAreaSitraNameEn",
                              e.target.value,
                            )
                          }
                          placeholder="Sitra"
                          className="auto-text"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="deliveryAreaSitraNameAr"
                          className="auto-text"
                        >
                          {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
                        </Label>
                        <Input
                          id="deliveryAreaSitraNameAr"
                          value={formState.deliveryAreaSitraNameAr || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "deliveryAreaSitraNameAr",
                              e.target.value,
                            )
                          }
                          placeholder="سترة"
                          className="auto-text"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deliveryAreaSitra" className="auto-text">
                        {language === "ar" ? "رسوم التوصيل" : "Delivery Fee"}
                      </Label>
                      <Input
                        id="deliveryAreaSitra"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formState.deliveryAreaSitra || 0}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaSitra",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") {
                            e.target.value = "";
                          }
                          // Scroll into view on mobile
                          setTimeout(() => {
                            e.target.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }, 100);
                        }}
                        className="ltr-text"
                        placeholder="1.0"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium auto-text">
                      {language === "ar" ? "المنطقة الثانية" : "Area 2"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="deliveryAreaMuharraqlNameEn"
                          className="auto-text"
                        >
                          {language === "ar"
                            ? "الاسم بالإنجليزية"
                            : "Name (English)"}
                        </Label>
                        <Input
                          id="deliveryAreaMuharraqlNameEn"
                          value={formState.deliveryAreaMuharraqlNameEn || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "deliveryAreaMuharraqlNameEn",
                              e.target.value,
                            )
                          }
                          placeholder="Muharraq, Askar, Jao"
                          className="auto-text"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="deliveryAreaMuharraqNameAr"
                          className="auto-text"
                        >
                          {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
                        </Label>
                        <Input
                          id="deliveryAreaMuharraqNameAr"
                          value={formState.deliveryAreaMuharraqNameAr || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "deliveryAreaMuharraqNameAr",
                              e.target.value,
                            )
                          }
                          placeholder="المحرق، عسكر، جو"
                          className="auto-text"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deliveryAreaMuharraq" className="auto-text">
                        {language === "ar" ? "رسوم التوصيل" : "Delivery Fee"}
                      </Label>
                      <Input
                        id="deliveryAreaMuharraq"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formState.deliveryAreaMuharraq || 0}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaMuharraq",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") {
                            e.target.value = "";
                          }
                          // Scroll into view on mobile
                          setTimeout(() => {
                            e.target.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }, 100);
                        }}
                        className="ltr-text"
                        placeholder="1.5"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h4 className="font-medium auto-text">
                      {language === "ar" ? "المنطقة الثالثة" : "Area 3"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="deliveryAreaOtherNameEn"
                          className="auto-text"
                        >
                          {language === "ar"
                            ? "الاسم بالإنجليزية"
                            : "Name (English)"}
                        </Label>
                        <Input
                          id="deliveryAreaOtherNameEn"
                          value={formState.deliveryAreaOtherNameEn || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "deliveryAreaOtherNameEn",
                              e.target.value,
                            )
                          }
                          placeholder="Other Cities"
                          className="auto-text"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="deliveryAreaOtherNameAr"
                          className="auto-text"
                        >
                          {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
                        </Label>
                        <Input
                          id="deliveryAreaOtherNameAr"
                          value={formState.deliveryAreaOtherNameAr || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "deliveryAreaOtherNameAr",
                              e.target.value,
                            )
                          }
                          placeholder="م��ن أخرى"
                          className="auto-text"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deliveryAreaOther" className="auto-text">
                        {language === "ar" ? "رسوم التوصيل" : "Delivery Fee"}
                      </Label>
                      <Input
                        id="deliveryAreaOther"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formState.deliveryAreaOther || 0}
                        onChange={(e) =>
                          handleInputChange(
                            "deliveryAreaOther",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        onFocus={(e) => {
                          if (e.target.value === "0") {
                            e.target.value = "";
                          }
                          // Scroll into view on mobile
                          setTimeout(() => {
                            e.target.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }, 100);
                        }}
                        className="ltr-text"
                        placeholder="2.0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t("settings.pickupMessages")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pickupMessageEn" className="auto-text">
                      {t("settings.pickupMessageEn")}
                    </Label>
                    <Textarea
                      id="pickupMessageEn"
                      value={formState.pickupMessageEn || ""}
                      onChange={(e) =>
                        handleInputChange("pickupMessageEn", e.target.value)
                      }
                      className="auto-text"
                      rows={4}
                      placeholder="Enter pickup instructions in English..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupMessageAr" className="auto-text">
                      {t("settings.pickupMessageAr")}
                    </Label>
                    <Textarea
                      id="pickupMessageAr"
                      value={formState.pickupMessageAr || ""}
                      onChange={(e) =>
                        handleInputChange("pickupMessageAr", e.target.value)
                      }
                      className="auto-text"
                      rows={4}
                      placeholder="أدخل ت��ليمات الاستلام بالعربية..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {t("settings.deliveryMessages")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryMessageEn" className="auto-text">
                      {t("settings.deliveryMessageEn")}
                    </Label>
                    <Textarea
                      id="deliveryMessageEn"
                      value={formState.deliveryMessageEn || ""}
                      onChange={(e) =>
                        handleInputChange("deliveryMessageEn", e.target.value)
                      }
                      className="auto-text"
                      rows={4}
                      placeholder="Enter delivery instructions in English..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryMessageAr" className="auto-text">
                      {t("settings.deliveryMessageAr")}
                    </Label>
                    <Textarea
                      id="deliveryMessageAr"
                      value={formState.deliveryMessageAr || ""}
                      onChange={(e) =>
                        handleInputChange("deliveryMessageAr", e.target.value)
                      }
                      className="auto-text"
                      rows={4}
                      placeholder="أدخل تعليمات التوصيل بالع��بية..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admin Settings */}
          {activeTab === "admin" && (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Admin Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t("settings.adminInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="adminEmail" className="auto-text">
                      {t("settings.adminEmail")}
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formState.adminEmail}
                      onChange={(e) =>
                        handleInputChange("adminEmail", e.target.value)
                      }
                      placeholder="admin@example.com"
                      className="ltr-text"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t("settings.changePassword")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="auto-text">
                      {t("settings.currentPassword")}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={formState.currentPassword || ""}
                      onChange={(e) =>
                        handleInputChange("currentPassword", e.target.value)
                      }
                      placeholder="••���•••••"
                      className="ltr-text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="auto-text">
                      {t("settings.newPassword")}
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formState.newPassword || ""}
                      onChange={(e) =>
                        handleInputChange("newPassword", e.target.value)
                      }
                      placeholder="••••••••"
                      className="ltr-text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="auto-text">
                      {t("settings.confirmPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formState.confirmPassword || ""}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="••••••••"
                      className="ltr-text"
                    />
                  </div>
                  {formState.newPassword &&
                    formState.confirmPassword &&
                    formState.newPassword !== formState.confirmPassword && (
                      <p className="text-sm text-red-600 auto-text">
                        {t("settings.passwordsDoNotMatch")}
                      </p>
                    )}
                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      !formState.currentPassword ||
                      !formState.newPassword ||
                      !formState.confirmPassword ||
                      formState.newPassword !== formState.confirmPassword ||
                      isChangingPassword
                    }
                    className="w-full"
                  >
                    {isChangingPassword
                      ? t("common.loading")
                      : t("settings.changePassword")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
