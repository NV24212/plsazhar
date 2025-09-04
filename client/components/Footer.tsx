import { useLanguage } from "../contexts/LanguageContext";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  Star,
  Award,
  Shield,
  Truck,
  Clock,
  Gift,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const { t, language, isRTL } = useLanguage();

  const currentYear = new Date().getFullYear();

  const openInstagram = () => {
    window.open(
      "https://www.instagram.com/azharstore/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <footer className="bg-gradient-to-br from-secondary/50 to-accent/30 border-t">
      <div className="container-safe mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-20 flex items-center">
                <img
                  src={
                    language === "ar"
                      ? "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2F16a76df3c393470e995ec2718d67ab09?format=webp&width=800"
                      : "https://cdn.builder.io/api/v1/image/assets%2F22d5611cd8c847859f0fef8105890b91%2Feb0b70b9250f4bfca41dbc5a78c2ce45?format=webp&width=800"
                  }
                  alt="أزهار ستور - azharstore"
                  className="h-full w-auto object-contain transition-transform duration-200 hover:scale-105"
                />
              </div>
              <p className="text-muted-foreground leading-relaxed auto-text text-sm">
                {language === "ar"
                  ? "متجركم الموثوق للحصول على أفضل المنتجات بأسعار مناسبة وجودة عالية"
                  : "Your trusted store for the best products at affordable prices and high quality"}
              </p>
            </div>

            {/* Quality Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                <span className="auto-text">جودة مضمونة</span>
              </Badge>
              <Badge variant="info" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                <span className="auto-text">منتجات أصلية</span>
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground auto-text flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {language === "ar" ? "روابط سريعة" : "Quick Links"}
            </h3>
            <div className="space-y-3">
              <a
                href="/"
                className="block text-muted-foreground hover:text-primary transition-colors duration-200 auto-text text-sm"
              >
                {language === "ar" ? "الصفحة الرئيسية" : "Home"}
              </a>
              <a
                href="/#products"
                className="block text-muted-foreground hover:text-primary transition-colors duration-200 auto-text text-sm"
              >
                {language === "ar" ? "المنتجات" : "Products"}
              </a>
              <a
                href="/#categories"
                className="block text-muted-foreground hover:text-primary transition-colors duration-200 auto-text text-sm"
              >
                {language === "ar" ? "الفئات" : "Categories"}
              </a>
              <a
                href="/#contact"
                className="block text-muted-foreground hover:text-primary transition-colors duration-200 auto-text text-sm"
              >
                {language === "ar" ? "اتصل بنا" : "Contact Us"}
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground auto-text flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              {language === "ar" ? "خدماتنا" : "Our Services"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-muted-foreground auto-text">
                  {language === "ar" ? "شحن مجاني" : "Free Shipping"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-muted-foreground auto-text">
                  {language === "ar" ? "توصيل سريع" : "Fast Delivery"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="text-muted-foreground auto-text">
                  {language === "ar" ? "ضمان الجودة" : "Quality Guarantee"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Heart className="h-4 w-4 text-red-600 shrink-0" />
                <span className="text-muted-foreground auto-text">
                  {language === "ar" ? "خدمة عملاء ممتازة" : "Excellent Customer Service"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground auto-text flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              {language === "ar" ? "تواصل معنا" : "Contact Us"}
            </h3>
            <div className="space-y-4">
              {/* Instagram */}
              <Card 
                variant="interactive"
                className="p-4 cursor-pointer bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:border-pink-300"
                onClick={openInstagram}
              >
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-pink-700 auto-text text-sm">
                      Instagram
                    </p>
                    <p className="text-pink-600 text-xs auto-text">
                      @azharstore
                    </p>
                  </div>
                </div>
              </Card>

              {/* Email placeholder */}
              <div className={`flex items-center gap-3 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-muted-foreground auto-text">
                  {language === "ar" ? "راسلنا عبر Instagram" : "Contact us via Instagram"}
                </span>
              </div>

              {/* Location placeholder */}
              <div className={`flex items-center gap-3 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-muted-foreground auto-text">
                  {language === "ar" ? "نخدم جميع المناطق" : "We serve all areas"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Trust Indicators */}
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/10 border-primary/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-green-700 auto-text">منتجات أصلية</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-blue-700 auto-text">ضمان الجودة</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-purple-700 auto-text">شحن سريع</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-sm font-semibold text-red-700 auto-text">خدمة ممتازة</p>
              </div>
            </div>
          </Card>

          {/* Copyright */}
          <div className="text-center space-y-3">
            <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <p className="text-sm text-muted-foreground auto-text">
                {language === "ar"
                  ? `© ${currentYear} أزهار ستور. جميع الحقوق محفوظة`
                  : `© ${currentYear} Azhar Store. All rights reserved`}
              </p>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground auto-text">
              {language === "ar"
                ? "صُنع بكل حب وعناية لخدمتكم"
                : "Made with love and care to serve you"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
