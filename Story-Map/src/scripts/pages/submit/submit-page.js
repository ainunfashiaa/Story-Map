import SubmitPresenter from "../../mvp/presenters/submit-presenter";
import SubmitView from "../../mvp/views/submit-view";

export default class SubmitPage {
  static registered = false;

  async render() {
    const view = new SubmitView();
    return view.render();
  }

  async afterRender() {
    await this.loadLeaflet();

    if (!SubmitPage.registered) {
      customElements.define(
        "story-submission-form",
        class extends HTMLElement {}
      );
      SubmitPage.registered = true;
    }

    const view = new SubmitView();
    new SubmitPresenter(view);
  }

  async loadLeaflet() {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";

      link.onload = () => {
        document.head.appendChild(script);
        script.onload = resolve;
      };

      document.head.appendChild(link);
    });
  }
}
