import { useState } from "react";
import { useData, Order, OrderItem } from "@/contexts/DataContext";
import { useDialog } from "@/contexts/DialogContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { formatPrice } from "@/lib/formatters";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ShoppingCart,
  User,
  Package,
  Minus,
  Eye,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function Orders() {
  const {
    orders,
    customers,
    products,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    getCustomerById,
    getProductById,
    getVariantById,
    getOrderNumber,
    refetchData,
  } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t, language } = useLanguage();
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    customerId: "",
    items: [] as OrderItem[],
    status: "processing" as Order["status"],
    deliveryType: "delivery" as Order["deliveryType"],
    notes: "",
  });

  const filteredOrders = orders
    .filter((order) => {
      const customer = getCustomerById(order.customerId);
      const orderNumber = getOrderNumber(order.id);
      return (
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `#${orderNumber}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer &&
          customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.created_at || "").getTime() -
        new Date(a.createdAt || a.created_at || "").getTime(),
    );

  const resetForm = () => {
    setFormData({
      customerId: "",
      items: [],
      status: "processing",
      deliveryType: "delivery",
      notes: "",
    });
    setEditingOrder(null);
  };

  const openDialog = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        customerId: order.customerId,
        items: [...order.items],
        status: order.status,
        deliveryType: order.deliveryType,
        notes: order.notes || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const openViewDialog = (order: Order) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setViewingOrder(null);
  };

  const addProductToOrder = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", variantId: "no-variant", quantity: 1, price: 0 },
      ],
    }));
  };

  const removeProductFromOrder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateOrderItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (field === "productId") {
            const product = getProductById(value as string);
            if (product) {
              updatedItem.price = product.price;
              updatedItem.variantId = "no-variant";
            }
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.items.length === 0) {
      showAlert({
        title: "Validation Error",
        message:
          "Please select a customer and add at least one product to create an order.",
        type: "warning",
      });
      return;
    }

    try {
      const orderData = {
        ...formData,
        total: calculateTotal(),
      };

      if (editingOrder) {
        await updateOrder(editingOrder.id, orderData);
      } else {
        await addOrder(orderData);
      }
      closeDialog();
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to save order. Please try again.",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: t("orders.delete"),
      message: t("message.deleteConfirm"),
      type: "danger",
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      try {
        await deleteOrder(id);
        showAlert({
          title: t("message.success"),
          message: t("message.orderDeleted"),
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

  // ... (keep the rest of the functions the same)

  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("orders.title")}</CardTitle>
            <CardDescription>{t("orders.subtitle")}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("orders.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("orders.addNew")}
                </Button>
              </DialogTrigger>
              {/* ... (keep the Add/Edit Dialog content the same for now) */}
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const customer = getCustomerById(order.customerId);
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <CardTitle>
                          Order #{getOrderNumber(order.id)}
                        </CardTitle>
                        <CardDescription>
                          {customer?.name || "Unknown Customer"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {settings &&
                            formatPrice(
                              order.total,
                              settings.currencySymbol,
                              language,
                            )}
                        </Badge>
                        <Badge>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openViewDialog(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDialog(order)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">
              {t("empty.noOrdersFound")}
            </h3>
            <p className="mt-2">
              {searchTerm
                ? t("empty.adjustSearch")
                : t("empty.addFirstOrder")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
