// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Footer } from "./components/Footer";
import { ClientErrorBoundary } from "./components/ClientErrorBoundary";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://tihiydom.com"),
  title: "Тихий дом — организация похорон онлайн",
  description:
    "Тихий дом — цифровой помощник для самостоятельной организации похорон без агентств и давления онлайн. Понятные шаги и прозрачная цена.",
  alternates: {
    canonical: "https://tihiydom.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: "https://tihiydom.com",
    title: "Тихий дом — организация похорон онлайн",
    description:
      "Тихий дом — цифровой помощник для самостоятельной организации похорон без агентств и давления онлайн. Понятные шаги и прозрачная цена.",
    siteName: "Тихий дом",
    locale: "ru_RU",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Тихий дом",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Тихий дом — организация похорон онлайн",
    description:
      "Тихий дом — цифровой помощник для самостоятельной организации похорон без агентств и давления онлайн. Понятные шаги и прозрачная цена.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const GTM_ID = "GTM-MTM57TP6";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <Script
          id="td-runtime-guards"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.onerror;window.onerror=function(message,source,lineno,colno,error){try{console.error('[td-runtime] window.onerror',{message:message,source:source,lineno:lineno,colno:colno,error:error});}catch(_){}if(typeof p==='function'){return p.apply(this,arguments);}return false;};var u=window.onunhandledrejection;window.onunhandledrejection=function(event){try{console.error('[td-runtime] unhandledrejection',event&&event.reason?event.reason:event);}catch(_){}if(typeof u==='function'){return u.apply(this,arguments);}};}catch(e){try{console.error('[td-runtime] guard failed',e);}catch(_){}}})();`,
          }}
        />
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');}catch(e){try{console.error('[td-gtm] init failed',e);}catch(_){}}`,
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        {/* ВАЖНО: одна общая колонка на всю страницу */}
        <ClientErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
