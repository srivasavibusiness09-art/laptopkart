import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LaptopLux — Refurbished Laptops at Best Prices | 1 Year Warranty",
  description:
    "Buy certified refurbished laptops, MacBooks, and desktops at up to 70% off. Every device passes a 72-point quality check. 1 Year Warranty | 7-Day Returns | EMI Available.",
  keywords:
    "refurbished laptops, used laptops, second hand laptops, laptoplux, buy laptop online India",
  openGraph: {
    title: "LaptopLux — Refurbished Laptops at Best Prices",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
