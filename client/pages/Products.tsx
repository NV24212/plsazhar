import { useState } from "react";
import {
  useData,
  Product,
  ProductVariant,
  Category,
} from "@/contexts/DataContext";
import { useDialog } from "@/contexts/DialogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Search, Edit, Trash2, Package, X } from "lucide-react";

export default function Products() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    getCategoryById,
    uploadImage,
  } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t, translateCategory } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    images: [] as string[],
    variants: [] as ProductVariant[],
    total_stock: 1,
    category_id: "",
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const generateVariantId = () => "v" + Date.now().toString();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      images: [],
      variants: [],
      total_stock: 1,
      category_id: "",
    });
    setEditingProduct(null);
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        images: [...product.images],
        variants: [...product.variants],
        total_stock: product.total_stock || 0,
        category_id: product.category_id || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: generateVariantId(), name: "", stock: 1, image: "" },
      ],
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant,
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const getTotalStock = () => {
    if (formData.variants.length > 0) {
      return formData.variants.reduce((acc, v) => acc + v.stock, 0);
    }
    return formData.total_stock;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        total_stock: getTotalStock(),
        category_id:
          formData.category_id?.trim() === "" ? null : formData.category_id,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
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
    }
  };

  const handleDeleteProduct = async (id: string) => {
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
        showAlert({
          title: t("message.success"),
          message: t("message.productDeleted"),
          type: "success",
        });
      } catch (error) {
        showAlert({
          title: t("message.error"),
          message: t("message.error"),
          type: "error",
        });
      }
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "bg-red-500";
    if (stock < 10) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("products.title")}</CardTitle>
            <CardDescription>{t("products.subtitle")}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("products.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("products.addNew")}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct
                      ? t("products.editProduct")
                      : t("products.addProduct")}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct
                      ? t("products.editProduct")
                      : t("products.addProduct")}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                      <TabsTrigger value="variants">Variants</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="e.g. Organic Honey"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (BD)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                price: parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Describe the product"
                          required
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          value={formData.category_id}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              category_id: e.target.value,
                            }))
                          }
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {translateCategory(category.name)}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData.variants.length === 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            value={formData.total_stock}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                total_stock: parseInt(e.target.value) || 0,
                              }))
                            }
                            placeholder="0"
                            required
                          />
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="images" className="pt-6">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Images</Label>
                        <p className="text-sm text-muted-foreground">
                          Upload up to 10 images for your product.
                        </p>
                      </div>
                      <ImageUpload
                        images={formData.images}
                        onImagesChange={(images) =>
                          setFormData((prev) => ({ ...prev, images }))
                        }
                        maxImages={10}
                      />
                    </TabsContent>

                    <TabsContent value="variants" className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">Variants</h3>
                            <p className="text-sm text-muted-foreground">
                              Add different versions of your product, like
                              sizes or colors.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={addVariant}
                            variant="outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Variant
                          </Button>
                        </div>

                        {formData.variants.length > 0 ? (
                          <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                              <Card key={variant.id || index} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor={`variant-name-${index}`}>
                                      Variant Name
                                    </Label>
                                    <Input
                                      id={`variant-name-${index}`}
                                      value={variant.name}
                                      onChange={(e) =>
                                        updateVariant(
                                          index,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. Small"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`variant-stock-${index}`}>
                                      Stock
                                    </Label>
                                    <Input
                                      id={`variant-stock-${index}`}
                                      type="number"
                                      min="0"
                                      value={variant.stock}
                                      onChange={(e) =>
                                        updateVariant(
                                          index,
                                          "stock",
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      placeholder="0"
                                      required
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="destructive"
                                      onClick={() => removeVariant(index)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Package className="w-12 h-12 mx-auto mb-2" />
                            <p>No variants added yet.</p>
                            <p className="text-sm">
                              Add a variant to manage stock for different
                              options.
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mt-4">
                          <span className="font-medium">Total Stock:</span>
                          <span className="text-xl font-bold text-primary">
                            {getTotalStock()}
                          </span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProduct ? "Save Changes" : "Create Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const category = getCategoryById(product.category_id || "");
              const stock = product.total_stock || 0;

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden flex flex-col group"
                >
                  <div className="relative">
                    <div className="aspect-square w-full bg-gray-50">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-9 h-9"
                        onClick={() => openDialog(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="w-9 h-9"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div
                      className={`absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium text-white ${getStockStatus(stock)}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${getStockStatus(stock)}`}
                      ></div>
                      {stock} in stock
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex-grow">
                      {category && (
                        <Badge variant="outline" className="mb-2">
                          {translateCategory(category.name)}
                        </Badge>
                      )}
                      <h3 className="text-base font-semibold text-gray-800 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground h-10 overflow-hidden">
                        {product.description}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-primary mt-4 pt-4 border-t">
                      {product.price.toFixed(2)} BD
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Products Found</h3>
            <p className="mt-2">
              {searchTerm
                ? "Try adjusting your search."
                : "Get started by adding your first product."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
