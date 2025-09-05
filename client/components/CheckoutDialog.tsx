import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useData } from "../contexts/DataContext";
import { useCart } from "../contexts/CartContext";
import { useDialog } from "../contexts/DialogContext";
import { createCustomer, createOrder } from "../services/api";
import { formatPrice, formatPriceWithSymbol } from "@/lib/formatters";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Check,
  CreditCard,
  Truck,
  Package,
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Order Success Popup Component
const OrderSuccessPopup = ({ isOpen, onClose, orderMessages }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-[10000] w-[90vw] max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 p-6"
        style={{ zIndex: 10000 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 auto-text mb-2">
            {language === "ar" ? "تم استلام الطلب!" : "Order received!"}
          </h2>
          <p className="text-lg text-gray-600 auto-text mb-6">
            {language === "ar" ? "شكراً لك!" : "Thank you!"}
          </p>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 mb-6">
          <p className="text-gray-700 auto-text leading-relaxed">
            {orderMessages.successMessage || (language === "ar" ? "تم استلام طلبك بنجاح. سنقوم بمعالجته قريباً." : "Your order has been received successfully. We'll process it soon.")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={() => { onClose(); navigate('/'); }}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transform transition-all hover:scale-105"
          >
            <span className="auto-text">{language === "ar" ? "متابعة التسوق" : "Continue shopping"}</span>
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg"
          >
            <span className="auto-text">{language === "ar" ? "إغلاق" : "Close"}</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Helper component for the success screen
const SuccessView = ({ orderMessages, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <DialogHeader className="p-6 pb-4 border-b bg-primary/10">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <div>
          <DialogTitle className="text-center text-2xl font-bold text-primary auto-text leading-tight">
            {orderMessages.headline}
          </DialogTitle>
          <p className="text-center text-primary/80 auto-text text-sm mt-2 leading-relaxed">
            {orderMessages.subtext}
          </p>
        </div>
      </DialogHeader>
      <ScrollArea className="flex-1 p-6">
        <div id="checkout-success-bottom" className="flex items-center justify-center min-h-full py-8">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-secondary p-8 rounded-lg border">
              <p className="text-foreground auto-text text-lg leading-relaxed">
                {orderMessages.successMessage}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-white">
        <Button
          type="button"
          onClick={() => { onClose(); navigate('/'); }}
          className="w-full bg-primary hover:bg-primary/90 touch-manipulation h-12 text-base font-semibold"
        >
          <span className="auto-text">{t("checkout.backToStore")}</span>
        </Button>
      </div>
    </motion.div>
  );
};

// Helper component for the checkout form
const CheckoutForm = ({
  step,
  handleBack,
  handleNext,
  handlePlaceOrder,
  isStep1Valid,
  isFormValid,
  isSubmitting,
  customerInfo,
  handleInputChange,
  deliveryType,
  setDeliveryType,
  deliveryArea,
  setDeliveryArea,
  deliveryAreaName,
  sitraAreaName,
  muharraqAreaName,
  otherAreaName,
  deliveryAreaSitra,
  deliveryAreaMuharraq,
  deliveryAreaOther,
  currencySymbol,
  language,
  totalPrice,
  freeDeliveryMinimum,
  items,
  enableDialogScroll,
}) => {
  const { t } = useLanguage();
  return (
    <motion.div
      key="form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <DialogHeader className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 flex-shrink-0 bg-white">
        <DialogTitle className="text-xl sm:text-2xl font-bold text-center auto-text leading-tight">
          {t("checkout.title")}
        </DialogTitle>
        <div className="flex justify-center mt-4 sm:mt-6">
          <div className="flex items-center space-x-2 sm:space-x-4 [dir=rtl]:space-x-reverse">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-all duration-200 ${
                    step >= stepNum ? "bg-primary text-white shadow-lg" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-200 ${
                      step > stepNum ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogHeader>
      <ScrollArea className={`flex-1 min-h-0 ${enableDialogScroll ? "max-h-[80vh]" : ""}`}>
        <div className="p-4 sm:p-6 pb-32 sm:pb-36 auto-text">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>{t("checkout.customerInfo")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("checkout.customerName")}</Label>
                      <Input id="name" value={customerInfo.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("checkout.customerPhone")}</Label>
                      <Input id="phone" value={customerInfo.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="home" className="text-sm text-muted-foreground">{t("checkout.customerHome")}</Label>
                        <Input id="home" value={customerInfo.home} onChange={(e) => handleInputChange("home", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="road" className="text-sm text-muted-foreground">{t("checkout.customerRoad")}</Label>
                        <Input id="road" value={customerInfo.road} onChange={(e) => handleInputChange("road", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="block" className="text-sm text-muted-foreground">{t("checkout.customerBlock")}</Label>
                        <Input id="block" value={customerInfo.block} onChange={(e) => handleInputChange("block", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="town" className="text-sm text-muted-foreground">{t("checkout.customerTown")}</Label>
                        <Input id="town" value={customerInfo.town} onChange={(e) => handleInputChange("town", e.target.value)} required />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>{t("checkout.deliveryOptions")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
                      <div 
                        onClick={() => setDeliveryType("delivery")}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          deliveryType === "delivery" 
                            ? "border-primary bg-primary/10 shadow-md" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="delivery" id="delivery" className="pointer-events-none" />
                            <div className="flex items-center space-x-3">
                              <Truck className="w-5 h-5 text-primary" />
                              <Label htmlFor="delivery" className="font-semibold text-lg cursor-pointer">
                                {t("checkout.delivery")}
                              </Label>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            {formatPriceWithSymbol(deliveryAreaSitra, language)}
                          </Badge>
                        </div>
                      </div>
                      <div 
                        onClick={() => setDeliveryType("pickup")}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          deliveryType === "pickup" 
                            ? "border-primary bg-primary/10 shadow-md" 
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="pickup" id="pickup" className="pointer-events-none" />
                            <div className="flex items-center space-x-3">
                              <Package className="w-5 h-5 text-green-600" />
                              <Label htmlFor="pickup" className="font-semibold text-lg cursor-pointer">
                                {t("checkout.pickup")}
                              </Label>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-700 border-green-200"
                          >
                            {t("checkout.free")}
                          </Badge>
                        </div>
                      </div>
                    </RadioGroup>
                    {deliveryType === "delivery" && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">{t("settings.deliveryAreas")}</h3>
                        <RadioGroup value={deliveryArea} onValueChange={(value) => setDeliveryArea(value as any)}>
                          <div 
                            onClick={() => setDeliveryArea("sitra")}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              deliveryArea === "sitra" 
                                ? "border-primary bg-primary/10 shadow-md" 
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="sitra" id="sitra" className="pointer-events-none" />
                                <Label htmlFor="sitra" className="font-medium cursor-pointer">{sitraAreaName}</Label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {formatPriceWithSymbol(deliveryAreaSitra, language)}
                              </Badge>
                            </div>
                          </div>
                          <div 
                            onClick={() => setDeliveryArea("muharraq")}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              deliveryArea === "muharraq" 
                                ? "border-primary bg-primary/10 shadow-md" 
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="muharraq" id="muharraq" className="pointer-events-none" />
                                <Label htmlFor="muharraq" className="font-medium cursor-pointer">{muharraqAreaName}</Label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {formatPriceWithSymbol(deliveryAreaMuharraq, language)}
                              </Badge>
                            </div>
                          </div>
                          <div 
                            onClick={() => setDeliveryArea("other")}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              deliveryArea === "other" 
                                ? "border-primary bg-primary/10 shadow-md" 
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="other" id="other" className="pointer-events-none" />
                                <Label htmlFor="other" className="font-medium cursor-pointer">{otherAreaName}</Label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {formatPriceWithSymbol(deliveryAreaOther, language)}
                              </Badge>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-gray-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>{t("checkout.orderSummary")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={`${item.productId}-${item.variantId}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{item.productName}</span>
                            <span className="text-sm text-muted-foreground ml-2">x {item.quantity}</span>
                          </div>
                          <span className="font-bold text-primary">{formatPrice(item.price * item.quantity, language)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      {(() => {
                        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                        const fee = deliveryType !== "delivery"
                          ? 0
                          : subtotal >= freeDeliveryMinimum
                            ? 0
                            : (deliveryArea === "sitra" ? deliveryAreaSitra : deliveryArea === "muharraq" ? deliveryAreaMuharraq : deliveryAreaOther);
                        return (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>{t("checkout.subtotal")}</span>
                              <span className="font-medium">{formatPrice(subtotal, language)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>
                                {t("checkout.deliveryFee")} {deliveryType === "delivery" ? `(${deliveryAreaName})` : ""}
                              </span>
                              <span className="font-medium">{fee === 0 ? t("checkout.free") : formatPrice(fee, language)}</span>
                            </div>
                            {deliveryType === "delivery" && (customerInfo.home || customerInfo.road || customerInfo.block || customerInfo.town) && (
                              <div className="text-xs text-muted-foreground bg-gray-50 rounded p-2">
                                <span>{t("checkout.customerAddress")}: </span>
                                <span className="auto-text">
                                  {[customerInfo.home && `House ${customerInfo.home}`, customerInfo.road && `Road ${customerInfo.road}`, customerInfo.block && `Block ${customerInfo.block}`, customerInfo.town].filter(Boolean).join(", ")}
                                </span>
                              </div>
                            )}
                            <Separator className="my-3" />
                            <div className="flex justify-between font-bold text-lg p-3 bg-primary/10 rounded-lg">
                              <span>{t("checkout.total")}</span>
                              <span className="text-primary">{formatPrice(subtotal + fee, language)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
      <div className="border-t border-gray-200 p-4 sm:p-6 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 h-12 sm:h-14 px-4 sm:px-6 touch-manipulation"
              size="sm"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 rtl-flip" />
              <span className="hidden sm:inline auto-text">{t("common.back")}</span>
            </Button>
          )}
          <div className="flex-1">
            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={step === 1 && !isStep1Valid()}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-12 sm:h-14 w-full touch-manipulation"
                size="lg"
              >
                <span className="auto-text">{t("common.next")}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 rtl-flip" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={(e) => handlePlaceOrder(e)}
                disabled={!isFormValid() || isSubmitting}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-12 sm:h-14 w-full touch-manipulation"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="auto-text">{t("checkout.placeOrder")}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const { t, language } = useLanguage();
  const { items, getTotalPrice, clearCart } = useCart();
  const { refetchData, getOrderNumber } = useData();
  const { showAlert } = useDialog();

  const savedSettingsRaw = localStorage.getItem("storeSettings");
  const savedSettings = savedSettingsRaw ? JSON.parse(savedSettingsRaw) : {};
  const currencySymbol: string = savedSettings?.currencySymbol || "BD";
  const deliveryFeeSetting: number = Number(savedSettings?.deliveryFee ?? 1.5);
  const freeDeliveryMinimum: number = Number(savedSettings?.freeDeliveryMinimum ?? 20);
  const deliveryAreaSitra: number = Number(savedSettings?.deliveryAreaSitra ?? 1.0);
  const deliveryAreaMuharraq: number = Number(savedSettings?.deliveryAreaMuharraq ?? 1.5);
  const deliveryAreaOther: number = Number(savedSettings?.deliveryAreaOther ?? 2.0);

  const getDeliveryAreaName = (area: "sitra" | "muharraq" | "other") => {
    switch (area) {
      case "sitra":
        return language === "ar" ? savedSettings?.deliveryAreaSitraNameAr || "سترة" : savedSettings?.deliveryAreaSitraNameEn || "Sitra";
      case "muharraq":
        return language === "ar" ? savedSettings?.deliveryAreaMuharraqNameAr || "المحرق، عسكر، جو" : savedSettings?.deliveryAreaMuharraqlNameEn || "Muharraq, Askar, Jao";
      case "other":
        return language === "ar" ? savedSettings?.deliveryAreaOtherNameAr || "مدن أخرى" : savedSettings?.deliveryAreaOtherNameEn || "Other Cities";
      default:
        return area;
    }
  };
  const pickupAddress: string = language === "ar" ? savedSettings?.pickupAddressAr || "منزل 1348، طري�� 416، مجمع 604، سترة القرية" : savedSettings?.pickupAddressEn || "Home 1348, Road 416, Block 604, Sitra Alqarya";
  const contactPhone: string = savedSettings?.contactPhone || "+973 36283382";
  const enableDialogScroll: boolean = savedSettings?.enableDialogScroll ?? true;
  const autoScrollToSummary: boolean = savedSettings?.autoScrollToSummary ?? true;

  const [orderMessages, setOrderMessages] = useState(() => {
    const getOrderMessages = () => {
      const savedSettings = localStorage.getItem("storeSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return {
          successMessage: language === "ar" ? settings.orderSuccessMessageAr : settings.orderSuccessMessageEn,
          instructions: language === "ar" ? settings.orderInstructionsAr : settings.orderInstructionsEn,
          headline: language === "ar" ? settings.successHeadlineAr || t("orderSuccess.headlineAr") : settings.successHeadlineEn || t("orderSuccess.headline"),
          subtext: language === "ar" ? settings.successSubtextAr || "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك." : settings.successSubtextEn || "We'll share updates by phone as your order progresses.",
          toggles: {
            displayOrderNumber: settings.displayOrderNumber ?? true,
            displayOrderItems: settings.displayOrderItems ?? true,
            displayTotals: settings.displayTotals ?? true,
            displayNextSteps: settings.displayNextSteps ?? true,
            displayContact: settings.displayContact ?? true,
          },
        };
      }
      return {
        successMessage: language === "ar" ? "ش��راً لك على طلبك! سنقوم ��تجهيزه خلال 2-4 ساعات وسيصل خلال 1-3 أيام عمل." : "Thank you for your order! We'll process it within 2-4 hours and deliver within 1-3 business days.",
        instructions: language === "ar" ? "لأي تغييرات أو أسئلة حول طلبك، يرجى التواصل معنا." : "For any changes or questions about your order, please contact us.",
        headline: language === "ar" ? t("orderSuccess.headlineAr") : t("orderSuccess.headline"),
        subtext: language === "ar" ? "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك." : "We'll share updates by phone as your order progresses.",
        toggles: { displayOrderNumber: true, displayOrderItems: true, displayTotals: true, displayNextSteps: true, displayContact: true },
      };
    };
    return getOrderMessages();
  });

  useEffect(() => {
    const updateOrderMessages = () => {
      const savedSettings = localStorage.getItem("storeSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setOrderMessages({
          successMessage: language === "ar" ? settings.orderSuccessMessageAr : settings.orderSuccessMessageEn,
          instructions: language === "ar" ? settings.orderInstructionsAr : settings.orderInstructionsEn,
          headline: language === "ar" ? settings.successHeadlineAr || t("orderSuccess.headlineAr") : settings.successHeadlineEn || t("orderSuccess.headline"),
          subtext: language === "ar" ? settings.successSubtextAr || "سنقوم بإبلاغك بالتحديثات عبر الهاتف حسب تقدم طلبك." : settings.successSubtextEn || "We'll share updates by phone as your order progresses.",
          toggles: {
            displayOrderNumber: settings.displayOrderNumber ?? true,
            displayOrderItems: settings.displayOrderItems ?? true,
            displayTotals: settings.displayTotals ?? true,
            displayNextSteps: settings.displayNextSteps ?? true,
            displayContact: settings.displayContact ?? true,
          },
        });
      }
    };
    if (open) {
      updateOrderMessages();
    }
  }, [open, language, t]);

  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "", home: "", road: "", block: "", town: "" });
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [deliveryArea, setDeliveryArea] = useState<"sitra" | "muharraq" | "other">("sitra");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderItems, setOrderItems] = useState<typeof items>([]);
  const [orderTotalPrice, setOrderTotalPrice] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (open && !showSuccessPopup) {
      setStep(1);
      setCustomerInfo({ name: "", phone: "", address: "", home: "", road: "", block: "", town: "" });
      setDeliveryType("delivery");
      setDeliveryArea("sitra");
      setIsSubmitting(false);
      setOrderSuccess(false);
    }
  }, [open, showSuccessPopup]);

  useEffect(() => {
    if (autoScrollToSummary && step === 3) {
      const el = document.getElementById("checkout-summary-bottom");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [step, autoScrollToSummary]);

  useEffect(() => {
    if (autoScrollToSummary && orderSuccess) {
      const el = document.getElementById("checkout-success-bottom");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [orderSuccess, autoScrollToSummary]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = () => {
    return customerInfo.name.trim() !== "" && customerInfo.phone.trim() !== "" && customerInfo.town.trim() !== "";
  };

  const isFormValid = () => {
    return isStep1Valid() && items.length > 0;
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePlaceOrder = async (e?: React.MouseEvent) => {
    try {
      e?.preventDefault();
    } catch {}
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      const addressParts = [
        customerInfo.home && `House ${customerInfo.home}`,
        customerInfo.road && `Road ${customerInfo.road}`,
        customerInfo.block && `Block ${customerInfo.block}`,
        customerInfo.town,
      ].filter(Boolean);
      const combinedAddress = addressParts.length > 0 ? addressParts.join(", ") : customerInfo.address;
      const customer = await createCustomer({ name: customerInfo.name, phone: customerInfo.phone, address: combinedAddress });
      const orderItemsData = items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, price: item.price }));
      const getDeliveryFeeForArea = () => {
        if (deliveryType !== "delivery") return 0;
        if (totalPrice >= freeDeliveryMinimum) return 0;
        switch (deliveryArea) {
          case "sitra": return deliveryAreaSitra;
          case "muharraq": return deliveryAreaMuharraq;
          case "other": return deliveryAreaOther;
          default: return deliveryFeeSetting;
        }
      };
      const deliveryFee = getDeliveryFeeForArea();
      const orderTotal = totalPrice + deliveryFee;
      const order = await createOrder({ customerId: customer.id, items: orderItemsData, total: orderTotal, status: "processing", deliveryType: deliveryType, deliveryArea: deliveryArea, notes: "" });
      setOrderItems([...items]);
      setOrderTotalPrice(orderTotal);
      try {
        const orderNum = getOrderNumber(order.id);
        setOrderNumber(orderNum > 0 ? orderNum.toString() : order.id.slice(-6));
      } catch (error) {
        setOrderNumber(order.id.slice(-6));
      }
      clearCart();
      setOrderSuccess(true);
      // Close main dialog first, then show popup after a brief delay
      onClose();
      setTimeout(() => {
        setShowSuccessPopup(true);
      }, 100);
    } catch (error) {
      console.error("Error placing order:", error);
      showAlert({
        title: language === "ar" ? "خطأ" : "Error",
        message: language === "ar" ? "فشل في إرسال الطلب. يرجى المحاولة مرة أخرى." : "Failed to place order. Please try again.",
        type: "error",
        buttonText: language === "ar" ? "إغلاق" : "Close",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCustomerInfo({ name: "", phone: "", address: "", home: "", road: "", block: "", town: "" });
    setDeliveryType("delivery");
    setDeliveryArea("sitra");
    setOrderSuccess(false);
    setOrderNumber("");
    setOrderItems([]);
    setOrderTotalPrice(0);
    setShowSuccessPopup(false);
    onClose();
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    refetchData();
    // Reset all form state
    setTimeout(() => {
      setStep(1);
      setCustomerInfo({ name: "", phone: "", address: "", home: "", road: "", block: "", town: "" });
      setDeliveryType("delivery");
      setDeliveryArea("sitra");
      setOrderSuccess(false);
      setOrderNumber("");
      setOrderItems([]);
      setOrderTotalPrice(0);
    }, 200);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="w-[90vw] max-w-md max-h-[90vh] flex flex-col p-0 rounded-lg border border-gray-200 shadow-lg bg-white mx-auto dialog-content-scroll">
          <AnimatePresence mode="wait">
            <CheckoutForm
                step={step}
                handleBack={handleBack}
                handleNext={handleNext}
                handlePlaceOrder={handlePlaceOrder}
                isStep1Valid={isStep1Valid}
                isFormValid={isFormValid}
                isSubmitting={isSubmitting}
                customerInfo={customerInfo}
                handleInputChange={handleInputChange}
                deliveryType={deliveryType}
                setDeliveryType={setDeliveryType}
                deliveryArea={deliveryArea}
                setDeliveryArea={setDeliveryArea}
                deliveryAreaName={getDeliveryAreaName(deliveryArea)}
                sitraAreaName={getDeliveryAreaName("sitra")}
                muharraqAreaName={getDeliveryAreaName("muharraq")}
                otherAreaName={getDeliveryAreaName("other")}
                deliveryAreaSitra={deliveryAreaSitra}
                deliveryAreaMuharraq={deliveryAreaMuharraq}
                deliveryAreaOther={deliveryAreaOther}
                currencySymbol={currencySymbol}
                language={language}
                totalPrice={totalPrice}
                freeDeliveryMinimum={freeDeliveryMinimum}
                items={items}
                enableDialogScroll={enableDialogScroll}
              />
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <OrderSuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        orderMessages={orderMessages}
      />
    </>
  );
}
