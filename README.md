# Social Proxy Starter

A small Express-based HTTP forwarding demo with a strict YouTube/TikTok hostname allowlist.

## Deploy to Render

1. Create a GitHub repository and upload these files.
2. In Render, choose **New → Blueprint** and connect the repository.
3. Render reads `render.yaml`, installs dependencies, and deploys the app.
4. Open the public `onrender.com` URL shown by Render.

## Important limitations

This is a starter gateway, not a complete browser-isolation product. YouTube and TikTok are complex web applications: their pages load scripts, APIs, images, video segments, and other services from many hosts. This demo intentionally allows only a small set of hostnames, so full playback and navigation will often fail. Do not remove the allowlist or expose an unrestricted proxy: that can create an SSRF/open-proxy security vulnerability.

Do not submit passwords, cookies, or other sensitive information through this demo. For reliable access, use the official YouTube/TikTok apps or websites and comply with local network rules and each service's terms.

## Tab disguise toggle

The home page includes an optional cosmetic toggle that changes the browser tab title and favicon to a Google Slides-style appearance. It does not change the address bar, network traffic, browser history, or monitoring visibility, and it does not make the page part of Google Slides.
