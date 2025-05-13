import SubmitModel from "../models/submit-model.js";

export default class SubmitView {
  constructor() {
    this.selectedLocation = null;
    this.photoFile = null;
    this.stream = null;
    this.cameraActive = false;
    this.devices = [];
    this.selectedDeviceId = null;
    this.photoTaken = false;
    this.MAX_FILE_SIZE = 1024 * 1024;
    this.targetWidth = 1920;
    this.targetHeight = 1080;
    this.previewAspectRatio = 16 / 9;
    this.fileInput = null;
  }

  render() {
    return `
      <div class="submit-view" id="submit-view" style="margin-top: 100px;">
        <story-submission-form>
          <h1>Add Your Story</h1>
          <p class="section-subtitle">
            Every place holds a memory. Add yours to the map and let others feel
            what you felt.
          </p>
        
          <div class="section">
            <label class="section-title">Description</label>
            <textarea
              id="story-description"
              placeholder="Tell us what happened. It doesn't have to be perfect—just real..."
            ></textarea>
          </div>

          <div class="section">
            <label class="section-title">Location</label>
            <p class="section-subtitle">Pin the place where it happened.</p>
            <div id="map"></div>
            <div class="coordinate-inputs">
              <input type="number" step="any" id="latitude" placeholder="Latitude">
              <input type="number" step="any" id="longitude" placeholder="Longitude">
              <button id="update-marker">Update Map</button>
            </div>
          </div>

          <div class="section">
            <label class="section-title">Photo</label>
            <p class="section-subtitle">
              A picture helps bring your moment to life.
            </p>
            <div class="camera-container">
              <div class="photo-options">
                <div class="photo-option" id="open-gallery">Open Gallery</div>
                <div class="photo-option" id="open-camera">Open Camera</div>
              </div>
            
              <select id="camera-select" style="display: none;"></select>
            
              <div class="media-preview-container">
                <video id="camera-preview" autoplay playsinline style="display:none;"></video>
                <canvas id="photo-canvas" style="display:none;"></canvas>
              </div>
            
              <div class="camera-controls">
                <button id="capture-button" style="display:none;">Capture</button>
                <button id="retake-button" style="display:none;">Retake</button>
                <button id="delete-button" style="display:none;">Delete Photo</button>
              </div>
            </div>
          </div>

          ${
            SubmitModel.isAuthenticated()
              ? `
            <div class="section">
              <label class="anonymous-option">
                <input type="checkbox" id="post-anonymously">
                Post as Guest (anonymous)
              </label>
            </div>
          `
              : ""
          }

          <button class="submit-button" disabled id="submit-button">
            Share Your Memory
          </button>
        </story-submission-form>
      </div>
    `;
  }

  initializeMap() {
    this.map = L.map("map").setView([-6.2, 106.8], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
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

    this.marker = L.marker([-6.2, 106.8], {
      icon: customIcon,
      draggable: true,
    }).addTo(this.map);
    this.marker.setOpacity(0);

    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      this.updateMapMarker(lat, lng);
      this.marker
        .bindPopup(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .openPopup();
    });

    this.marker.on("dragend", (e) => {
      const { lat, lng } = this.marker.getLatLng();
      this.updateMapMarker(lat, lng);
      this.marker.setPopupContent(
        `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      );
    });
  }

  updateMapMarker(lat, lng) {
    if (!this.marker) return;

    this.marker.setLatLng([lat, lng]).setOpacity(1);
    this.selectedLocation = { lat, lng };

    const latInput = document.querySelector("#latitude");
    const lngInput = document.querySelector("#longitude");
    if (latInput && lngInput) {
      latInput.value = lat.toFixed(6);
      lngInput.value = lng.toFixed(6);
    }

    this.updateSubmitButton();

    if (this.marker.getPopup()) {
      this.marker.setPopupContent(
        `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      );
    }
  }

  bindMapEvents(handler) {
    document.querySelector("#update-marker").addEventListener("click", () => {
      const latInput = document.querySelector("#latitude");
      const lngInput = document.querySelector("#longitude");
      const lat = parseFloat(latInput.value);
      const lng = parseFloat(lngInput.value);

      if (!isNaN(lat) && !isNaN(lng)) {
        this.updateMapMarker(lat, lng);
        this.map.setView([lat, lng], 15);
      } else {
        alert("Please enter valid coordinates.");
      }
    });
  }

  bindCameraEvents(cameraHandlers) {
    const {
      toggleCamera,
      capturePhoto,
      retakePhoto,
      openGallery,
      deletePhoto,
      changeCamera,
    } = cameraHandlers;

    document
      .querySelector("#open-camera")
      .addEventListener("click", toggleCamera);
    document
      .querySelector("#capture-button")
      .addEventListener("click", capturePhoto);
    document
      .querySelector("#retake-button")
      .addEventListener("click", retakePhoto);
    document
      .querySelector("#open-gallery")
      .addEventListener("click", openGallery);
    document
      .querySelector("#delete-button")
      .addEventListener("click", deletePhoto);
    document
      .querySelector("#camera-select")
      .addEventListener("change", changeCamera);
  }

  bindFormEvents(submitHandler, inputHandler) {
    document
      .querySelector("#story-description")
      .addEventListener("input", inputHandler);
    document
      .querySelector("#submit-button")
      .addEventListener("click", submitHandler);
  }

  updateSubmitButton() {
    const description = document
      .querySelector("#story-description")
      .value.trim();
    const isValid =
      description &&
      this.selectedLocation &&
      (this.photoFile || this.photoTaken);
    const button = document.querySelector("#submit-button");

    if (button) {
      button.disabled = !isValid;
      button.style.opacity = isValid ? 1 : 0.5;
      button.style.cursor = isValid ? "pointer" : "not-allowed";
    }
  }

  async setupCamera() {
    try {
      const cameraOption = document.getElementById("open-camera");
      if (cameraOption) {
        cameraOption.textContent = "Close Camera";
      }

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }

      this.videoElement = document.getElementById("camera-preview");
      this.videoElement.style.display = "block";

      this.videoElement.style.width = "100%";
      this.videoElement.style.height = "auto";

      const constraints = {
        video: {
          width: { ideal: this.targetWidth },
          height: { ideal: this.targetHeight },
          ...(this.selectedDeviceId && {
            deviceId: { exact: this.selectedDeviceId },
          }),
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;

      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = resolve;
      });

      document.querySelector("#capture-button").style.display = "block";
      document.querySelector("#open-gallery").style.display = "none";
      await this.listCameras();
      this.cameraActive = true;
    } catch (error) {
      console.error("Camera error:", error);
      this.stopCamera();
      throw error;
    }
  }

  async listCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter((device) => device.kind === "videoinput");

      const cameraSelect = document.querySelector("#camera-select");
      if (cameraSelect) {
        cameraSelect.innerHTML = "";

        if (this.devices.length > 1) {
          this.devices.forEach((device) => {
            const option = document.createElement("option");
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
          });
          cameraSelect.style.display = "block";
        } else {
          cameraSelect.style.display = "none";
        }
      }
    } catch (error) {
      console.error("Error listing cameras:", error);
    }
  }

  async capturePhoto() {
    try {
      const canvas = document.querySelector("#photo-canvas");
      const ctx = canvas.getContext("2d");
      const video = document.querySelector("#camera-preview");

      const videoAspect = video.videoWidth / video.videoHeight;
      let sourceWidth,
        sourceHeight,
        sourceX = 0,
        sourceY = 0;

      if (videoAspect > this.previewAspectRatio) {
        sourceHeight = video.videoHeight;
        sourceWidth = sourceHeight * this.previewAspectRatio;
        sourceX = (video.videoWidth - sourceWidth) / 2;
      } else {
        sourceWidth = video.videoWidth;
        sourceHeight = sourceWidth / this.previewAspectRatio;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      ctx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight
      );

      canvas.style.display = "block";
      document.querySelector("#capture-button").style.display = "none";
      document.querySelector("#retake-button").style.display = "block";
      document.querySelector("#delete-button").style.display = "block";
      document.querySelector("#open-gallery").style.display = "none";
      document.querySelector("#open-camera").style.display = "block";
      document.querySelector("#open-camera").textContent = "Open Camera";
      video.style.display = "none";
      document.querySelector("#camera-select").style.display = "none";
      this.photoTaken = true;

      await this.stopCamera();

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            this.photoFile = new File([blob], "captured-photo.jpg", {
              type: "image/jpeg",
            });
            this.updateSubmitButton();
            resolve();
          },
          "image/jpeg",
          0.9
        );
      });
    } catch (error) {
      console.error("Error capturing photo:", error);
      throw error;
    }
  }

  retakePhoto() {
    const photoCanvas = document.getElementById("photo-canvas");
    const retakeButton = document.getElementById("retake-button");
    const deleteButton = document.getElementById("delete-button");
    const videoElement = document.getElementById("camera-preview");
    const captureButton = document.getElementById("capture-button");
    const cameraOption = document.getElementById("open-camera");
    const galleryOption = document.getElementById("open-gallery");
    const cameraSelect = document.getElementById("camera-select");

    if (photoCanvas) photoCanvas.style.display = "none";
    if (retakeButton) retakeButton.style.display = "none";
    if (deleteButton) deleteButton.style.display = "none";
    if (videoElement) videoElement.style.display = "none";
    if (captureButton) captureButton.style.display = "none";
    if (cameraOption) {
      cameraOption.style.display = "block";
      cameraOption.textContent = "Open Camera";
    }
    if (galleryOption) galleryOption.style.display = "block";
    if (cameraSelect) cameraSelect.style.display = "none";

    this.photoTaken = false;
    this.photoFile = null;
    this.updateSubmitButton();
    this.stopCamera();
  }

  deletePhoto() {
    const photoCanvas = document.getElementById("photo-canvas");
    const retakeButton = document.getElementById("retake-button");
    const deleteButton = document.getElementById("delete-button");
    const galleryOption = document.getElementById("open-gallery");
    const cameraOption = document.getElementById("open-camera");

    if (photoCanvas) photoCanvas.style.display = "none";
    if (retakeButton) retakeButton.style.display = "none";
    if (deleteButton) deleteButton.style.display = "none";

    this.photoFile = null;
    this.photoTaken = false;

    if (galleryOption) galleryOption.style.display = "block";
    if (cameraOption) {
      cameraOption.style.display = "block";
      cameraOption.textContent = "Open Camera";
    }

    this.stopCamera();
    this.updateSubmitButton();
  }

  handleFileSelect(e) {
    if (e.target.files && e.target.files.length > 0) {
      this.photoFile = e.target.files[0];

      if (this.photoFile.size > this.MAX_FILE_SIZE) {
        alert("File size exceeds 1MB limit. Please choose a smaller file.");
        this.photoFile = null;
        return;
      }

      this.photoTaken = true;
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const photoCanvas = document.getElementById("photo-canvas");
          const ctx = photoCanvas.getContext("2d");
          const retakeButton = document.getElementById("retake-button");
          const deleteButton = document.getElementById("delete-button");
          const galleryOption = document.getElementById("open-gallery");
          const cameraOption = document.getElementById("open-camera");
          const cameraSelect = document.getElementById("camera-select");

          const imgAspect = img.width / img.height;
          let drawWidth,
            drawHeight,
            drawX = 0,
            drawY = 0;

          if (imgAspect > this.previewAspectRatio) {
            drawHeight = this.targetHeight;
            drawWidth = drawHeight * imgAspect;
            drawX = (this.targetWidth - drawWidth) / 2;
          } else {
            drawWidth = this.targetWidth;
            drawHeight = drawWidth / imgAspect;
            drawY = (this.targetHeight - drawHeight) / 2;
          }

          photoCanvas.width = this.targetWidth;
          photoCanvas.height = this.targetHeight;
          ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

          if (drawX !== 0 || drawY !== 0) {
            const croppedCanvas = document.createElement("canvas");
            croppedCanvas.width = this.targetWidth;
            croppedCanvas.height = this.targetHeight;
            const croppedCtx = croppedCanvas.getContext("2d");
            croppedCtx.drawImage(
              photoCanvas,
              Math.max(0, -drawX),
              Math.max(0, -drawY),
              this.targetWidth,
              this.targetHeight,
              0,
              0,
              this.targetWidth,
              this.targetHeight
            );
            ctx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
            ctx.drawImage(croppedCanvas, 0, 0);
          }

          if (photoCanvas) photoCanvas.style.display = "block";
          if (retakeButton) retakeButton.style.display = "block";
          if (deleteButton) deleteButton.style.display = "block";
          if (galleryOption) galleryOption.style.display = "none";
          if (cameraOption) cameraOption.style.display = "none";
          if (cameraSelect) cameraSelect.style.display = "none";
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(this.photoFile);
      this.updateSubmitButton();
    }
  }

  stopCamera() {
    const captureButton = document.getElementById("capture-button");
    const galleryOption = document.getElementById("open-gallery");
    const cameraSelect = document.getElementById("camera-select");
    const videoElement = document.getElementById("camera-preview");

    const cameraOption = document.getElementById("open-camera");
    if (cameraOption) {
      cameraOption.textContent = "Open Camera";
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (videoElement) {
      videoElement.srcObject = null;
      videoElement.style.display = "none";
    }

    if (captureButton) captureButton.style.display = "none";
    if (galleryOption) galleryOption.style.display = "block";
    if (cameraSelect) cameraSelect.style.display = "none";

    this.cameraActive = false;
  }

  setupAuthorOption(changeHandler) {
    const checkbox = document.getElementById("post-anonymously");
    if (checkbox) {
      checkbox.addEventListener("change", changeHandler);
    }
  }
}
