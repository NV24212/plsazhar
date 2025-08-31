import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useData } from "../contexts/DataContext";
import { useCart } from "../contexts/CartContext";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for the success screen
const SuccessView = ({ orderMessages, onClose }) => {
  const { t } = useLanguage();
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
          onClick={onClose}
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
  getDeliveryAreaName,
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
      <DialogHeader className="px-4 sm:px-6 py-4 sm:py-6 border-b flex-shrink-0 bg-background">
        <DialogTitle className="text-xl sm:text-2xl font-bold text-center auto-text leading-tight">
          {t("checkout.title")}
        </DialogTitle>
        <div className="flex justify-center mt-4 sm:mt-6">
          <div className="flex items-center space-x-2 sm:space-x-4 [dir=rtl]:space-x-reverse">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-all duration-200 ${
                    step >= stepNum ? "bg-primary text-primary-foreground shadow-lg" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-200 ${
                      step > stepNum ? "bg-primary" : "bg-secondary"
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
                <Card className="border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle>{t("checkout.customerInfo")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("checkout.name")}</Label>
                      <Input id="name" value={customerInfo.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("checkout.phone")}</Label>
                      <Input id="phone" value={customerInfo.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="town">{t("checkout.town")}</Label>
                      <Input id="town" value={customerInfo.town} onChange={(e) => handleInputChange("town", e.target.value)} required />
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
                <Card className="border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle>{t("checkout.deliveryOptions")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">{t("checkout.delivery")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">{t("checkout.pickup")}</Label>
                      </div>
                    </RadioGroup>
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
                <Card className="border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle>{t("checkout.orderSummary")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul>
                      {items.map(item => (
                        <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                          <span>{item.productName} x {item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity, language)}</span>
                        </li>
                      ))}
                    </ul>
                    <Separator className="my-4" />
                    <div className="flex justify-between font-bold">
                      <span>{t("checkout.total")}</span>
                      <span>{formatPrice(totalPrice, language)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
      <div className="border-t p-4 sm:p-6 bg-background flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          {step > 1 && (
            <Button
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
                onClick={handlePlaceOrder}
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
  const pickupAddress: string = language === "ar" ? savedSettings?.pickupAddressAr || "منزل 1348، طريق 416، مجمع 604، سترة القرية" : savedSettings?.pickupAddressEn || "Home 1348, Road 416, Block 604, Sitra Alqarya";
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
        successMessage: language === "ar" ? "شكراً لك على طلبك! سنقوم بتجهيزه خلال 2-4 ساعات وسيصل خلال 1-3 أيام عمل." : "Thank you for your order! We'll process it within 2-4 hours and deliver within 1-3 business days.",
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

  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (open && !orderSuccess) {
      setStep(1);
      setCustomerInfo({ name: "", phone: "", address: "", home: "", road: "", block: "", town: "" });
      setDeliveryType("delivery");
      setDeliveryArea("sitra");
      setIsSubmitting(false);
    }
  }, [open, orderSuccess]);

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

  const handlePlaceOrder = async () => {
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
        await refetchData();
        const orderNum = getOrderNumber(order.id);
        setOrderNumber(orderNum > 0 ? orderNum.toString() : order.id.slice(-6));
      } catch (error) {
        setOrderNumber(order.id.slice(-6));
      }
      setOrderSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      alert(t("errors.orderFailed"));
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
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={orderSuccess ? onClose : handleClose}>
      <DialogContent className="w-[90vw] max-w-md max-h-[90vh] flex flex-col p-0 rounded-[10px] border shadow-lg bg-slate-50 mx-auto dialog-content-scroll">
        <AnimatePresence mode="wait">
          {orderSuccess ? (
            <SuccessView orderMessages={orderMessages} onClose={onClose} />
          ) : (
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
              getDeliveryAreaName={getDeliveryAreaName}
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
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
