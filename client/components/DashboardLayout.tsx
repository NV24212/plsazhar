import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Home,
  Box,
  Cart,
  User,
  Settings,
  Language,
  LogOut,
  Folder,
} from "iconoir-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getNavigation = (t: (key: string) => string) => [
  { name: t("nav.dashboard"), href: "/admin/", icon: Home },
  { name: t("nav.products"), href: "/admin/products", icon: Box },
  {
    name: t("nav.categories") as any,
    href: "/admin/categories",
    icon: Folder,
  },
  { name: t("nav.orders"), href: "/admin/orders", icon: Cart },
  { name: t("nav.customers"), href: "/admin/customers", icon: User },
  { name: t("nav.settings"), href: "/admin/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const { language, setLanguage, isRTL, t } = useLanguage();
  const location = useLocation();

  const navigation = getNavigation(t);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <SidebarProvider>
      <div className={`flex h-screen bg-gray-50 text-gray-900 ${isRTL ? "rtl" : "ltr"}`}>
        <Sidebar
          side={isRTL ? "right" : "left"}
          className="bg-white"
          style={{
            "--sidebar-accent": "hsl(var(--primary))",
            "--sidebar-accent-foreground": "hsl(var(--primary-foreground))",
          }}
        >
          <SidebarHeader>
            <div className="flex items-center justify-between h-16 px-6">
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
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <Link to={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        className={cn(isActive && "shadow-sm")}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-4 space-y-2">
              <Button onClick={toggleLanguage} variant="outline" className="w-full justify-start">
                <Language className="w-4 h-4 me-2" />
                {t("language.switch")}
              </Button>
              <Button onClick={logout} variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <LogOut className="w-4 h-4 me-2" />
                {t("nav.logout")}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between h-16 px-6">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-gray-900">
                {t("dashboard.title")}
              </h1>
              <div className="w-6" />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
