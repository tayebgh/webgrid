import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { AuthProvider } from "../lib/auth";

export const metadata = {
  title: "WebZarf — The Internet, Organized",
  description: "Discover 76+ top websites organized by category. Social, News, Search, Entertainment, Shopping, Tech & more. Plus a full SEO blog.",
  keywords: "web directory, best websites, social media sites, news websites, internet links",
  openGraph: {
    title: "WebZarf — The Internet, Organized",
    description: "76+ top websites in a beautiful visual grid.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/*
          AdSense — uncomment after approval:
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossOrigin="anonymous" />
        */}
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
