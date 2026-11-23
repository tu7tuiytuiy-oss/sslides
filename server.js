import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dns from "node:dns/promises";
import net from "node:net";

const app = express();
const PORT = process.env.PORT || 3000;

// Deliberately limited to these public hosts. Do not turn this into an open proxy.
const ALLOWED_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be",
  "youtube-nocookie.com", "www.youtube-nocookie.com",
  "tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com",
  "vt.tiktok.com"
]);

function hostAllowed(hostname) {
  const h = hostname.toLowerCase().replace(/\.$/, "");
  return ALLOWED_HOSTS.has(h);
}

function isPrivateIPv4(ip) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  return p[0] === 10 || p[0] === 127 || p[0] === 0 ||
    (p[0] === 169 && p[1] === 254) ||
    (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
    (p[0] === 192 && p[1] === 168) || p[0] >= 224;
}
function isPrivateIPv6(ip) {
  const x = ip.toLowerCase();
  return x === "::1" || x === "::" || x.startsWith("fc") ||
    x.startsWith("fd") || x.startsWith("fe80:");
}

async function validateTarget(raw) {
  let u;
  try { u = new URL(raw); } catch { throw new Error("Enter a valid full URL."); }
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only HTTP and HTTPS URLs are allowed.");
  if (!hostAllowed(u.hostname)) throw new Error("That host is not on the allowed list.");
  if (u.username || u.password) throw new Error("URLs containing credentials are not allowed.");

  // Reject private/local DNS answers to reduce SSRF risk.
  const records = await dns.lookup(u.hostname, { all: true, verbatim: true });
  if (!records.length || records.some(r =>
    net.isIP(r.address) === 4 ? isPrivateIPv4(r.address) :
    net.isIP(r.address) === 6 ? isPrivateIPv6(r.address) : true
  )) throw new Error("The destination did not resolve to a public IP address.");
  return u;
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/proxy", async (req, res, next) => {
  try {
    if (typeof req.query.url !== "string") return res.status(400).send("Missing ?url= parameter.");
    const target = await validateTarget(req.query.url);
    const proxy = createProxyMiddleware({
      target: target.origin,
      changeOrigin: true,
      followRedirects: false,
      secure: true,
      pathRewrite: () => target.pathname + target.search,
      on: {
        proxyReq(proxyReq) {
          proxyReq.setHeader("user-agent", "Mozilla/5.0 (compatible; SocialProxyDemo/1.0)");
          proxyReq.removeHeader("cookie");
          proxyReq.removeHeader("authorization");
        },
        proxyRes(proxyRes) {
          // Do not expose upstream cookies to this site's visitors.
          delete proxyRes.headers["set-cookie"];
          // Keep the demo from being used to frame arbitrary pages.
          delete proxyRes.headers["x-frame-options"];
          delete proxyRes.headers["content-security-policy"];
        },
        error(err, _req, res) {
          if (!res.headersSent) res.status(502).send("Upstream proxy error: " + err.message);
        }
      }
    });
    proxy(req, res, next);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.use(express.static("public"));
app.listen(PORT, () => console.log(`Social proxy starter listening on ${PORT}`));
