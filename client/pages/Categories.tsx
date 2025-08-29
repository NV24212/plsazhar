import { useState } from "react";
import { useData, Category } from "@/contexts/DataContext";
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
import { Plus, Search, Edit, Trash2, FolderOpen } from "lucide-react";

export default function Categories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } =
    useData();
  const { showConfirm, showAlert } = useDialog();
  const { t, translateCategory } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingCategory(null);
  };

  const openDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showAlert({
        title: t("message.error"),
        message: t("categories.nameRequired"),
        type: "warning",
      });
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await addCategory(formData);
      }
      closeDialog();
    } catch (error) {
      showAlert({
        title: t("message.error"),
        message:
          error instanceof Error
            ? error.message
            : "Failed to save category.",
        type: "error",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const productsUsingCategory = products.filter(
      (p) => p.category_id === id,
    );
    if (productsUsingCategory.length > 0) {
      showAlert({
        title: t("categories.cannotDeleteTitle"),
        message: t("categories.cannotDeleteMessage").replace(
          "{count}",
          String(productsUsingCategory.length),
        ),
        type: "warning",
      });
      return;
    }

    const confirmed = await showConfirm({
      title: t("categories.deleteTitle"),
      message: t("categories.deleteMessage"),
      type: "danger",
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      try {
        await deleteCategory(id);
        showAlert({
          title: t("message.success"),
          message: t("categories.deleteSuccess"),
          type: "success",
        });
      } catch (error) {
        showAlert({
          title: t("message.error"),
          message:
            error instanceof Error ? error.message : "An error occurred.",
          type: "error",
        });
      }
    }
  };

  const getProductCountForCategory = (categoryId: string) =>
    products.filter((p) => p.category_id === categoryId).length;

  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("nav.categories")}</CardTitle>
            <CardDescription>{t("categories.subtitle")}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("categories.addNew")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory
                      ? t("categories.editTitle")
                      : t("categories.addTitle")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("categories.dialogDescription")}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("categories.nameLabel")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder={t("categories.namePlaceholder")}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit">
                      {editingCategory
                        ? t("common.saveChanges")
                        : t("common.create")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {translateCategory(category.name)}
                      </CardTitle>
                      <CardDescription>
                        {getProductCountForCategory(category.id)}{" "}
                        {t("nav.products")}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-muted rounded-lg">
                      <FolderOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow"></CardContent>
                <div className="p-4 border-t flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => openDialog(category)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={getProductCountForCategory(category.id) > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <FolderOpen className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">
              {t("categories.noCategoriesFound")}
            </h3>
            <p className="mt-2">
              {searchTerm
                ? t("categories.adjustSearch")
                : t("categories.addFirst")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
