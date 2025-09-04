import { useState, useMemo } from "react";
import { useData, Customer } from "@/contexts/DataContext";
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
  Users,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const { showConfirm, showAlert } = useDialog();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [savingCustomerId, setSavingCustomerId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    home: "",
    road: "",
    block: "",
    town: "",
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const openDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      // Parse address for structured fields
      const addressParts = customer.address.split(", ");
      let home = "", road = "", block = "", town = customer.address;
      
      // Try to parse structured address
      addressParts.forEach(part => {
        if (part.toLowerCase().includes("house")) {
          home = part.replace(/house\s*/i, "").trim();
        } else if (part.toLowerCase().includes("road")) {
          road = part.replace(/road\s*/i, "").trim();
        } else if (part.toLowerCase().includes("block")) {
          block = part.replace(/block\s*/i, "").trim();
        } else if (!part.toLowerCase().includes("house") && !part.toLowerCase().includes("road") && !part.toLowerCase().includes("block")) {
          town = part.trim();
        }
      });

      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        home,
        road,
        block,
        town,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        address: "",
        home: "",
        road: "",
        block: "",
        town: "",
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Instant visual feedback
    const customerId = editingCustomer?.id || `temp_${Date.now()}`;
    setSavingCustomerId(customerId);

    try {
      // Build address from structured fields or use direct address
      const addressParts = [
        formData.home && `House ${formData.home}`,
        formData.road && `Road ${formData.road}`,
        formData.block && `Block ${formData.block}`,
        formData.town,
      ].filter(Boolean);
      
      const combinedAddress = addressParts.length > 1 ? addressParts.join(", ") : formData.address;

      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: combinedAddress,
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData);
        toast.success(t("message.customerUpdated"));
      } else {
        await addCustomer(customerData);
        toast.success(t("message.customerAdded"));
      }
      
      closeDialog();
    } catch (error) {
      showAlert({
        title: t("message.error"),
        message: t("message.customerSaveError"),
        type: "error",
      });
    } finally {
      setSavingCustomerId(null);
    }
  };

  const handleDelete = async (id: string) => {
    // Instant visual feedback
    setDeletingCustomerId(id);

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
        toast.success(t("message.customerDeleted"));
      } catch (error) {
        showAlert({
          title: t("message.error"),
          message: t("message.error"),
          type: "error",
        });
      }
    }
    
    setDeletingCustomerId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">
          {t("customers.title")}
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => openDialog()}
              className="bg-primary hover:bg-primary/90 text-white shadow-sm transform transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("customers.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[95vh] overflow-y-auto rounded-lg sm:rounded-md bg-white border border-gray-200">
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
                      <Label htmlFor="home" className="text-sm text-muted-foreground">
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
                      <Label htmlFor="road" className="text-sm text-muted-foreground">
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
                      <Label htmlFor="block" className="text-sm text-muted-foreground">
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
                      <Label htmlFor="town" className="text-sm text-muted-foreground">
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
                  disabled={savingCustomerId !== null}
                  className="transform transition-all hover:scale-105"
                >
                  {savingCustomerId ? (
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
          placeholder={t("customers.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`${deletingCustomerId === customer.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Card className="group hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          {customer.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {customer.phone}
                      </a>
                    </div>
                    <div className="flex items-start space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground leading-relaxed">
                        {customer.address}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(customer)}
                      className="flex-1 transform transition-all hover:scale-105"
                      disabled={savingCustomerId === customer.id}
                    >
                      {savingCustomerId === customer.id ? (
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
                      onClick={() => handleDelete(customer.id)}
                      disabled={deletingCustomerId === customer.id}
                    >
                      {deletingCustomerId === customer.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCustomers.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm 
              ? t("empty.noCustomersFound") 
              : t("empty.noCustomers")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? t("empty.adjustSearch") 
              : t("empty.addFirstCustomer")}
          </p>
          <Button onClick={() => openDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            {t("empty.createCustomer")}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
