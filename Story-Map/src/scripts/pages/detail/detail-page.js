import StoryDetailPresenter from "../../mvp/presenters/detail-presenter";
import StoryDetailView from "../../mvp/views/detail-view";

export default class StoryDetailPage {
  constructor() {
    this.storyId = null;
  }

  async render() {
    // Ambil ID dari URL
    const urlParts = window.location.hash.split("/");
    this.storyId = urlParts[urlParts.length - 1];

    return `
      <div class="story-detail-view">
        <div class="back-button">
          <a href="#/" class="back-link">
            <i class="ph ph-arrow-left"></i> Back to Stories
          </a>
        </div>

        <div class="story-detail-container">
          <div class="story-image-container" id="story-image-container">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>

          <div class="story-content">
            <div class="story-meta">
              <div class="story-author-date">
                <label class="story-author" id="story-author">
                  <i class="ph ph-user"></i>
                  Loading...
                </label>
                <label class="story-date" id="story-date">
                  <i class="ph ph-calendar"></i>
                  Loading...
                </label>
              </div>
              <label class="story-location" id="story-location">
                <i class="ph ph-map-pin"></i>
                Loading...
              </label>
            </div>

            <div class="story-description" id="story-description">
              Loading story content...
            </div>
          </div>

          <div class="story-map-container" id="story-map-container">
            <div class="map-placeholder">
              <i class="ph ph-map-trifold"></i>
              <p>Loading map...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const view = new StoryDetailView();
    new StoryDetailPresenter(view, this.storyId);
  }
}
