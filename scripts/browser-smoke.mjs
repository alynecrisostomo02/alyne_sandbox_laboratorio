import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const chrome = process.env.CHROME_PATH;
if (!chrome) throw new Error("Defina CHROME_PATH para executar a validação visual.");

const outputDirectory = process.env.QA_OUTPUT || join(tmpdir(), "alyne-catalog-browser-qa");
const baseUrl = process.env.BASE_URL || "http://localhost:3001/";
await mkdir(outputDirectory, { recursive: true });
const profile = await mkdtemp(join(tmpdir(), "alyne-catalog-chrome-"));

const browser = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--disable-default-apps",
  "--remote-debugging-pipe",
  `--user-data-dir=${profile}`,
], { stdio: ["ignore", "ignore", "pipe", "pipe", "pipe"] });

let nextId = 1;
let buffer = "";
const pending = new Map();
const exceptions = [];

browser.stdio[4].setEncoding("utf8");
browser.stdio[4].on("data", (chunk) => {
  buffer += chunk;
  const messages = buffer.split("\0");
  buffer = messages.pop() || "";
  for (const raw of messages) {
    if (!raw) continue;
    const message = JSON.parse(raw);
    if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(message.params?.exceptionDetails?.text || "Exceção sem descrição");
    }
    if (!message.id) continue;
    const request = pending.get(message.id);
    if (!request) continue;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
    else request.resolve(message.result || {});
  }
});

browser.stderr.setEncoding("utf8");
let browserStderr = "";
browser.stderr.on("data", (chunk) => { browserStderr += chunk; });

function command(method, params = {}, sessionId) {
  const id = nextId++;
  const payload = { id, method, params };
  if (sessionId) payload.sessionId = sessionId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method });
    browser.stdio[3].write(`${JSON.stringify(payload)}\0`);
    setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      reject(new Error(`Tempo esgotado: ${method}`));
    }, 15000).unref();
  });
}

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function evaluate(sessionId, expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Falha ao avaliar a página");
  return result.result?.value;
}

async function screenshot(sessionId, name) {
  const result = await command("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
    fromSurface: true,
  }, sessionId);
  const path = join(outputDirectory, name);
  await writeFile(path, Buffer.from(result.data, "base64"));
  return path;
}

async function pageState(sessionId) {
  return evaluate(sessionId, `(() => ({
    hash: location.hash,
    heading: document.querySelector("main h1")?.textContent?.trim() || "",
    cards: document.querySelectorAll(".property-card").length,
    galleryImages: document.querySelectorAll(".gallery-thumbs button").length || document.querySelectorAll(".gallery-main img").length,
    status: document.querySelector(".status-chip, .demo-pill")?.textContent?.trim() || "",
    horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    viewport: [window.innerWidth, window.innerHeight],
  }))()`);
}

let exitCode = 0;
try {
  await command("Browser.getVersion");
  const { targetId } = await command("Target.createTarget", { url: baseUrl });
  const { sessionId } = await command("Target.attachToTarget", { targetId, flatten: true });
  await command("Page.enable", {}, sessionId);
  await command("Runtime.enable", {}, sessionId);
  await command("Log.enable", {}, sessionId);
  await pause(2500);

  const results = {};
  results.homeDesktop = await pageState(sessionId);
  results.homeDesktop.screenshot = await screenshot(sessionId, "home-desktop.png");

  await evaluate(sessionId, `location.hash = "#/imoveis"`);
  await pause(1200);
  results.catalogDesktop = await pageState(sessionId);
  results.catalogDesktop.screenshot = await screenshot(sessionId, "catalog-desktop.png");

  await evaluate(sessionId, `location.hash = "#/imovel/casa-piscina-park-dos-buritis-iii-ref-026"`);
  await pause(1200);
  results.detailDesktop = await pageState(sessionId);
  results.detailDesktop.screenshot = await screenshot(sessionId, "detail-desktop.png");

  await evaluate(sessionId, `location.hash = "#/encontrar"`);
  await pause(800);
  results.recommender = await pageState(sessionId);
  results.recommender.choiceCount = await evaluate(sessionId, `document.querySelectorAll(".answer-grid button").length`);

  for (const label of ["Comprar", "Casa", "Até R$ 1,3 milhão", "3 ou mais", "Tanto faz"]) {
    await evaluate(sessionId, `(() => {
      const button = [...document.querySelectorAll("button")].find((item) => item.textContent.trim() === ${JSON.stringify(label)});
      if (!button) throw new Error("Opção não encontrada: ${label}");
      button.click();
    })()`);
    await pause(180);
  }
  await evaluate(sessionId, `(() => {
    const button = [...document.querySelectorAll("button")].find((item) => item.textContent.includes("Ver recomendações"));
    if (!button) throw new Error("Botão de recomendação não encontrado");
    button.click();
  })()`);
  await pause(500);
  results.recommenderResult = {
    ...await pageState(sessionId),
    profile: await evaluate(sessionId, `document.querySelector(".recommendation-summary")?.textContent?.replace(/\\s+/g, " ").trim() || ""`),
  };

  await command("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  }, sessionId);

  await evaluate(sessionId, `location.hash = "#/"`);
  await pause(900);
  results.homeMobile = await pageState(sessionId);
  results.homeMobile.screenshot = await screenshot(sessionId, "home-mobile.png");

  await evaluate(sessionId, `location.hash = "#/imoveis"`);
  await pause(900);
  results.catalogMobile = await pageState(sessionId);
  results.catalogMobile.closedFilters = await evaluate(sessionId, `(() => {
    const panel = document.querySelector("#catalog-filters");
    return { hidden: panel?.getAttribute("aria-hidden"), inert: panel?.inert, open: panel?.classList.contains("is-open") };
  })()`);
  await evaluate(sessionId, `document.querySelector(".mobile-filter-button")?.click()`);
  await pause(180);
  results.catalogMobile.openFilters = await evaluate(sessionId, `(() => {
    const panel = document.querySelector("#catalog-filters");
    return { hidden: panel?.getAttribute("aria-hidden"), inert: panel?.inert, open: panel?.classList.contains("is-open") };
  })()`);
  await evaluate(sessionId, `document.querySelector(".mobile-close")?.click()`);
  await pause(180);
  results.catalogMobile.screenshot = await screenshot(sessionId, "catalog-mobile.png");

  await evaluate(sessionId, `location.hash = "#/imovel/casa-piscina-park-dos-buritis-iii-ref-026"`);
  await pause(900);
  results.detailMobile = await pageState(sessionId);
  results.detailMobile.screenshot = await screenshot(sessionId, "detail-mobile.png");

  await evaluate(sessionId, `location.hash = "#/imovel/casa-pacos-de-opala-portfolio-ref-038"`);
  await pause(700);
  results.unavailableDetail = {
    ...await pageState(sessionId),
    price: await evaluate(sessionId, `document.querySelector(".detail-price")?.textContent?.trim() || ""`),
    cta: await evaluate(sessionId, `document.querySelector(".interest-card")?.textContent?.replace(/\\s+/g, " ").trim() || ""`),
  };

  await evaluate(sessionId, `location.hash = "#/imovel/casa-alto-padrao-park-dos-buritis-i-ref-023"`);
  await pause(700);
  results.consultationDetail = {
    ...await pageState(sessionId),
    cta: await evaluate(sessionId, `document.querySelector(".interest-card")?.textContent?.replace(/\\s+/g, " ").trim() || ""`),
  };

  results.exceptions = exceptions;
  console.log(JSON.stringify(results, null, 2));
} catch (error) {
  exitCode = 1;
  console.error(error.stack || error.message);
  if (browserStderr) console.error(browserStderr.slice(-4000));
} finally {
  browser.kill();
}

process.exitCode = exitCode;
