import AuthService from "../services/auth-service";
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupAuthListener();
    this._updateNavigation();
  }

  _setupDrawer() {
    const closeDrawer = () => this.#navigationDrawer.classList.remove("open");

    this.#drawerButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (
        !this.#navigationDrawer.contains(e.target) &&
        !this.#drawerButton.contains(e.target)
      ) {
        closeDrawer();
      }
    });

    // Close drawer when clicking on links
    this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });
  }

  _setupAuthListener() {
    window.addEventListener("storage", (e) => {
      if (e.key === "currentUser") {
        this._updateNavigation();
      }
    });
    document.addEventListener(
      "authStateChanged",
      this._updateNavigation.bind(this)
    );
  }

  _updateNavigation() {
    const navList = document.getElementById("nav-list");
    if (!navList) return;

    const isAuthenticated = AuthService.isAuthenticated();
    navList.innerHTML = isAuthenticated
      ? `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/submit">Submit</a></li>
        <li><a href="#/profile">Profile</a></li>
      `
      : `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/login">Login</a></li>
      `;

    if (isAuthenticated) {
      document.getElementById("logout-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        AuthService.logout();
      });
    }
  }

  async renderPage() {
    try {
      const url = getActiveRoute();
      const page = routes[url];

      if (!page) {
        throw new Error("Page not found");
      }

      // Fungsi transisi fade-out
      const reverseSmoothTransition = (opacity = 1) => {
        return new Promise((resolve) => {
          const fade = (opacity) => {
            if (opacity <= 0) {
              this.#content.style.opacity = "0";
              return resolve(); // setelah selesai, lanjut
            }

            this.#content.style.opacity = `${opacity}`;
            requestAnimationFrame(() => fade(opacity - 0.05));
          };

          fade(opacity);
        });
      };

      // Fungsi transisi fade-in
      const smoothTransition = (opacity = 0) => {
        const fade = (opacity) => {
          if (opacity >= 1) {
            this.#content.style.opacity = "1";
            return;
          }

          this.#content.style.opacity = `${opacity}`;
          requestAnimationFrame(() => fade(opacity + 0.05));
        };

        fade(opacity);
      };

      await reverseSmoothTransition();

      this.#content.innerHTML = await page.render();
      await page.afterRender?.();
      this._updateNavigation();

      smoothTransition(0);
    } catch (error) {
      console.error("Render error:", error);
      this.#content.innerHTML = `
        <div class="error-view" style="padding: 2rem; text-align: center;">
          <h2>Page Not Found</h2>
          <p>The requested page was not found.</p>
          <a href="#/" class="cta-button">Back to Home</a>
        </div>
      `;
      this.#content.style.opacity = "1";
    }
  }
}

export default App;
