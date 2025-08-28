import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Package, Truck } from "lucide-react";
import CheckoutDialog from "./CheckoutDialog";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { t, language, isRTL } = useLanguage();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } =
    useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleQuantityChange = (
    productId: string,
    variantId: string,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      removeItem(productId, variantId);
    } else {
      updateQuantity(productId, variantId, newQuantity);
    }
  };

  const totalPrice = getTotalPrice();

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] max-w-md max-h-[90vh] flex flex-col p-0 rounded-2xl border-gray-700 shadow-lg bg-gray-900 text-gray-100 mx-auto">
          <DialogHeader className="px-4 py-4 border-b border-gray-800">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-100">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="auto-text flex-1">{t("store.cart")}</span>
              {items.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {items.length}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-16 px-6">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-12 w-12 text-gray-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-200 auto-text">
                    {t("store.cartEmpty")}
                  </h3>
                  <p className="text-gray-400 auto-text text-sm">
                    {language === "ar"
                      ? t("store.startShoppingAr")
                      : t("store.startShopping")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-8 py-3 h-auto text-gray-200 border-gray-600 hover:bg-gray-800 hover:text-white"
                >
                  {t("store.continueShopping")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="group relative bg-gray-800 rounded-xl border border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Product Header Section */}
                      <div className="p-4 border-b border-gray-700">
                        <div
                          className={cn(
                            "flex gap-4 items-start",
                            isRTL ? "flex-row-reverse" : "",
                          )}
                        >
                          {/* Product Image */}
                          {item.productImage && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 shrink-0 shadow-sm">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "flex items-start justify-between gap-3",
                                isRTL ? "flex-row-reverse" : "",
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-gray-100 leading-tight auto-text mb-1">
                                  {item.productName}
                                </h4>
                                {item.variantName && (
                                  <p className="text-sm text-gray-300 font-medium auto-text">
                                    {item.variantName}
                                  </p>
                                )}
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeItem(item.productId, item.variantId)
                                }
                                className="shrink-0 h-9 w-9 p-0 text-gray-400 hover:text-red-500 hover:bg-red-900/50 rounded-xl opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Details Section */}
                      <div className="p-4 space-y-4">
                        {/* Unit Price */}
                        <div className="bg-gray-700/50 rounded-xl p-3">
                          <div
                            className={cn(
                              "flex items-center justify-between",
                              isRTL ? "flex-row-reverse" : "",
                            )}
                          >
                            <span className="text-sm font-medium text-gray-300 auto-text">
                              {t("store.unitPrice")}:
                            </span>
                            <span
                              className="text-lg font-bold text-primary-300 ltr-text"
                              dir="ltr"
                            >
                              {formatPrice(item.price, language)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="bg-gray-700/50 rounded-xl p-3">
                          <div
                            className={cn(
                              "flex items-center justify-between",
                              isRTL ? "flex-row-reverse" : "",
                            )}
                          >
                            <span className="text-sm font-medium text-gray-300 auto-text">
                              {t("store.quantity")}:
                            </span>

                            <div className="flex items-center gap-2 bg-gray-800 rounded-xl border border-gray-600 p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.variantId,
                                    item.quantity - 1,
                                  )
                                }
                                className="h-8 w-8 p-0 hover:bg-primary/20 text-gray-300 hover:text-white rounded-lg"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <div className="w-12 text-center">
                                <span className="text-base font-semibold text-gray-100 ltr-text">
                                  {item.quantity}
                                </span>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.variantId,
                                    item.quantity + 1,
                                  )
                                }
                                className="h-8 w-8 p-0 hover:bg-primary/20 text-gray-300 hover:text-white rounded-lg"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                          <div
                            className={cn(
                              "flex justify-between items-center",
                              isRTL ? "flex-row-reverse" : "",
                            )}
                          >
                            <span className="text-sm font-semibold text-primary-200 auto-text">
                              {language === "ar"
                                ? t("common.totalAr")
                                : t("common.total")}
                              :
                            </span>
                            <span
                              className="text-xl font-bold text-primary-300 ltr-text"
                              dir="ltr"
                            >
                              {formatPrice(
                                item.price * item.quantity,
                                language,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <DialogFooter className="flex-col space-y-0 p-0 border-t border-gray-800">
                {/* Summary Section */}
                <div className="w-full bg-gray-950 p-4 sm:p-6">
                  <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 p-4 sm:p-5">
                    <div
                      className={cn(
                        "flex justify-between items-center mb-3",
                        isRTL ? "flex-row-reverse" : "",
                      )}
                    >
                      <span className="auto-text text-gray-300 font-medium text-base sm:text-lg">
                        {t("store.cartTotal")}:
                      </span>
                      <span
                        className="text-xl sm:text-2xl font-bold text-primary-300 ltr-text"
                        dir="ltr"
                      >
                        {formatPrice(totalPrice, language)}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center bg-gray-700 rounded-full px-3 py-1">
                        <span className="text-sm text-gray-300 font-medium">
                          <span className="ltr-text font-bold">
                            {items.length}
                          </span>{" "}
                          {language === "ar"
                            ? items.length === 1
                              ? t("common.itemAr")
                              : t("common.itemsAr")
                            : items.length === 1
                              ? t("common.item")
                              : t("common.items")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gray-900">
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-12 sm:h-14 touch-manipulation bg-primary hover:bg-primary/90 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={items.length === 0}
                  >
                    <Truck className={cn("h-5 w-5", isRTL ? "ml-3" : "mr-3")} />
                    <span className="auto-text">{t("store.checkout")}</span>
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 h-12 touch-manipulation text-sm font-medium rounded-xl border-2 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                    >
                      <span className="auto-text">
                        {t("store.continueShopping")}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1 h-12 touch-manipulation text-sm font-medium rounded-xl border-2 border-red-500/50 text-red-400 hover:bg-red-900/50 hover:text-red-300 hover:border-red-400 transition-colors duration-200"
                      disabled={items.length === 0}
                    >
                      <span className="auto-text">{t("store.clearCart")}</span>
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
