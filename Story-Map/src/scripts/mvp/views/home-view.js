export default class HomeView {
  constructor() {
    this.storyCardsContainer = document.getElementById("home-story-cards");
    this.searchInput = document.getElementById("search-input");
    this.mapContainer = document.getElementById("map-container");
    this.map = null;
    this.markers = [];
  }

  renderLoading() {
    this.storyCardsContainer.innerHTML = `
      <div class="loading-spinner" aria-live="polite" aria-busy="true">
        <div class="spinner" role="status">
          <label class="visually-hidden">Loading stories...</label>
        </div>
        <p>Loading stories...</p>
      </div>
    `;
  }

  renderStories(stories) {
    if (stories.length === 0) {
      this.renderEmpty();
      return;
    }

    this.storyCardsContainer.innerHTML = stories
      .map((story) => this._createStoryCard(story))
      .join("");

    if (this.map) {
      this.addMarkers(stories);
    }

    this._addCardFocusStyles();
  }

  renderError(message) {
    this.storyCardsContainer.innerHTML = `
      <div class="error-message" aria-live="assertive">
        <i class="ph ph-warning-circle" aria-hidden="true"></i>
        <p>${message}</p>
        <button class="retry-button" id="retry-button">Retry</button>
      </div>
    `;
  }

  renderEmpty() {
    this.storyCardsContainer.innerHTML = `
      <div class="no-stories" aria-live="polite">
        <i class="ph ph-map-trifold" aria-hidden="true"></i>
        <p>No stories found. Be the first to share your story!</p>
      </div>
    `;
  }

  initMap() {
    if (!this.mapContainer) return;

    this.map = L.map("map-container").setView([0, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.customIcon = L.icon({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    });
  }

  addMarkers(stories) {
    this.clearMarkers();

    const validStories = stories.filter(
      (story) =>
        story.lat && story.lon && !isNaN(story.lat) && !isNaN(story.lon)
    );

    validStories.forEach((story) => {
      const marker = L.marker([story.lat, story.lon], {
        icon: this.customIcon,
        alt: `Story by ${story.name || "Guest"} at ${story.lat}, ${story.lon}`,
        riseOnHover: true,
      }).addTo(this.map).bindPopup(`
          <div class="map-popup">
            <h3>${story.name || "Guest"}'s Story</h3>
            ${
              story.photoUrl
                ? `<img src="${story.photoUrl}" alt="Story preview" class="popup-image">`
                : ""
            }
            <p>${story.description.substring(0, 100)}${
        story.description.length > 100 ? "..." : ""
      }</p>
            <a href="#/detail/${
              story.id
            }" class="map-popup-link">Read full story</a>
          </div>
        `);

      marker.on("click", () => {
        marker.setZIndexOffset(1000);
      });

      this.markers.push(marker);
    });

    if (validStories.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker);
      marker.off();
    });
    this.markers = [];
  }

  bindSearch(handler) {
    this.searchInput.addEventListener("input", (e) => {
      handler(e.target.value.toLowerCase());
    });
  }

  bindRetry(handler) {
    const retryBtn = document.getElementById("retry-button");
    if (retryBtn) {
      retryBtn.addEventListener("click", handler);
      retryBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          handler();
        }
      });
    }
  }

  bindCardClick(handler) {
    this.storyCardsContainer.addEventListener("click", (e) => {
      const card = e.target.closest(".story-card");
      if (card) {
        const storyId = card.dataset.id;
        handler(storyId);
      }
    });
  }

  _createStoryCard(story) {
    let description = story.description;
    const name = story.name || "Guest";

    if (description.startsWith(name)) {
      description = description.substring(name.length).trim();
      if (description.startsWith("\n\n")) {
        description = description.substring(2);
      }
    }

    return `
      <div class="story-card" tabindex="0" role="article" data-id="${story.id}">
        ${
          story.photoUrl
            ? `<img src="${story.photoUrl}" alt="Story image" class="story-image" loading="lazy">`
            : '<div class="story-image-placeholder"><i class="ph ph-image"></i></div>'
        }
        <div class="story-content">
          <p class="story-excerpt">${description.substring(0, 100)}${
      description.length > 100 ? "..." : ""
    }</p>
          <div class="story-meta">
            <div class="story-location-date">
              <span class="story-location">
                <i class="ph ph-map-pin"></i>
                ${
                  story.lat
                    ? `${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}`
                    : "No location"
                }
              </span>
              <span class="story-date">
                <i class="ph ph-calendar"></i>
                ${new Date(story.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <span class="story-author">
              <i class="ph ph-user"></i>
              ${name}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  _addCardFocusStyles() {
    const cards = document.querySelectorAll(".story-card");
    cards.forEach((card) => {
      card.addEventListener("focus", () => {
        card.classList.add("card-focused");
      });
      card.addEventListener("blur", () => {
        card.classList.remove("card-focused");
      });
    });
  }

  initHero() {
    return `
      <div class="hero">
        <h1>The world is full of silent stories. Trace your memories in places they once bloomed.</h1>
        <p>Share a memory, mark a place — your story matters here.</p>
      </div>
      <div class="hero-actions">
        <a href="#/submit" class="cta-button">
          <i class="ph ph-pencil-simple-line" aria-hidden="true"></i>
          Tell Your Story
        </a>
        <div class="search-wrapper">
          <label for="search-input" class="visually-hidden">Search stories</label>
          <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Search stories..."
            id="search-input"
            aria-label="Search stories"
          />
        </div>
      </div>
    `;
  }
}
