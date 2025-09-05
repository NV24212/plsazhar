import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useData,
  Product,
  Category,
  ProductVariant,
} from "@/contexts/DataContext";
import { useDialog } from "@/contexts/DialogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Package,
  Star,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";

export default function Products() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductVariants,
  } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t, translateCategory } = useLanguage();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    total_stock: 1,
    variants: [] as ProductVariant[],
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        images: product.images || [],
        total_stock: product.total_stock ?? (product as any).totalStock ?? (product as any).stock ?? 1,
        variants: getProductVariants(product.id),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: categories[0]?.id || "",
        images: [],
        total_stock: 1,
        variants: [],
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Instant visual feedback
    const productId = editingProduct?.id || `temp_${Date.now()}`;
    setSavingProductId(productId);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        images: formData.images,
        // only include total_stock when no variants exist
        total_stock: formData.variants && formData.variants.length > 0 ? undefined : Number(formData.total_stock ?? 0),
        variants: formData.variants,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success(t("message.productUpdated"));
      } else {
        await addProduct(productData);
        toast.success(t("message.productAdded"));
      }

      closeDialog();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("message.productSaveError");
      showAlert({
        title: t("message.error"),
        message: errorMessage,
        type: "error",
      });
    } finally {
      setSavingProductId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    // Instant visual feedback
    setDeletingProductId(id);

    const confirmed = await showConfirm({
      title: t("products.delete"),
      message: t("message.deleteConfirm"),
      type: "danger",
      confirmText: t("products.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      try {
        await deleteProduct(id);
        toast.success(t("message.productDeleted"));
      } catch (error) {
        showAlert({
          title: t("message.error"),
          message: t("message.error"),
          type: "error",
        });
      }
    }
    
    setDeletingProductId(null);
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `temp_${Date.now()}`,
          name: "",
          price: 0,
          stock: 0,
        },
      ],
    }));
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t("products.title")}
        </h1>
        <Button
          onClick={() => openDialog()}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm transform transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("products.addNew")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("products.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder={t("products.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("products.allCategories")}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {translateCategory(category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`${deletingProductId === product.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Card className="group hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <CardHeader className="p-4">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {product.featured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        {t("products.featured")}
                      </Badge>
                    )}
                    {!product.isVisible && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2"
                      >
                        <EyeOff className="w-3 h-3 mr-1" />
                        {t("products.hidden")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg leading-tight truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-primary">
                          {product.price.toFixed(2)} BD
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {translateCategory(
                            categories.find((c) => c.id === product.category)
                          )}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog(product)}
                          className="p-2 transform transition-all hover:scale-110"
                          disabled={savingProductId === product.id}
                        >
                          {savingProductId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2 text-destructive hover:text-destructive hover:bg-destructive/10 transform transition-all hover:scale-110"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingProductId === product.id}
                        >
                          {deletingProductId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm || selectedCategory !== "all"
              ? t("empty.noProductsFound")
              : t("empty.noProducts")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "all"
              ? t("empty.adjustSearch")
              : t("empty.addFirstProduct")}
          </p>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            {t("empty.createProduct")}
          </Button>
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto rounded-lg sm:rounded-md bg-white border border-gray-200">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? t("products.editProduct") : t("products.addProduct")}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? t("products.editProduct") : t("products.addProduct")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <Tabs defaultValue="details">
                <TabsList className="bg-gray-100 p-1 rounded-lg grid grid-cols-3">
                  <TabsTrigger value="types" className="text-center w-full">
                    {t("products.variants")}
                  </TabsTrigger>
                  <TabsTrigger value="images" className="text-center w-full">
                    {t("products.images")}
                  </TabsTrigger>
                  <TabsTrigger value="details" className="text-center w-full">
                    {t("products.productName")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="types" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        {t("products.variants")}
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddVariant}
                        className="transform transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t("products.addVariant")}
                      </Button>
                    </div>

                    {formData.variants.map((variant, index) => (
                      <motion.div
                        key={variant.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 border rounded-lg space-y-3 bg-muted/50"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            {t("products.variant")} {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVariant(index)}
                            className="text-destructive hover:text-destructive transform transition-all hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">
                              {t("products.variantName")}
                            </Label>
                            <Input
                              value={variant.name}
                              onChange={(e) =>
                                handleUpdateVariant(index, "name", e.target.value)
                              }
                              placeholder={t("products.variantName")}
                              size="sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t("products.price")}</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variant.price}
                              onChange={(e) =>
                                handleUpdateVariant(
                                  index,
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                              size="sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">{t("products.stock")}</Label>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) =>
                                handleUpdateVariant(
                                  index,
                                  "stock",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="0"
                              size="sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="images" className="pt-4">
                  <div className="space-y-2">
                    <Label>{t("products.images")}</Label>
                    <ImageUpload
                      images={formData.images}
                      onImagesChange={(images) =>
                        setFormData((prev) => ({ ...prev, images }))
                      }
                      maxImages={5}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("products.productName")}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder={t("products.productName")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameAr">{t("products.productNameAr")}</Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                        }
                        placeholder={t("products.productNameAr")}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">{t("products.description")}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder={t("products.description")}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionAr">{t("products.descriptionAr")}</Label>
                      <Textarea
                        id="descriptionAr"
                        value={formData.descriptionAr}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            descriptionAr: e.target.value,
                          }))
                        }
                        placeholder={t("products.descriptionAr")}
                        dir="rtl"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t("products.price")}</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">{t("products.category")}</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("products.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {translateCategory(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Stock input - show only when no variants are present */}
                  {(!formData.variants || formData.variants.length === 0) && (
                    <div className="mt-4 space-y-2 sm:w-1/3">
                      <Label htmlFor="total_stock">{t("products.stock")}</Label>
                      <Input
                        id="total_stock"
                        type="number"
                        min="0"
                        value={formData.total_stock}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, total_stock: parseInt(e.target.value || "0") }))
                        }
                        placeholder="0"
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                {t("common.cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={savingProductId !== null}
                className="transform transition-all hover:scale-105"
              >
                {savingProductId ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  t("common.save")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
