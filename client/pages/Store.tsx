import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useData } from "../contexts/DataContext";
import { formatPrice } from "@/lib/formatters";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LoadingScreen } from "../components/ui/loading";
import { Card, CardContent } from "../components/ui/card";
import {
  ShoppingCart,
  Plus,
  Globe,
  Search,
  X,
  Instagram,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import AddToCartDialog from "../components/AddToCartDialog";
import CartSidebar from "../components/CartSidebar";

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

export default function Store() {
  const navigate = useNavigate();
  const { t, language, setLanguage, translateCategory, isRTL } = useLanguage();
  const { getTotalItems, setIsCartOpen, isCartOpen } = useCart();
  const { products, categories, loading, getCategoryById } = useData();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const openInstagram = () => {
    window.open(
      "https://www.instagram.com/azharstore/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategory,
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setIsAddToCartOpen(true);
  };

  const cartItemsCount = getTotalItems();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-strong bg-background/90 border-b shadow-sm">
        <div className="container-safe mx-auto px-4 py-4">
          <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Logo Section */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-16 sm:h-20 lg:h-24 xl:h-28 flex items-center">
                <img
                  src={
                    language === "ar"
                      ? "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2F16a76df3c393470e995ec2718d67ab09?format=webp&width=800"
                      : "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2Feb0b70b9250f4bfca41dbc5a78c2ce45?format=webp&width=800"
                  }
                  alt="أزهار ستور - azharstore"
                  className="h-full w-auto object-contain transition-transform duration-200 hover:scale-105"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Instagram Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={openInstagram}
                className="h-12 px-4 btn-animate"
              >
                <Instagram className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline ml-2 auto-text">
                  Instagram
                </span>
              </Button>

              {/* Language Switch */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 px-4 btn-animate"
                  >
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline ml-2 auto-text">
                      {language === "ar" ? "العربية" : "English"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("ar")}>
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart Button */}
              <Button
                variant="gradient"
                onClick={() => setIsCartOpen(true)}
                className="relative h-12 px-4 btn-animate"
              >
                <ShoppingCart className="h-5 w-5 flex-shrink-0" />
                <span className="hidden sm:inline ml-2 auto-text">
                  {t("store.cart")}
                </span>
                {cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-1 h-6 w-6 text-xs animate-bounce"
                    pulse
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Search and Filter Section */}
      <section className="border-b bg-gradient-to-r from-background to-accent/20">
        <div className="container-safe mx-auto px-4 py-6 space-y-6">
          {/* Hero Text */}
          <div className="text-center space-y-2 fade-in">
            <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent auto-text">
              {t("store.welcome", "مرحباً بكم في متجرنا")}
            </h1>
            <p className="text-muted-foreground auto-text">
              {t("store.subtitle", "اكتشف أفضل المنتجات بأسعار رائعة")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <Input
              type="search"
              placeholder={t("store.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={searchQuery ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={clearSearch}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : undefined}
              isRTL={isRTL}
              className="h-14 text-base"
            />
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2 text-center auto-text slide-in-down">
                {filteredProducts.length} {t("store.searchResults")}
              </p>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="rounded-full h-12 px-6 btn-animate"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="auto-text">{t("store.allProducts")}</span>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full h-12 px-6 btn-animate"
              >
                <span className="auto-text">
                  {translateCategory(category.name)}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Product Grid */}
      <main className="container-safe mx-auto px-4 py-8">
        {searchQuery && filteredProducts.length === 0 ? (
          <Card className="text-center py-16 max-w-md mx-auto" variant="ghost">
            <CardContent className="space-y-4">
              <Search className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold auto-text">
                  {t("store.noSearchResults")}
                </h3>
                <p className="text-muted-foreground auto-text">
                  جرب البحث بكلمات مختلفة أو تصفح الفئات
                </p>
              </div>
              <Button
                variant="outline"
                onClick={clearSearch}
                className="btn-animate"
              >
                <span className="auto-text">{t("store.clearSearch")}</span>
              </Button>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="text-center py-16 max-w-md mx-auto" variant="ghost">
            <CardContent className="space-y-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold auto-text">
                  {t("empty.noProductsFound")}
                </h3>
                <p className="text-muted-foreground auto-text">
                  سنضيف منتجات جديدة قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredProducts.map((product, index) => (
              <Card
                key={product.id}
                variant="interactive"
                className={`group overflow-hidden ${index % 2 === 0 ? 'slide-in-up' : 'slide-in-down'}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image */}
                <div
                  className="aspect-square overflow-hidden bg-gradient-to-br from-secondary to-accent/20 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Zap className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground auto-text">
                          {t("products.noImages")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <CardContent className="p-4 space-y-3">
                  <div
                    className="cursor-pointer space-y-2"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors auto-text">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 auto-text">
                      {product.description}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <span className="text-xl font-bold text-primary price-text">
                        {formatPrice(product.price, language)}
                      </span>
                    </div>

                    <Button
                      size="icon"
                      onClick={() => handleAddToCart(product)}
                      disabled={(product.total_stock || 0) === 0}
                      className="shrink-0 h-10 w-10 btn-animate"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {(product.total_stock || 0) === 0 && (
                    <Badge
                      variant="destructive"
                      className="w-full justify-center"
                    >
                      <span className="auto-text">{t("store.outOfStock")}</span>
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add to Cart Dialog */}
      {selectedProduct && (
        <AddToCartDialog
          product={selectedProduct}
          open={isAddToCartOpen}
          onClose={() => {
            setIsAddToCartOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
