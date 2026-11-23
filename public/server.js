import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dns from "node:dns/promises";
import net from "node:net";

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be",
  "youtube-nocookie.com", "www.youtube-nocookie.com",
  "tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com",
  "vt.tiktok.com"
]);

function privateIp(ip) {
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    return p[0] === 10 || p[0] === 127 || p[0] === 0 ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) ||
      (p[0] === 192 && p[1] === 168) || p[0] >= 224;
  }
  const x = ip.toLowerCase();
  return x === "::" || x === "::1" || x.startsWith("fc") ||
    x.startsWith("fd") || x.startsWith("fe80:");
}

async function checkedUrl(raw) {
  const u = new URL(raw);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("Only HTTP and HTTPS links are allowed.");
  if (!ALLOWED_HOSTS.has(u.hostname.toLowerCase())) throw new Error("Only approved YouTube and TikTok hosts are supported.");
  if (u.username || u.password) throw new Error("Credentials in URLs are not allowed.");
  const ips = await dns.lookup(u.hostname, { all: true });
  if (!ips.length || ips.some(x => privateIp(x.address))) throw new Error("Destination address is not public.");
  return u;
}

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/proxy", async (req, res, next) => {
  try {
    if (typeof req.query.url !== "string") return res.status(400).send("Missing URL.");
    const u = await checkedUrl(req.query.url);
    createProxyMiddleware({
      target: u.origin,
      changeOrigin: true,
      secure: true,
      followRedirects: false,
      pathRewrite: () => u.pathname + u.search,
      on: {
        proxyReq(proxyReq) {
          proxyReq.removeHeader("cookie");
          proxyReq.removeHeader("authorization");
        },
        proxyRes(proxyRes) {
          delete proxyRes.headers["set-cookie"];
          delete proxyRes.headers["content-security-policy"];
          delete proxyRes.headers["x-frame-options"];
        },
        error(err, _req, proxyRes) {
          if (!proxyRes.headersSent) proxyRes.status(502).send("Upstream proxy error.");
        }
      }
    })(req, res, next);
  } catch (e) {
    res.status(400).send(e.message || "Invalid URL.");
  }
});
app.use(express.static("public"));
app.listen(PORT, () => console.log(`SlideSpace listening on ${PORT}`));
