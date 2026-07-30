import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Laptopkart — Refurbished Laptops at Best Prices | 1 Year Warranty",
  description:
    "Buy certified refurbished laptops, MacBooks, and desktops at up to 70% off. Every device passes our rigorous quality checks. 1 Year Warranty | 7-Day Returns*.",
  keywords:
    "refurbished laptops, used laptops, second hand laptops, laptopkart, buy laptop online India",
  openGraph: {
    title: "Laptopkart — Refurbished Laptops at Best Prices",
    description:
      "Buy certified refurbished laptops at up to 70% off. 1 Year Warranty & 7-Day Returns.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script 
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="beforeInteractive"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
