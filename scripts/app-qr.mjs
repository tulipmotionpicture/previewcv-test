// Writes the app-install QR codes (static SVGs, so pages need no QR library).
//   node scripts/app-qr.mjs                                  -> PreviewCV's, into public/images/mobile-app
//   node scripts/app-qr.mjs letsmakecv <letsmakecv repo>     -> LetsMakeCV's, into that repo
// Each code opens the app's short link, which sends phones to their own store; "from" says
// where it was scanned. Change a link here and in src/lib/mobileApps.ts together.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import QRCode from "qrcode";

const LETSMAKECV = "https://letsmakecv.com/app";
const PREVIEWCV = "https://previewcv.com/app";

const SETS = {
  previewcv: [
    ["letsmakecv", LETSMAKECV, ["pcv-auth", "pcv-page", "pcv-dashboard"]],
    ["previewcv", PREVIEWCV, ["auth", "page", "dashboard", "app"]],
  ],
  letsmakecv: [["letsmakecv", LETSMAKECV, ["home", "dashboard", "app"]]],
};

const [set = "previewcv", repo = "."] = process.argv.slice(2);
const out = join(repo, "public/images/mobile-app");
mkdirSync(out, { recursive: true });
for (const [app, link, places] of SETS[set]) {
  for (const from of places) {
    const svg = await QRCode.toString(`${link}?from=${from}`, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
    writeFileSync(join(out, `${app}-qr-${from}.svg`), svg);
  }
}
