import { DollarSign, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "processing":
      return "text-blue-700 bg-blue-100";
    case "ready":
      return "text-yellow-700 bg-yellow-100";
    case "delivered":
      return "text-green-700 bg-green-100";
    case "picked-up":
      return "text-purple-700 bg-purple-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

const getStatusText = (status: string, t: (key: string) => string) => {
  switch (status) {
    case "processing":
      return t("orders.processing");
    case "ready":
      return t("orders.ready");
    case "delivered":
      return t("orders.delivered");
    case "picked-up":
      return t("orders.pickedUp");
    default:
      return status;
  }
};

export default function Dashboard() {
  const { orders, customers, products, getCustomerById, getProductById } =
    useData();
  const { t } = useLanguage();

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter(
    (order) => order.status === "processing",
  ).length;

  const stats = [
    {
      title: t("dashboard.totalRevenue"),
      value: `BH ${totalRevenue.toFixed(2)}`,
      description: `${t("dashboard.totalOrders")}: ${orders.length}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t("dashboard.totalOrders"),
      value: orders.length.toString(),
      description: `${customers.length} ${t("nav.customers")}`,
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("revenue.avgOrderValue"),
      value: `BH ${avgOrderValue.toFixed(2)}`,
      description: t("orders.orderTotal"),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t("orders.processing"),
      value: pendingOrders.toString(),
      description: t("orders.processing"),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const recentOrders = orders
    .filter(
      (order) => order.createdAt && !isNaN(new Date(order.createdAt).getTime()),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5)
    .map((order) => {
      const customer = getCustomerById(order.customerId);
      const mainProduct = order.items[0]
        ? getProductById(order.items[0].productId)
        : null;
      const itemsCount = order.items.length;
      const orderDate = new Date(order.createdAt);
      const formattedDate =
        orderDate && !isNaN(orderDate.getTime())
          ? orderDate.toISOString().split("T")[0]
          : "Invalid Date";

      return {
        id: `#${order.id}`,
        customer: customer?.name || t("common.unknownCustomer"),
        product:
          itemsCount > 1
            ? `${mainProduct?.name || t("common.product")} +${itemsCount - 1} more`
            : mainProduct?.name || t("common.unknownProduct"),
        amount: `BH ${order.total.toFixed(2)}`,
        status: getStatusText(order.status, t),
        date: formattedDate,
      };
    });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="transition-transform hover:scale-105"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg bg-primary/10`}>
                <stat.icon className={`w-3 h-3 sm:w-4 sm:h-4 text-primary`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            {t("dashboard.recentOrders")}
          </CardTitle>
          <CardDescription>{t("dashboard.recentOrders")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {t("orders.orderId")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {t("orders.customer")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {t("nav.products")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {t("orders.total")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {t("orders.status")}
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {t("orders.date")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b hover:bg-secondary transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-primary">
                          {order.id}
                        </td>
                        <td className="py-3 px-4 text-foreground">
                          {order.customer}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {order.product}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {order.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {order.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-primary text-sm">
                          #{order.id}
                        </p>
                        <p className="text-foreground font-medium">
                          {order.customer}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {order.amount}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <p>{order.product}</p>
                      <p>{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground auto-text">
                {t("dashboard.noOrdersYet")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
