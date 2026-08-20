/**
 * addressGeocoding.js
 * Utilitários de validação automática de CEP, enriquecimento de endereço,
 * geolocalização e cálculo de pontos de interesse (POIs) em Redenção - PA.
 */

// Tabela de bairros e coordenadas conhecidas de Redenção - PA
export const REDENCAO_NEIGHBORHOODS = {
  "park dos buritis i": {
    name: "Park dos Buritis I",
    zone: "Zona Nobre / Buritis",
    lat: -8.0165,
    lng: -50.0210,
    cep: "68552-000",
  },
  "park dos buritis ii": {
    name: "Park dos Buritis II",
    zone: "Zona Nobre / Buritis",
    lat: -8.0140,
    lng: -50.0185,
    cep: "68552-050",
  },
  "park dos buritis iii": {
    name: "Park dos Buritis III",
    zone: "Zona Nobre / Buritis",
    lat: -8.0120,
    lng: -50.0160,
    cep: "68552-100",
  },
  "park dos buritis iv": {
    name: "Park dos Buritis IV",
    zone: "Zona Nobre / Buritis",
    lat: -8.0100,
    lng: -50.0140,
    cep: "68552-150",
  },
  "park dos buritis": {
    name: "Park dos Buritis",
    zone: "Zona Nobre / Buritis",
    lat: -8.0150,
    lng: -50.0195,
    cep: "68552-000",
  },
  "alto parana": {
    name: "Alto Paraná",
    zone: "Zona Sul",
    lat: -8.0210,
    lng: -50.0260,
    cep: "68550-400",
  },
  "centro": {
    name: "Centro",
    zone: "Zona Central",
    lat: -8.0267,
    lng: -50.0317,
    cep: "68550-000",
  },
  "morada da paz": {
    name: "Morada da Paz",
    zone: "Zona Oeste",
    lat: -8.0190,
    lng: -50.0380,
    cep: "68551-200",
  },
  "jardim primavera": {
    name: "Jardim Primavera",
    zone: "Zona Leste",
    lat: -8.0330,
    lng: -50.0250,
    cep: "68553-100",
  },
  "vila paulista": {
    name: "Vila Paulista",
    zone: "Zona Sul",
    lat: -8.0350,
    lng: -50.0360,
    cep: "68550-600",
  },
  "bela vista": {
    name: "Bela Vista",
    zone: "Zona Sul",
    lat: -8.0390,
    lng: -50.0300,
    cep: "68550-700",
  },
  "setor oeste": {
    name: "Setor Oeste",
    zone: "Zona Oeste",
    lat: -8.0240,
    lng: -50.0420,
    cep: "68551-000",
  },
  "santos dumont": {
    name: "Santos Dumont",
    zone: "Zona Oeste",
    lat: -8.0310,
    lng: -50.0400,
    cep: "68551-400",
  },
  "capelinha": {
    name: "Capelinha",
    zone: "Zona Oeste",
    lat: -8.0220,
    lng: -50.0450,
    cep: "68551-500",
  },
  "nucleo urbano": {
    name: "Núcleo Urbano",
    zone: "Zona Norte",
    lat: -8.0200,
    lng: -50.0320,
    cep: "68550-200",
  },
  "serrinha": {
    name: "Serrinha",
    zone: "Zona Norte",
    lat: -8.0150,
    lng: -50.0400,
    cep: "68550-300",
  },
  "campos altos": {
    name: "Campos Altos",
    zone: "Zona Norte",
    lat: -8.0090,
    lng: -50.0280,
    cep: "68550-350",
  },
  "setor planalto": {
    name: "Setor Planalto",
    zone: "Zona Leste",
    lat: -8.0380,
    lng: -50.0220,
    cep: "68553-300",
  },
  "aeroporto": {
    name: "Setor Aeroporto",
    zone: "Zona Oeste",
    lat: -8.0170,
    lng: -50.0460,
    cep: "68551-600",
  },
  "entroncamento": {
    name: "Entroncamento",
    zone: "Zona Leste",
    lat: -8.0300,
    lng: -50.0150,
    cep: "68553-000",
  },
};

// Pontos de Referência Reais em Redenção - PA
export const REDENCAO_POIS = [
  {
    id: "fesar-afya",
    name: "Faculdade FESAR / Afya Educação Médica",
    category: "education",
    categoryLabel: "Educação",
    icon: "school",
    lat: -8.0195,
    lng: -50.0235,
    description: "Referência em ensino superior e medicina na região sul do Pará",
  },
  {
    id: "colegio-ipiranga",
    name: "Colégio Objetivo / Ipiranga",
    category: "education",
    categoryLabel: "Educação",
    icon: "school",
    lat: -8.0235,
    lng: -50.0290,
    description: "Instituição de ensino tradicional da educação infantil ao médio",
  },
  {
    id: "escola-adventista",
    name: "Escola Adventista de Redenção",
    category: "education",
    categoryLabel: "Educação",
    icon: "school",
    lat: -8.0255,
    lng: -50.0335,
    description: "Educação básica com formação de excelência e estrutura moderna",
  },
  {
    id: "macre-supermercado",
    name: "Supermercado Macre (Av. Brasil)",
    category: "convenience",
    categoryLabel: "Mercados & Compras",
    icon: "cart",
    lat: -8.0215,
    lng: -50.0270,
    description: "Amplo hipermercado com setor gourmet, adega e importados",
  },
  {
    id: "centro-comercial",
    name: "Centro Comercial de Redenção",
    category: "convenience",
    categoryLabel: "Mercados & Compras",
    icon: "cart",
    lat: -8.0270,
    lng: -50.0325,
    description: "Bancos, farmácias, boutiques de moda e conveniências",
  },
  {
    id: "parque-ecologico",
    name: "Parque Ecológico de Redenção",
    category: "leisure",
    categoryLabel: "Lazer & Natureza",
    icon: "tree",
    lat: -8.0135,
    lng: -50.0225,
    description: "Área verde preservada com pistas de caminhada, lago e ciclovia",
  },
  {
    id: "praca-das-ocas",
    name: "Praça das Ocas / Espaço Cívico",
    category: "leisure",
    categoryLabel: "Lazer & Natureza",
    icon: "tree",
    lat: -8.0260,
    lng: -50.0305,
    description: "Ponto de encontro urbano arborizado com iluminação cênica e eventos",
  },
  {
    id: "hrpa",
    name: "Hospital Regional Público do Araguaia (HRPA)",
    category: "health",
    categoryLabel: "Saúde & Cuidados",
    icon: "hospital",
    lat: -8.0245,
    lng: -50.0410,
    description: "Hospital de alta e média complexidade com pronto-atendimento 24h",
  },
  {
    id: "farmacia-24h",
    name: "Rede de Farmácias Globo & Pague Menos 24h",
    category: "health",
    categoryLabel: "Saúde & Cuidados",
    icon: "hospital",
    lat: -8.0250,
    lng: -50.0300,
    description: "Atendimento farmacêutico e conveniência 24 horas",
  },
  {
    id: "avenida-brasil-gourmet",
    name: "Polo Gastronômico da Av. Brasil",
    category: "dining",
    categoryLabel: "Gastronomia",
    icon: "utensils",
    lat: -8.0220,
    lng: -50.0280,
    description: "Restaurantes contemporâneos, churrascarias, cafeterias e bistrôs",
  },
];

/**
 * Normaliza e formata string de CEP
 */
export function formatCep(cep) {
  if (!cep) return "";
  const digits = String(cep).replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function cleanCepDigits(cep) {
  return String(cep || "").replace(/\D/g, "").slice(0, 8);
}

function normalizeKey(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Identifica a Zona da cidade a partir do bairro
 */
export function determineZone(neighborhood, city = "Redenção") {
  const norm = normalizeKey(neighborhood);
  if (!norm) return "Zona Central";

  for (const [key, data] of Object.entries(REDENCAO_NEIGHBORHOODS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return data.zone;
    }
  }

  if (norm.includes("buriti")) return "Zona Nobre / Buritis";
  if (norm.includes("sul") || norm.includes("parana") || norm.includes("paulista")) return "Zona Sul";
  if (norm.includes("norte") || norm.includes("serrinha") || norm.includes("urbano")) return "Zona Norte";
  if (norm.includes("oeste") || norm.includes("paz") || norm.includes("aeroporto") || norm.includes("dumont")) return "Zona Oeste";
  if (norm.includes("leste") || norm.includes("primavera") || norm.includes("planalto")) return "Zona Leste";
  if (norm.includes("centro") || norm.includes("comercial")) return "Zona Central";

  return "Zona Urbana";
}

/**
 * Busca dados do endereço via ViaCEP com fallback resiliente
 */
export async function fetchAddressByCep(cep) {
  const clean = cleanCepDigits(cep);
  if (clean.length !== 8) {
    throw new Error("CEP incompleto. Digite os 8 números do CEP.");
  }

  // 1. Tentar ViaCEP
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (!data.erro) {
        const city = data.localidade || "Redenção";
        const state = data.uf || "PA";
        const neighborhood = data.bairro || "";
        const street = data.logradouro || "";
        const zone = determineZone(neighborhood, city);
        const coords = getCoordinatesForAddress({
          cep: clean,
          neighborhood,
          address: street,
          city,
        });

        return {
          valid: true,
          cep: formatCep(clean),
          street,
          neighborhood,
          city,
          state,
          zone,
          coordinates: coords,
          publicLocation: neighborhood ? `${neighborhood}, ${city} - ${state}` : `${city} - ${state}`,
          source: "viacep",
        };
      }
    }
  } catch {
    // Segue para fallback se ViaCEP falhar
  }

  // 2. Fallback BrasilAPI
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${clean}`);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || "Redenção";
      const state = data.state || "PA";
      const neighborhood = data.neighborhood || "";
      const street = data.street || "";
      const zone = determineZone(neighborhood, city);
      const coords = getCoordinatesForAddress({
        cep: clean,
        neighborhood,
        address: street,
        city,
      });

      return {
        valid: true,
        cep: formatCep(clean),
        street,
        neighborhood,
        city,
        state,
        zone,
        coordinates: coords,
        publicLocation: neighborhood ? `${neighborhood}, ${city} - ${state}` : `${city} - ${state}`,
        source: "brasilapi",
      };
    }
  } catch {
    // Segue para inferência local
  }

  // 3. Fallback inteligente para Redenção - PA
  const coords = getCoordinatesForAddress({ cep: clean, city: "Redenção" });
  return {
    valid: true,
    cep: formatCep(clean),
    street: "",
    neighborhood: "Redenção",
    city: "Redenção",
    state: "PA",
    zone: "Zona Central",
    coordinates: coords,
    publicLocation: "Redenção, PA",
    source: "local-fallback",
  };
}

/**
 * Obtém ou infere coordenadas geográficas { lat, lng } para um endereço ou bairro de Redenção
 */
export function getCoordinatesForAddress({ address, neighborhood, city = "Redenção", cep }) {
  const normNeighborhood = normalizeKey(neighborhood);

  for (const [key, data] of Object.entries(REDENCAO_NEIGHBORHOODS)) {
    if (normNeighborhood && (normNeighborhood === key || normNeighborhood.includes(key) || key.includes(normNeighborhood))) {
      return {
        lat: data.lat,
        lng: data.lng,
        zone: data.zone,
        precision: "neighborhood",
      };
    }
  }

  const clean = cleanCepDigits(cep);
  if (clean) {
    for (const data of Object.values(REDENCAO_NEIGHBORHOODS)) {
      if (cleanCepDigits(data.cep) === clean) {
        return {
          lat: data.lat,
          lng: data.lng,
          zone: data.zone,
          precision: "cep",
        };
      }
    }
  }

  // Coordenadas Centrais de Redenção - PA
  return {
    lat: -8.0267,
    lng: -50.0317,
    zone: "Zona Central",
    precision: "city",
  };
}

/**
 * Fórmula de Haversine para calcular distância em km entre dois pontos geográficos
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Retorna os pontos de interesse ordenados por proximidade com tempo de caminhada e carro
 */
export function getNearbyPOIsForLocation({ lat, lng, neighborhood }) {
  const centerLat = lat ?? (getCoordinatesForAddress({ neighborhood }).lat);
  const centerLng = lng ?? (getCoordinatesForAddress({ neighborhood }).lng);

  return REDENCAO_POIS.map((poi) => {
    const distanceKm = calculateDistanceKm(centerLat, centerLng, poi.lat, poi.lng);
    // Média urbana: carro 30 km/h (2 min/km), caminhada 5 km/h (12 min/km)
    const driveMinutes = Math.max(1, Math.round(distanceKm * 2.2));
    const walkMinutes = Math.max(2, Math.round(distanceKm * 12));

    return {
      ...poi,
      distanceKm,
      distanceFormatted: distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`,
      driveMinutes,
      walkMinutes,
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Gera URL do Google Maps para visualização ou rotas
 */
export function getGoogleMapsUrl({ lat, lng, query, destination }) {
  const q = encodeURIComponent(query || destination || `${lat},${lng}`);
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function getGoogleMapsDirectionsUrl({ lat, lng, address }) {
  const dest = lat && lng ? `${lat},${lng}` : encodeURIComponent(address || "Redenção, PA");
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

export function getGoogleMapsEmbedUrl({ lat, lng, query }) {
  const centerLat = lat ?? -8.0267;
  const centerLng = lng ?? -50.0317;
  // Utiliza embed com marcador nas coordenadas exatas
  return `https://maps.google.com/maps?q=${centerLat},${centerLng}&hl=pt-BR&z=15&output=embed`;
}
