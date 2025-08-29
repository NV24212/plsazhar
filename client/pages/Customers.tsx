import { useState } from "react";
import { useData, Customer } from "@/contexts/DataContext";
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
import { Plus, Search, Edit, Trash2, Users, Phone, MapPin } from "lucide-react";

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    home: "",
    road: "",
    block: "",
    town: "",
  });

  const filteredCustomers = customers
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      home: "",
      road: "",
      block: "",
      town: "",
    });
    setEditingCustomer(null);
  };

  const openDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        home: customer.home || "",
        road: customer.road || "",
        block: customer.block || "",
        town: customer.town || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addressParts = [
        formData.home && `House ${formData.home}`,
        formData.road && `Road ${formData.road}`,
        formData.block && `Block ${formData.block}`,
        formData.town,
      ].filter(Boolean);
      const combinedAddress =
        addressParts.length > 0 ? addressParts.join(", ") : formData.address;

      const customerData = { ...formData, address: combinedAddress };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
      } else {
        await addCustomer(customerData);
      }
      closeDialog();
    } catch (error) {
      showAlert({
        title: t("message.error"),
        message: t("message.customerSaveError"),
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: t("customers.delete"),
      message: t("message.deleteConfirm"),
      type: "danger",
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
    });

    if (confirmed) {
      try {
        await deleteCustomer(id);
        showAlert({
          title: t("message.success"),
          message: t("message.customerDeleted"),
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

  return (
    <Card className="font-sans">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("customers.title")}</CardTitle>
            <CardDescription>{t("customers.subtitle")}</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("customers.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t("customers.addNew")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingCustomer
                      ? t("customers.editCustomer")
                      : t("customers.addCustomer")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("customers.customerName")}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {t("customers.customerPhone")}
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("customers.customerAddress")}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={formData.home}
                        onChange={(e) =>
                          setFormData({ ...formData, home: e.target.value })
                        }
                        placeholder={t("customers.customerHome")}
                      />
                      <Input
                        value={formData.road}
                        onChange={(e) =>
                          setFormData({ ...formData, road: e.target.value })
                        }
                        placeholder={t("customers.customerRoad")}
                      />
                      <Input
                        value={formData.block}
                        onChange={(e) =>
                          setFormData({ ...formData, block: e.target.value })
                        }
                        placeholder={t("customers.customerBlock")}
                      />
                      <Input
                        value={formData.town}
                        onChange={(e) =>
                          setFormData({ ...formData, town: e.target.value })
                        }
                        placeholder={t("customers.customerTown")}
                        required
                      />
                    </div>
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
                      {editingCustomer
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
        {filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{customer.name}</CardTitle>
                    <div className="p-2 bg-muted rounded-lg">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{customer.address}</span>
                  </div>
                </CardContent>
                <div className="p-4 border-t flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => openDialog(customer)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(customer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">
              {t("empty.noCustomersFound")}
            </h3>
            <p className="mt-2">
              {searchTerm
                ? t("empty.adjustSearch")
                : t("empty.addFirstCustomer")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
