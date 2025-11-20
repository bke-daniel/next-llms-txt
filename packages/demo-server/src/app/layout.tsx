import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div
          className="mx-auto"
          style={{
            marginTop: "2rem",
            marginBottom: "2rem",
            maxWidth: 1440
          }}
        >
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
