import "./globals.css";

const siteUrl = new URL(
  "https://alyne-crisostomo-laboratorio.grand-crab.workers.dev"
);

export const metadata = {
  metadataBase: siteUrl,
  title: "Alyne Crisóstomo Imóveis | Redenção – PA",
  description:
    "Imóveis para venda e locação em Redenção, Pará, com atendimento próximo e informações claras.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Alyne Crisóstomo Imóveis | Redenção – PA",
    description:
      "Encontre imóveis para venda e locação em Redenção – PA.",
    url: "/",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/branding/logo-alyne-padrao.jpg",
        width: 1280,
        height: 724,
        alt: "Alyne Crisóstomo — Corretora de Imóveis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alyne Crisóstomo Imóveis | Redenção – PA",
    description:
      "Catálogo imobiliário em Redenção – PA, com atendimento direto.",
    images: ["/branding/logo-alyne-padrao.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#163e34",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
