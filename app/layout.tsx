// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Footer } from "./components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Тихий дом",
  description: "Цифровой помощник по самостоятельной организации прощания",
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
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <div className="hidden">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
