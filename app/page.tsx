import type { Metadata } from "next";
import HomePageClient from "./components/HomePageClient";

export const metadata: Metadata = {
  title: "Тихий дом — организация похорон в Москве и Московской области",
  description:
    "Достойная организация похорон в Москве и Московской области: прозрачная смета, фиксированная цена, личный координатор и пошаговая помощь без давления.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Тихий дом — организация похорон в Москве и Московской области",
    description:
      "Прозрачная организация похорон: фиксированная цена, личный координатор и помощь без давления.",
    url: "/",
    type: "website",
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
    title: "Тихий дом — организация похорон в Москве и Московской области",
    description:
      "Прозрачная организация похорон: фиксированная цена, личный координатор и помощь без давления.",
    images: ["/og.jpg"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
