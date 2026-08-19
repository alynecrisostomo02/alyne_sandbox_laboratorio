export const SITE_CONFIG = {
  brandName: "Alyne Crisóstomo",
  professionalName: "Alyne Crisóstomo",
  city: "Redenção – PA",
  whatsapp: "5594992762422",
  whatsappDisplay: "+55 94 99276-2422",
  instagram: "@alynecrisostomo",
  instagramUrl: "https://www.instagram.com/alynecrisostomo/",
  email: "",
  creci: "",
  hours: "Atendimento via WhatsApp",
  about:
    "Atendimento próximo, informações claras e imóveis selecionados de acordo com o perfil de cada cliente. Uma atuação local em Redenção, com conversa direta, transparência e atenção ao seu momento.",
};

export function whatsappUrl(message) {
  const digits = SITE_CONFIG.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
