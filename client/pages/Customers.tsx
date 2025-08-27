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
    address: "", // For backward compatibility
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
    .sort((a, b) => {
      // Sort by creation date, newest first
      const dateA = new Date(a.createdAt || "");
      const dateB = new Date(b.createdAt || "");
      return dateB.getTime() - dateA.getTime();
    });

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
      // Combine address fields into a single address string for backend compatibility
      const addressParts = [
        formData.home && `House ${formData.home}`,
        formData.road && `Road ${formData.road}`,
        formData.block && `Block ${formData.block}`,
        formData.town,
      ].filter(Boolean);

      const combinedAddress =
        addressParts.length > 0 ? addressParts.join(", ") : formData.address;

      const customerData = {
        ...formData,
        address: combinedAddress,
      };

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
      confirmText: t("customers.delete"),
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
          message: t("message.error"),
          type: "error",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("customers.title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("customers.subtitle")}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => openDialog()}
              className="bg-dashboard-primary hover:bg-dashboard-primary-light"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("customers.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[95vh] overflow-y-auto rounded-lg sm:rounded-md">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer
                  ? t("customers.editCustomer")
                  : t("customers.addCustomer")}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer
                  ? t("customers.editCustomer")
                  : t("customers.addCustomer")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("customers.customerName")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={t("customers.customerName")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">{t("customers.customerPhone")}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder={t("customers.customerPhone")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("customers.customerAddress")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="home" className="text-sm text-gray-600">
                        {t("customers.customerHome")}
                      </Label>
                      <Input
                        id="home"
                        value={formData.home}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            home: e.target.value,
                          }))
                        }
                        placeholder="123"
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="road" className="text-sm text-gray-600">
                        {t("customers.customerRoad")}
                      </Label>
                      <Input
                        id="road"
                        value={formData.road}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            road: e.target.value,
                          }))
                        }
                        placeholder="456"
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="block" className="text-sm text-gray-600">
                        {t("customers.customerBlock")}
                      </Label>
                      <Input
                        id="block"
                        value={formData.block}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            block: e.target.value,
                          }))
                        }
                        placeholder="789"
                        className="text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="town" className="text-sm text-gray-600">
                        {t("customers.customerTown")}
                      </Label>
                      <Input
                        id="town"
                        value={formData.town}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            town: e.target.value,
                          }))
                        }
                        placeholder="Manama"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-dashboard-primary hover:bg-dashboard-primary-light"
                >
                  {editingCustomer
                    ? t("customers.save")
                    : t("customers.addCustomer")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 [dir=rtl]:left-auto [dir=rtl]:right-3" />
            <Input
              placeholder={t("customers.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 [dir=rtl]:pl-3 [dir=rtl]:pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-10 h-10 bg-dashboard-primary rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  {customer.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {t("customers.title")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{customer.address}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                {t("common.added")}:{" "}
                {new Date(customer.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openDialog(customer)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  {t("customers.edit")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(customer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("empty.noCustomersFound")}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? t("empty.adjustSearch")
                : t("empty.addFirstCustomer")}
            </p>
            <Button
              className="mt-4 bg-dashboard-primary hover:bg-dashboard-primary-light"
              onClick={() => openDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("empty.addCustomer")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
