import { useState, useEffect } from "react";
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
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Eye,
  Package,
  Truck,
  Shield,
  Award,
  Check,
  AlertCircle,
  Sparkles,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
  total_stock: number;
  category_id?: string;
}

interface AddToCartDialogProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export default function AddToCartDialog({
  product,
  open,
  onClose,
}: AddToCartDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0].id);
    }
    setQuantity(1);
    setSelectedImageIndex(0);
  }, [product]);

  const selectedVariantData = product?.variants?.find(
    (v) => v.id === selectedVariant,
  );

  const maxStock = selectedVariantData?.stock || product?.total_stock || 0;
  const isOutOfStock = maxStock === 0;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;

    setIsAdding(true);
    try {
      addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || "",
        variantId: selectedVariant || "default",
        variantName: selectedVariantData?.name || "",
        price: product.price,
        quantity,
      });

      // Show success animation
      await new Promise(resolve => setTimeout(resolve, 500));
      onClose();
    } finally {
      setIsAdding(false);
    }
  };

  const canAddMore = quantity < maxStock;
  const canRemove = quantity > 1;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] grid grid-rows-[auto_1fr_auto] p-0 rounded-xl shadow-2xl bg-white/95 backdrop-blur-strong">
        {/* Enhanced Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-accent/5">
          <DialogTitle className="text-xl font-bold auto-text text-balance leading-tight">
            {product.name}
          </DialogTitle>
          <div className={`flex items-center gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Badge variant="success" className="text-xs">
              <Award className="h-3 w-3 mr-1" />
              <span className="auto-text">منتج أصلي</span>
            </Badge>
            <Badge variant="info" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              <span className="auto-text">ضمان الجودة</span>
            </Badge>
          </div>
        </DialogHeader>

        {/* Enhanced Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gradient-to-br from-secondary to-accent/20 rounded-xl overflow-hidden shadow-lg">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground auto-text">
                        {t("products.noImages")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Image Navigation Dots */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200",
                          selectedImageIndex === index
                            ? "bg-white shadow-md w-6"
                            : "bg-white/50 hover:bg-white/75"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0",
                        selectedImageIndex === index
                          ? "border-primary shadow-md"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Price Section */}
              <Card variant="elevated" className="p-4 bg-gradient-to-r from-primary/5 to-accent/10">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <p className="text-sm text-muted-foreground auto-text">السعر</p>
                    <span className="text-3xl font-bold text-primary price-text">
                      {formatPrice(product.price, language)}
                    </span>
                  </div>
                  <div className="text-center">
                    <Badge variant="success" className="px-3 py-1">
                      <Gift className="h-3 w-3 mr-1" />
                      <span className="auto-text">شحن مجاني</span>
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-semibold text-lg auto-text">الوصف</h4>
                <p className="text-muted-foreground leading-relaxed auto-text">
                  {product.description}
                </p>
              </div>

              {/* Variants Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold auto-text">اختر النوع</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {product.variants.map((variant) => (
                      <Card
                        key={variant.id}
                        variant={selectedVariant === variant.id ? "outline" : "default"}
                        className={cn(
                          "cursor-pointer transition-all duration-200 p-3",
                          selectedVariant === variant.id && "ring-2 ring-primary bg-primary/5",
                          variant.stock === 0 && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => variant.stock > 0 && setSelectedVariant(variant.id)}
                      >
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="flex items-center gap-3">
                            {selectedVariant === variant.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <span className="font-medium auto-text">{variant.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={variant.stock > 0 ? "success" : "destructive"}
                              size="sm"
                            >
                              {variant.stock > 0 ? (
                                <span className="auto-text">متوفر ({variant.stock})</span>
                              ) : (
                                <span className="auto-text">نفد المخزون</span>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-3">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h4 className="font-semibold auto-text">الكمية</h4>
                  <Badge variant="outline" className="text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    <span className="auto-text">متوفر: {maxStock}</span>
                  </Badge>
                </div>

                <Card className="p-4">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={!canRemove}
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <div className="min-w-[3rem] text-center">
                        <span className="text-lg font-bold price-text">{quantity}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                        disabled={!canAddMore}
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground auto-text">الإجمالي</p>
                      <span className="text-xl font-bold text-primary price-text">
                        {formatPrice(product.price * quantity, language)}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Features */}
              <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 auto-text">شحن سريع</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 auto-text">ضمان الجودة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700 auto-text">منتج أصلي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 auto-text">خدمة ممتازة</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </ScrollArea>

        {/* Enhanced Footer */}
        <DialogFooter className="p-0 border-t bg-gradient-to-r from-background to-accent/5">
          <div className="w-full p-6 space-y-4">
            {isOutOfStock ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium auto-text">{t("store.outOfStock")}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full h-12 btn-animate"
                >
                  <span className="auto-text">العودة للمتجر</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className="w-full h-14 btn-animate gradient-primary text-lg font-bold shadow-lg hover:shadow-xl"
                >
                  {isAdding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      <span className="auto-text">جاري الإضافة...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                      <span className="auto-text">إضافة للسلة</span>
                      <Sparkles className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 btn-animate"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    <span className="auto-text">مشاهدة التفاصيل</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 btn-animate hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    <span className="auto-text">المفضلة</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
