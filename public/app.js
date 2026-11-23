const form = document.querySelector("#proxyForm");
const input = document.querySelector("#url");
const error = document.querySelector("#error");
const allowed = ["youtube.com","www.youtube.com","m.youtube.com","youtu.be","youtube-nocookie.com","www.youtube-nocookie.com","tiktok.com","www.tiktok.com","m.tiktok.com","vm.tiktok.com","vt.tiktok.com"];
function go(raw) {
  error.textContent = "";
  let u;
  try { u = new URL(raw); } catch { error.textContent = "Paste a complete link to get started."; return; }
  if (!["http:","https:"].includes(u.protocol) || !allowed.includes(u.hostname.toLowerCase())) {
    error.textContent = "That link isn't on the supported YouTube or TikTok list.";
    return;
  }
  location.href = "/proxy?url=" + encodeURIComponent(u.href);
}
form.addEventListener("submit", e => { e.preventDefault(); go(input.value.trim()); });
document.querySelectorAll("[data-url]").forEach(b => b.addEventListener("click", () => { input.value=b.dataset.url; go(input.value); }));
