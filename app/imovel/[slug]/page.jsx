import SiteApp from "@/src/components/SiteApp";
import { properties } from "@/src/properties";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = properties.find((p) => p.slug === slug);

  if (!property) {
    return {
      title: "Imóvel não encontrado | Alyne Crisóstomo Imóveis",
    };
  }

  const imageUrl = property.mainImage ? `https://alyne-crisostomo-laboratorio.grand-crab.workers.dev${property.mainImage}` : "https://alyne-crisostomo-laboratorio.grand-crab.workers.dev/branding/logo-alyne-padrao.jpg";

  return {
    title: `${property.title} | Alyne Crisóstomo Imóveis`,
    description: property.shortDescription || property.fullDescription?.substring(0, 160),
    openGraph: {
      title: `${property.title} | Alyne Crisóstomo Imóveis`,
      description: property.shortDescription || property.fullDescription?.substring(0, 160),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} | Alyne Crisóstomo Imóveis`,
      description: property.shortDescription || property.fullDescription?.substring(0, 160),
      images: [imageUrl],
    },
  };
}

export default function PropertyPage() {
  return <SiteApp />;
}
