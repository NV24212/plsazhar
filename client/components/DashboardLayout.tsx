import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  BarChart3,
  LogOut,
  Menu,
  X,
  Languages,
  FolderOpen,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getNavigation = (t: (key: string) => string) => [
  { name: t("nav.dashboard"), href: "/admin/", icon: LayoutDashboard },
  { name: t("nav.products"), href: "/admin/products", icon: Package },
  {
    name: t("nav.categories") as any,
    href: "/admin/categories",
    icon: FolderOpen,
  },
  { name: t("nav.orders"), href: "/admin/orders", icon: ShoppingCart },
  { name: t("nav.customers"), href: "/admin/customers", icon: Users },
  { name: t("nav.settings"), href: "/admin/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const { language, setLanguage, isRTL, t } = useLanguage();
  const location = useLocation();

  // Force sidebar to close when language changes to prevent RTL/LTR positioning issues
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [isRTL]);

  const navigation = getNavigation(t);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <div
      className={`flex h-screen bg-gray-50 text-gray-900 ${isRTL ? "rtl" : "ltr"}`}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        key={`sidebar-${language}`}
        className={cn(
          "fixed lg:static inset-y-0 z-50 w-64 bg-white shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out",
          "border-gray-200",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          {
            "translate-x-0": sidebarOpen,
            "translate-x-full": isRTL && !sidebarOpen,
            "-translate-x-full": !isRTL && !sidebarOpen,
          },
          "lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2Feb0b70b9250f4bfca41dbc5a78c2ce45?format=webp&width=800"
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
            <h1 className="text-lg font-bold text-primary">
              {t("nav.adminPanel")}
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-gray-500")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white space-y-2">
          <Button onClick={toggleLanguage} variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50">
            <Languages className="w-4 h-4 mr-2" />
            {t("language.switch")}
          </Button>
          <Button onClick={logout} variant="outline" className="w-full justify-start border-gray-200 hover:bg-gray-50 text-red-600 hover:text-red-700">
            <LogOut className="w-4 h-4 mr-2" />
            {t("nav.logout")}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {t("dashboard.title")}
            </h1>
            <div className="w-6" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
