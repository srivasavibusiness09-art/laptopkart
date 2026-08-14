import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Laptopkart — Refurbished Laptops at Best Prices | 1 Year Warranty",
  description:
    "Buy certified refurbished laptops, MacBooks, and desktops at up to 70% off. Every device passes our rigorous quality checks. 1 Year Warranty | 7-Day Returns*.",
  keywords:
    "refurbished laptops, used laptops, second hand laptops, laptopkart, buy laptop online India",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
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
          <MotionConfig reducedMotion="never">{children}</MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
