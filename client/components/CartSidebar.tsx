import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Truck, 
  Heart,
  Star,
  Gift,
  Sparkles
} from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import CheckoutDialog from "./CheckoutDialog";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { t, language, isRTL } = useLanguage();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isCheckoutOpen) {
      setIsCheckoutOpen(false);
    }
  }, [location]);

  const handleCheckout = () => {
    onClose();
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
  const itemCount = items.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md max-h-[95vh] grid grid-rows-[auto_1fr_auto] p-0 rounded-xl border shadow-xl bg-white/95 backdrop-blur-strong">
          {/* Enhanced Header */}
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <DialogTitle className={`flex items-center gap-3 text-xl font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <ShoppingBag className="h-6 w-6 text-primary" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs animate-pulse"
                  >
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span className="auto-text flex-1">{t("store.cart")}</span>
              <Badge variant="outline" className="text-xs px-2">
                {itemCount} {itemCount === 1 ? 'منتج' : 'منتجات'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Cart Content */}
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <Card variant="ghost" className="w-full max-w-sm">
                <CardContent className="text-center space-y-6 py-8">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground auto-text">
                      {t("store.cartEmpty")}
                    </h3>
                    <p className="text-muted-foreground auto-text text-sm leading-relaxed">
                      {language === "ar"
                        ? "ابدأ التسوق واكتشف منتجاتنا الرائعة"
                        : "Start shopping and discover our amazing products"}
                    </p>
                  </div>
                  <Button
                    variant="gradient"
                    onClick={onClose}
                    className="w-full h-12 btn-animate"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    <span className="auto-text">{t("store.continueShopping")}</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {items.map((item, index) => (
                    <Card
                      key={`${item.productId}-${item.variantId}`}
                      variant="elevated"
                      className={`group overflow-hidden transition-all duration-200 hover:shadow-lg ${
                        index % 2 === 0 ? 'slide-in-up' : 'slide-in-down'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        {/* Product Header */}
                        <div className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {/* Product Image */}
                          {item.productImage && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-secondary to-accent/20 shrink-0 shadow-sm">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          )}

                          {/* Product Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-lg text-foreground leading-tight auto-text line-clamp-1">
                                  {item.productName}
                                </h4>
                                {item.variantName && (
                                  <p className="text-sm text-muted-foreground font-medium auto-text">
                                    {item.variantName}
                                  </p>
                                )}
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeItem(item.productId, item.variantId)}
                                className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Price and Quantity Row */}
                            <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {/* Unit Price */}
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground auto-text">
                                  {t("store.unitPrice")}
                                </span>
                                <span className="text-sm font-bold text-primary price-text">
                                  {formatPrice(item.price, language)}
                                </span>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-1 border">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.productId,
                                      item.variantId,
                                      item.quantity - 1,
                                    )
                                  }
                                  className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>

                                <div className="min-w-[2rem] text-center">
                                  <span className="text-sm font-bold price-text">
                                    {item.quantity}
                                  </span>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.productId,
                                      item.variantId,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Item Total */}
                            <div className="bg-gradient-to-r from-blue-50 to-primary/5 rounded-lg p-3 border border-blue-200/50">
                              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-sm font-semibold text-blue-700 auto-text flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {language === "ar" ? "المجموع" : "Total"}:
                                </span>
                                <span className="text-lg font-bold text-blue-700 price-text">
                                  {formatPrice(item.price * item.quantity, language)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Enhanced Footer */}
              <DialogFooter className="p-0 border-t bg-gradient-to-r from-background to-accent/5">
                {/* Total Summary */}
                <div className="w-full p-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground auto-text">
                        {language === "ar" ? "المجموع الكلي" : "Total Amount"}
                      </p>
                      <span className="text-2xl font-bold text-primary price-text">
                        {formatPrice(totalPrice, language)}
                      </span>
                    </div>
                    <div className="text-center">
                      <Badge variant="success" className="px-3 py-1">
                        <Gift className="h-3 w-3 mr-1" />
                        <span className="auto-text text-xs">توصيل مجاني</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full p-6 space-y-4">
                  <Button
                    onClick={handleCheckout}
                    className="w-full h-14 btn-animate gradient-primary text-lg font-bold shadow-lg hover:shadow-xl"
                    disabled={items.length === 0}
                  >
                    <Truck className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                    <span className="auto-text">{t("store.checkout")}</span>
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 h-12 btn-animate text-sm font-medium"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      <span className="auto-text">{t("store.continueShopping")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1 h-12 btn-animate text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      disabled={items.length === 0}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
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
