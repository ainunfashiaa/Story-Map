// CSS imports
import "../styles/styles.css";
import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  // Handle skip to content
  const skipLink = document.querySelector(".skip-link");
  const mainContent = document.querySelector("#main-content");

  skipLink.addEventListener("click", (e) => {
    e.preventDefault();
    mainContent.focus();
  });
});
