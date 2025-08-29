/**
 * Currency formatting utilities for the application
 * Handles BHD (Bahraini Dinar) with 3 decimal places as required
 */

interface CurrencyFormatOptions {
  showSymbol?: boolean;
  spaceBetween?: boolean;
  locale?: string;
}

/**
 * Formats currency amounts for BHD with proper 3 decimal places
 * @param amount The numeric amount to format
 * @param options Formatting options
 * @returns Formatted currency string (e.g., "3.350BD" or "BD 3.350")
 */
export function formatBHD(
  amount: number,
  options: CurrencyFormatOptions = {},
): string {
  const { showSymbol = true, spaceBetween = false, locale = "en-BH" } = options;

  // Format to 3 decimal places for BHD
  const formattedAmount = Number(amount).toFixed(3);

  if (!showSymbol) {
    return formattedAmount;
  }

  const separator = spaceBetween ? " " : "";

  // For Arabic locale, show symbol after amount
  if (locale === "ar-BH" || locale === "ar") {
    return `${formattedAmount}${separator}د.ب`;
  }

  // For English locale, show BD after amount (standard BHD format)
  return `${formattedAmount}${separator}BD`;
}

/**
 * Formats a price with a given currency symbol, handling LTR and RTL display.
 * @param amount The numeric amount to format.
 * @param currencySymbol The currency symbol (e.g., "BD", "$").
 * @param language The current language ('ar' or 'en').
 * @returns A formatted price string (e.g., "10.500 BD").
 */
export function formatPrice(
  amount: number,
  currencySymbol: string,
  language?: string,
): string {
  const formattedAmount = Number(amount).toFixed(3);

  if (language === "ar") {
    const arabicSymbol = currencySymbol === "BD" ? "د.ب" : currencySymbol;
    return `${formattedAmount} ${arabicSymbol}`;
  }

  return `${formattedAmount} ${currencySymbol}`;
}

/**
 * DEPRECATED: This function is now an alias for formatPrice.
 * Use formatPrice directly instead.
 * @param amount The amount to format
 * @param currencySymbol The currency symbol to use
 * @param language Current language
 * @returns Formatted price string
 */
export function formatPriceWithSymbol(
  amount: number,
  currencySymbol: string,
  language?: string,
): string {
  return formatPrice(amount, currencySymbol, language);
}
