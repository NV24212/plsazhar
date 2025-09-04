import { useState, useMemo } from "react";
import { useData, Category } from "@/contexts/DataContext";
import { useDialog } from "@/contexts/DialogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Tag,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Categories() {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t, translateCategory } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
  });

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.nameAr && 
         category.nameAr.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [categories, searchTerm]);

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(product => product.category === categoryId).length;
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        nameAr: category.nameAr || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        nameAr: "",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showAlert({
        title: t("message.error"),
        message: t("categories.nameRequired"),
        type: "error",
      });
      return;
    }

    // Instant visual feedback
    const categoryId = editingCategory?.id || `temp_${Date.now()}`;
    setSavingCategoryId(categoryId);

    try {
      const categoryData = {
        name: formData.name.trim(),
        nameAr: formData.nameAr.trim(),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        toast.success(t("categories.updateSuccess"));
      } else {
        await addCategory(categoryData);
        toast.success(t("categories.addSuccess"));
      }
      
      closeDialog();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save category. Please try again.";
      showAlert({
        title: t("message.error"),
        message: errorMessage,
        type: "error",
      });
    } finally {
      setSavingCategoryId(null);
    }
  };

  const handleDelete = async (id: string) => {
    // Check if category is being used by products
    const productsUsingCategory = products.filter(product => product.category === id);
    if (productsUsingCategory.length > 0) {
      showAlert({
        title: t("categories.cannotDeleteTitle"),
        message: t("categories.cannotDeleteMessage").replace("{count}", productsUsingCategory.length.toString()),
        type: "warning",
      });
      return;
    }

    // Instant visual feedback
    setDeletingCategoryId(id);

    const confirmed = await showConfirm({
      title: t("categories.deleteTitle"),
      message: t("categories.deleteMessage"),
      type: "danger",
      confirmText: t("categories.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      try {
        await deleteCategory(id);
        toast.success(t("categories.deleteSuccess"));
      } catch (error) {
        showAlert({
          title: t("message.error"),
          message: t("message.error"),
          type: "error",
        });
      }
    }
    
    setDeletingCategoryId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t("categories.title")}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => openDialog()}
              className="bg-primary hover:bg-primary/90 text-white shadow-sm transform transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("categories.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[95vh] overflow-y-auto rounded-lg sm:rounded-md bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle>
                {editingCategory
                  ? t("categories.editCategory")
                  : t("categories.addCategory")}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? t("categories.editCategory")
                  : t("categories.addCategory")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("categories.categoryName")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={t("categories.categoryName")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nameAr">{t("categories.categoryNameAr")}</Label>
                  <Input
                    id="nameAr"
                    value={formData.nameAr}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nameAr: e.target.value }))
                    }
                    placeholder={t("categories.categoryNameAr")}
                    dir="rtl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={savingCategoryId !== null}
                  className="transform transition-all hover:scale-105"
                >
                  {savingCategoryId ? (
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t("categories.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCategories.map((category) => {
            const productCount = getCategoryProductCount(category.id);
            return (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`${deletingCategoryId === category.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Card className="group hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Tag className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold truncate">
                            {translateCategory(category)}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <Package className="w-3 h-3 mr-1" />
                              {productCount} {t("categories.products")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {new Date(category.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("categories.englishName")}:</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      {category.nameAr && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("categories.arabicName")}:</span>
                          <span className="font-medium" dir="rtl">{category.nameAr}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(category)}
                        className="flex-1 transform transition-all hover:scale-105"
                        disabled={savingCategoryId === category.id}
                      >
                        {savingCategoryId === category.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-1" />
                            {t("common.edit")}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 transform transition-all hover:scale-105"
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingCategoryId === category.id || productCount > 0}
                      >
                        {deletingCategoryId === category.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCategories.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm 
              ? t("empty.noCategoriesFound") 
              : t("empty.noCategories")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? t("empty.adjustSearch") 
              : t("empty.addFirstCategory")}
          </p>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            {t("empty.createCategory")}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
