import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Basoor Family · Our Roots, Our Story",
  description: "Explore nine generations of the Basoor family, from our ancestors to the present day.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
