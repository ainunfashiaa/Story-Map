import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default class StoryDetailView {
  constructor() {
    this.imageContainer = document.getElementById("story-image-container");
    this.descriptionElement = document.getElementById("story-description");
    this.authorElement = document.getElementById("story-author");
    this.dateElement = document.getElementById("story-date");
    this.locationElement = document.getElementById("story-location");
    this.mapContainer = document.getElementById("story-map-container");
    this.map = null;
    this.marker = null;
  }

  renderStory(story) {
    // Render gambar
    this.imageContainer.innerHTML = story.photoUrl
      ? `<img src="${story.photoUrl}" alt="Story image" class="story-detail-image">`
      : '<div class="story-image-placeholder"><i class="ph ph-image"></i></div>';

    // Render konten
    this.descriptionElement.textContent = story.description;
    this.authorElement.innerHTML = `<i class="ph ph-user"></i> ${
      story.name || "Guest"
    }`;
    this.dateElement.innerHTML = `<i class="ph ph-calendar"></i> ${new Date(
      story.createdAt
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    this.locationElement.innerHTML = `<i class="ph ph-map-pin"></i> ${story.lat.toFixed(
      4
    )}, ${story.lon.toFixed(4)}`;
  }

  initMap(lat, lon) {
    if (this.map) {
      this.map.remove();
    }

    this.mapContainer.innerHTML = '<div id="map" style="height: 300px;"></div>';

    this.map = L.map("map").setView([lat, lon], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [41, 41],
    });

    this.marker = L.marker([lat, lon], {
      icon: customIcon,
      title: "Story Location",
    }).addTo(this.map);

    const popupContent = `
      <div class="map-popup">
        <h4>Story Location</h4>
        <p>Latitude: ${lat.toFixed(6)}</p>
        <p>Longitude: ${lon.toFixed(6)}</p>
        <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" rel="noopener noreferrer">
          Open in Google Maps
        </a>
      </div>
    `;

    this.marker
      .bindPopup(popupContent, {
        maxWidth: 250,
        minWidth: 200,
        className: "custom-popup",
      })
      .openPopup();
  }

  renderError(message) {
    this.imageContainer.innerHTML = `
      <div class="error-message">
        <i class="ph ph-warning-circle"></i>
        <p>${message}</p>
        <button class="retry-button" id="retry-button">Retry</button>
      </div>
    `;
  }
}
