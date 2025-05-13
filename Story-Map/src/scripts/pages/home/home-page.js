import HomePresenter from "../../mvp/presenters/home-presenter";
import HomeView from "../../mvp/views/home-view";

export default class HomePage {
  async render() {
    return `
      <div class="home-view">
        <div class="hero">
          <h1>The world is full of silent stories. Trace your memories in places they once bloomed. Your story deserves to be heard, softly yet surely.</h1>
          <p>Share a memory, mark a place — your story matters here.</p>
        </div>
        
        <div class="hero-actions">
          <a href="#/submit" class="cta-button">
            <i class="ph ph-pencil-simple-line"></i>
            Tell Your Story</a
          >
          <div class="search-wrapper">
            <i class="ph ph-magnifying-glass"></i>
            <input
              type="text"
              class="search-input"
              placeholder="Search stories..."
              id="search-input"
            />
          </div>
        </div>

        <div class="features">
          <div class="feature-card">
            <h3>Share Your Story</h3>
            <p>Mark a meaningful place on the map and write the story behind it. Whether it's joy, sorrow, or something in between — your words belong here.</p>
          </div>
          <div class="feature-card">
            <h3>Explore Stories</h3>
            <p>Discover heartfelt stories pinned across the map. Search by location or scroll freely to find emotions left behind by others.</p>
          </div>
          <div class="feature-card">
            <h3>Read the Details</h3>
            <p>Tap on any story card to read the full memory, see the exact location, and feel the connection as if you were there.</p>
          </div>
        </div>

        <div class="stories-map" id="stories-map">
          <div class="map-container" id="map-container"></div>
        </div>
        
        <div class="stories" id="home-stories">
          <div class="story-cards" id="home-story-cards">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const view = new HomeView();
    new HomePresenter(view);
  }
}
