import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { isRTL } = useLanguage();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-4 px-6">
      <div className="container mx-auto">
        <div className="text-center text-sm text-gray-600">
          <p className={`${isRTL ? "rtl-text" : "ltr-text"}`}>
            جميع الحقوق محفوظة - azharstore 2025©
          </p>
        </div>
      </div>
    </footer>
  );
}
