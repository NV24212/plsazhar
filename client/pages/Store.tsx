import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useData } from "../contexts/DataContext";
import { useSettings } from "@/contexts/SettingsContext";
import { formatPrice } from "@/lib/formatters";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { LoadingScreen } from "../components/ui/loading";
import {
  ShoppingCart,
  Plus,
  Globe,
  Store as StoreIcon,
  Search,
  X,
  Instagram,
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
import Footer from "../components/Footer";

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
  const { t, language, setLanguage, translateCategory } = useLanguage();
  const { getTotalItems, setIsCartOpen, isCartOpen } = useCart();
  const { products, categories, loading, getCategoryById } = useData();
  const { settings } = useSettings();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Instagram link handler
  const openInstagram = () => {
    window.open(
      "https://www.instagram.com/azharstore/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  // Filter products based on search query and category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === selectedCategory,
      );
    }

    // Filter by search query
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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between [dir=rtl]:flex-row-reverse">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 sm:gap-4 [dir=rtl]:flex-row-reverse">
            <img
              src={
                language === "ar"
                  ? "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2F16a76df3c393470e995ec2718d67ab09?format=webp&width=800"
                  : "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2Feb0b70b9250f4bfca41dbc5a78c2ce45?format=webp&width=800"
              }
              alt="Azhar Store Logo"
              className="h-12 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Instagram Button */}
            <Button variant="ghost" size="icon" onClick={openInstagram}>
              <Instagram className="h-5 w-5" />
            </Button>

            {/* Language Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
              variant="ghost"
              onClick={() => setIsCartOpen(true)}
              className="relative"
              size="icon"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Category Filter */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="max-w-2xl mx-auto w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground [dir=rtl]:left-auto [dir=rtl]:right-4" />
              <Input
                type="text"
                placeholder={t("store.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 [dir=rtl]:pr-12 [dir=rtl]:pl-4 h-12 text-base"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-9 w-9 [dir=rtl]:right-auto [dir=rtl]:left-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {filteredProducts.length} {t("store.searchResults")}
              </p>
            )}
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="rounded-full px-4 py-2"
            >
              {t("store.allProducts")}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full px-4 py-2"
              >
                {translateCategory(category.name)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {searchQuery && filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">
              {t("store.noSearchResults")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Try a different search term or clear the search to see all
              products.
            </p>
            <Button variant="outline" onClick={clearSearch}>
              {t("store.clearSearch")}
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <StoreIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">
              {t("empty.noProductsFound")}
            </h3>
            <p className="text-muted-foreground">
              Please check back later for new products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden cursor-pointer group flex flex-col"
              >
                <div
                  className="aspect-square overflow-hidden bg-gray-100"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-50">
                      <StoreIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div
                    className="flex-grow"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <h3 className="font-semibold text-base mb-2 line-clamp-2 hover:text-primary transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-4 border-t">
                    <div className="flex flex-col">
                      <span
                        className="text-lg font-bold text-primary ltr-text"
                        dir="ltr"
                      >
                        {settings &&
                          formatPrice(
                            product.price,
                            settings.currencySymbol,
                            language,
                          )}
                      </span>
                      {(product.total_stock || 0) > 0 && (
                        <span className="text-xs text-green-600 font-medium mt-1">
                          {product.total_stock} {t("products.stock")}
                        </span>
                      )}
                    </div>
                    <Button
                      size="icon"
                      onClick={() => handleAddToCart(product)}
                      disabled={(product.total_stock || 0) === 0}
                      className="shrink-0 h-10 w-10"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>

                  {(product.total_stock || 0) === 0 && (
                    <Badge
                      variant="secondary"
                      className="w-full mt-3 justify-center text-center py-1.5"
                    >
                      {t("store.outOfStock")}
                    </Badge>
                  )}
                </div>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
