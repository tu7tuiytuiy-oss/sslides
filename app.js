const form = document.querySelector("#proxyForm");
const input = document.querySelector("#url");
const error = document.querySelector("#error");

function go(raw) {
  error.textContent = "";
  let target;
  try { target = new URL(raw); } catch { error.textContent = "Please enter a complete URL."; return; }
  const allowed = ["youtube.com","www.youtube.com","m.youtube.com","youtu.be","youtube-nocookie.com","www.youtube-nocookie.com","tiktok.com","www.tiktok.com","m.tiktok.com","vm.tiktok.com","vt.tiktok.com"];
  if (!["http:","https:"].includes(target.protocol) || !allowed.includes(target.hostname.toLowerCase())) {
    error.textContent = "Please use a supported YouTube or TikTok URL.";
    return;
  }
  window.location.href = "/proxy?url=" + encodeURIComponent(target.href);
}
form.addEventListener("submit", e => { e.preventDefault(); go(input.value.trim()); });
document.querySelectorAll("[data-url]").forEach(button => button.addEventListener("click", () => {
  input.value = button.dataset.url;
  go(input.value);
}));

// Cosmetic tab disguise only: it changes this page's title and favicon.
const cloakToggle = document.querySelector("#cloakToggle");
const tabIcon = document.querySelector("#tabIcon");
const originalTitle = "Social Proxy";
const originalIcon = "/favicon.svg";
const slidesIcon = "data:image/svg+xml," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="5" y="8" width="54" height="38" rx="5" fill="#F9AB00"/><rect x="10" y="13" width="44" height="28" rx="2" fill="#fff"/><path d="M22 52h20M32 46v6" stroke="#5F6368" stroke-width="4" stroke-linecap="round"/><path d="M20 23h24M20 30h16" stroke="#F9AB00" stroke-width="4" stroke-linecap="round"/></svg>'
);
cloakToggle.addEventListener("change", () => {
  if (cloakToggle.checked) {
    document.title = "Google Slides";
    tabIcon.href = slidesIcon;
  } else {
    document.title = originalTitle;
    tabIcon.href = originalIcon;
  }
});
