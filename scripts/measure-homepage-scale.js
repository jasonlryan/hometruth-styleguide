/* eslint-disable no-console */
/**
 * Measure "above the fold" scale (typography + spacing) on a given URL.
 *
 * Usage:
 *   node scripts/measure-homepage-scale.js --url https://hometruth.io --out .context/live.json
 *   node scripts/measure-homepage-scale.js --url http://localhost:3010 --out .context/local.json
 *
 * Notes:
 * - Uses fixed viewports to avoid "browser zoom" / DPR ambiguity.
 * - Finds hero title + subtitle + "Ask HomeTruth" heading by exact text match.
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

function parseArgs(argv) {
  const args = { url: null, out: null, viewports: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url") args.url = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--viewport") {
      const raw = argv[++i];
      args.viewports = args.viewports || [];
      args.viewports.push(raw);
    }
    else if (!a.startsWith("--") && !args.url) args.url = a;
  }
  if (!args.url) {
    console.error("Missing --url");
    process.exit(2);
  }
  return args;
}

function parseViewportSpec(spec) {
  // Formats:
  // - "1440x900"
  // - "desktop:1440x900"
  const m = String(spec || "").trim().match(/^(?:(.+?):)?(\d+)x(\d+)$/i);
  if (!m) return null;
  const name = (m[1] || `custom_${m[2]}x${m[3]}`).trim();
  const width = Number(m[2]);
  const height = Number(m[3]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  return { name, width, height, deviceScaleFactor: 1 };
}

const DEFAULT_VIEWPORTS = [
  { name: "desktop_1440", width: 1440, height: 900, deviceScaleFactor: 1 },
  // ~875 CSS px is a common "retina screenshot ~1750px wide" breakpoint band.
  { name: "mid_875", width: 875, height: 820, deviceScaleFactor: 1 },
  { name: "tablet_1024", width: 1024, height: 768, deviceScaleFactor: 1 },
  { name: "mobile_390", width: 390, height: 844, deviceScaleFactor: 1 },
];

function toPxNumber(px) {
  if (typeof px !== "string") return null;
  const m = px.match(/^([0-9.]+)px$/);
  return m ? Number(m[1]) : null;
}

async function main() {
  const { url, out, viewports } = parseArgs(process.argv);
  const VIEWPORTS =
    Array.isArray(viewports) && viewports.length > 0
      ? viewports
          .map(parseViewportSpec)
          .filter(Boolean)
      : DEFAULT_VIEWPORTS;
  if (!VIEWPORTS || VIEWPORTS.length === 0) {
    console.error("No valid --viewport provided. Expected e.g. --viewport 1440x900");
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    // Keep this deterministic; no need for GPU.
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const results = {
    url,
    capturedAt: new Date().toISOString(),
    viewports: {},
  };

  try {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport(vp);

      // Avoid cookie banners / popups affecting layout (best-effort).
      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
      });

      const resp = await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      const status = resp ? resp.status() : null;

      // Wait for fonts to settle (best-effort).
      await page.waitForFunction(() => document.fonts?.status === "loaded", { timeout: 15000 }).catch(() => {});

      const data = await page.evaluate(() => {
        const exactText = {
          heroTitle: "Make smarter decisions with HomeTruth",
          heroSubtitle: "Ask questions. Save answers. Upload documents.",
          askH2: "Ask HomeTruth",
        };

        function isVisible(el) {
          if (!el) return false;
          const cs = window.getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        }

        function findExact(selector, text) {
          const els = Array.from(document.querySelectorAll(selector));
          for (const el of els) {
            const t = (el.textContent || "").trim().replace(/\s+/g, " ");
            if (t === text && isVisible(el)) return el;
          }
          return null;
        }

        function styleOf(el) {
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 140),
            rect: { x: r.x, y: r.y, width: r.width, height: r.height },
            css: {
              fontSize: cs.fontSize,
              lineHeight: cs.lineHeight,
              fontWeight: cs.fontWeight,
              letterSpacing: cs.letterSpacing,
              fontFamily: cs.fontFamily,
              textTransform: cs.textTransform,
              marginTop: cs.marginTop,
              marginBottom: cs.marginBottom,
              paddingTop: cs.paddingTop,
              paddingBottom: cs.paddingBottom,
            },
          };
        }

        function sectionMetrics(fromEl) {
          const s = fromEl?.closest?.("section") || null;
          if (!s) return null;
          const cs = window.getComputedStyle(s);
          const r = s.getBoundingClientRect();
          return {
            rect: { x: r.x, y: r.y, width: r.width, height: r.height },
            css: {
              paddingTop: cs.paddingTop,
              paddingBottom: cs.paddingBottom,
              marginTop: cs.marginTop,
              marginBottom: cs.marginBottom,
              background: cs.backgroundImage !== "none" ? cs.backgroundImage : cs.backgroundColor,
            },
          };
        }

        const heroTitleEl = findExact("h1,h2,h3,p,div,span", exactText.heroTitle);
        const heroSubtitleEl = findExact("p,div,span", exactText.heroSubtitle);
        const askH2El = findExact("h1,h2,h3,p,div,span", exactText.askH2);

        const htmlCS = window.getComputedStyle(document.documentElement);
        const bodyCS = window.getComputedStyle(document.body);

        // Detect zoom-like conditions in a way devs can sanity-check.
        const visualScale = window.visualViewport?.scale ?? null;
        const dpr = window.devicePixelRatio ?? null;

        return {
          env: {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
            devicePixelRatio: dpr,
            visualViewportScale: visualScale,
            rootFontSize: htmlCS.fontSize,
            bodyFontSize: bodyCS.fontSize,
          },
          heroTitle: styleOf(heroTitleEl),
          heroSubtitle: styleOf(heroSubtitleEl),
          askHeading: styleOf(askH2El),
          heroSection: sectionMetrics(heroTitleEl),
          askSection: sectionMetrics(askH2El),
        };
      });

      results.viewports[vp.name] = { viewport: vp, status, ...data };
      await page.close();
    }
  } finally {
    await browser.close();
  }

  // Pretty console summary (quick scan).
  function summarize(v) {
    const heroFs = v.heroTitle?.css?.fontSize || "n/a";
    const heroLh = v.heroTitle?.css?.lineHeight || "n/a";
    const heroPt = v.heroSection?.css?.paddingTop || "n/a";
    const heroPb = v.heroSection?.css?.paddingBottom || "n/a";
    const askFs = v.askHeading?.css?.fontSize || "n/a";
    const root = v.env?.rootFontSize || "n/a";
    const scale = v.env?.visualViewportScale ?? "n/a";
    return { root, scale, heroFs, heroLh, heroPt, heroPb, askFs };
  }

  console.log(`URL: ${url}`);
  for (const [k, v] of Object.entries(results.viewports)) {
    const s = summarize(v);
    console.log(
      `${k}: root=${s.root} vvScale=${s.scale} hero=${s.heroFs}/${s.heroLh} heroPY=${s.heroPt}+${s.heroPb} askH2=${s.askFs}`
    );
  }

  if (out) {
    const outPath = path.resolve(process.cwd(), out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`Wrote ${out}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
