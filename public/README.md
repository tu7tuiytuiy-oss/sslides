# SlideSpace

Independent red-and-black YouTube/TikTok link gateway starter.

## Deploy
Push these files to the root of a GitHub repository and deploy the included `render.yaml` as a Render Blueprint.

## Domain and HTTPS
Render provides a real HTTPS URL on its own domain. You can attach a custom domain you own (for example, `slides.yourdomain.com`) in Render and configure DNS. You cannot make a Render URL genuinely appear to be a Google Slides URL, and this project is not affiliated with Google.

## Limitations
The proxy only allows a small set of YouTube/TikTok hosts. These services use many additional domains and modern browser features, so full playback/navigation is not guaranteed. Do not remove the host allowlist or expose this as an unrestricted proxy. Never enter passwords or private information.
