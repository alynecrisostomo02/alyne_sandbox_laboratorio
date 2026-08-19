"use client";

import { useEffect, useMemo, useState } from "react";
import { properties as fallbackProperties } from "../properties";
import { isDetailProperty, isFavoriteProperty } from "../propertyStatus";
import Catalog from "./Catalog";
import Footer from "./Footer";
import Header from "./Header";
import Home from "./Home";
import { About, Contact } from "./InfoPages";
import AssistantLauncher from "./AssistantLauncher";
import AssistantPage from "./AssistantPage";
import PropertyDetail from "./PropertyDetail";
import Recommender from "./Recommender";

const STORAGE_KEY = "redencao-imoveis-favorites";

function readFavorites(properties) {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value)
      ? value.filter((id) => properties.some((property) => property.id === id && isFavoriteProperty(property)))
      : [];
  } catch {
    return [];
  }
}

function currentHash() {
  if (typeof window === "undefined") return { path: "/", query: "" };
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, query = ""] = raw.split("?");
  return { path: path.startsWith("/") ? path : `/${path}`, query };
}

function skipToMainContent(event) {
  event.preventDefault();
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;
  const focusTarget = mainContent.querySelector("main") || mainContent;
  focusTarget.setAttribute("tabindex", "-1");
  event.currentTarget.blur();
  window.setTimeout(() => {
    focusTarget.focus();
    focusTarget.scrollIntoView({ block: "start", behavior: "auto" });
  }, 0);
}

export default function SiteApp() {
  const [properties, setProperties] = useState(fallbackProperties);
  const [location, setLocation] = useState({ path: "/", query: "" });
  const [favorites, setFavorites] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const sync = () => {
      setLocation(currentHash());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    sync();
    setFavorites(readFavorites(fallbackProperties));
    setStorageReady(true);
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        if (active && Array.isArray(payload?.properties)) {
          setProperties(payload.properties);
          setFavorites((current) => current.filter((id) => payload.properties.some((property) => property.id === id && isFavoriteProperty(property))));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Favorites remain available during the current visit.
    }
  }, [favorites, storageReady]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function toggleFavorite(id) {
    const isFavorite = favorites.includes(id);
    const nextFavorites = isFavorite
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

    setFavorites(nextFavorites);
    setToast(isFavorite ? "Removido dos favoritos." : "Salvo nos favoritos.");
  }

  const content = useMemo(() => {
    if (location.path === "/assistente") return <AssistantPage />;
    if (location.path === "/imoveis") {
      return <Catalog properties={properties} favorites={favorites} onFavorite={toggleFavorite} query={location.query} />;
    }
    if (location.path.startsWith("/imovel/")) {
      const slug = decodeURIComponent(location.path.split("/")[2] || "");
      const candidate = properties.find((item) => item.slug === slug);
      const property = isDetailProperty(candidate) ? candidate : undefined;
      return (
        <PropertyDetail
          property={property}
          favorite={property ? favorites.includes(property.id) : false}
          onFavorite={toggleFavorite}
          onToast={setToast}
        />
      );
    }
    if (location.path === "/encontrar") {
      return <Recommender properties={properties} favorites={favorites} onFavorite={toggleFavorite} />;
    }
    if (location.path === "/sobre") return <About />;
    if (location.path === "/contato") return <Contact />;
    return <Home properties={properties} favorites={favorites} onFavorite={toggleFavorite} />;
  }, [location, favorites, properties]);

  const isAssistant = location.path === "/assistente";

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={skipToMainContent}>
        Pular para o conteúdo
      </a>
      {isAssistant ? null : <Header route={location.path} />}
      <div id="main-content" tabIndex={-1}>{content}</div>
      {isAssistant ? null : <Footer />}
      {isAssistant ? null : <AssistantLauncher />}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
