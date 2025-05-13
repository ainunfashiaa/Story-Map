import SubmitModel from "../models/submit-model";
import SubmitView from "../views/submit-view";

export default class SubmitPresenter {
  constructor(view) {
    this.view = view;
    this.model = SubmitModel;
    this.postAnonymously = false;
    this.init();
  }

  init() {
    this.view.initializeMap();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Bind map events
    this.view.bindMapEvents(() => this.updateMapFromInput());

    // Bind camera events
    this.view.bindCameraEvents({
      toggleCamera: () => this.toggleCamera(),
      capturePhoto: () => this.capturePhoto(),
      retakePhoto: () => this.retakePhoto(),
      openGallery: () => this.openGallery(),
      deletePhoto: () => this.deletePhoto(),
      changeCamera: (deviceId) => this.changeCamera(deviceId),
    });

    // Bind form events
    this.view.bindFormEvents(
      (e) => this.handleSubmit(e),
      () => this.updateSubmitButton()
    );

    // Bind anonymous checkbox
    this.view.setupAuthorOption((e) => {
      this.postAnonymously = e.target.checked;
    });
  }

  async toggleCamera() {
    try {
      if (this.view.cameraActive) {
        await this.view.stopCamera();
        this.view.cameraActive = false;
      } else {
        await this.view.setupCamera();
        this.view.cameraActive = true;

        document.querySelector("#open-camera").textContent = "Close Camera";
        document.querySelector("#open-gallery").style.display = "none";
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Could not access camera. Please check permissions.");
      this.view.cameraActive = false;
      this.view.stopCamera();
    }
  }

  async capturePhoto() {
    try {
      await this.view.capturePhoto();
      this.updateSubmitButton();
    } catch (error) {
      console.error("Capture error:", error);
    }
  }

  retakePhoto() {
    this.view.retakePhoto();
    this.updateSubmitButton();
  }

  openGallery() {
    // Create hidden file input if not exists
    if (!this.fileInput) {
      this.fileInput = document.createElement("input");
      this.fileInput.type = "file";
      this.fileInput.accept = "image/*";
      this.fileInput.style.display = "none";
      this.fileInput.addEventListener("change", (e) =>
        this.handleFileSelect(e)
      );
      document.body.appendChild(this.fileInput);
    }
    this.fileInput.click();
  }

  handleFileSelect(e) {
    this.view.handleFileSelect(e);
    this.updateSubmitButton();
  }

  deletePhoto() {
    this.view.deletePhoto();
    this.updateSubmitButton();
  }

  async changeCamera(deviceId) {
    try {
      if (this.view.stream) {
        this.view.stream.getTracks().forEach((track) => track.stop());
      }

      this.view.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: this.view.targetWidth },
          height: { ideal: this.view.targetHeight },
        },
      });

      const videoElement = document.getElementById("camera-preview");
      videoElement.srcObject = this.view.stream;
    } catch (error) {
      console.error("Camera change error:", error);
      alert("Failed to switch camera");
    }
  }

  updateMapFromInput() {
    this.view.updateMapFromInput();
    this.updateSubmitButton();
  }

  updateSubmitButton() {
    this.view.updateSubmitButton();
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    try {
      this.setSubmitButtonState(true, "Submitting...");

      const formData = this.prepareFormData();

      const response = await this.model.submitStory(formData);

      if (response.error) {
        throw new Error(response.message);
      }

      this.handleSubmissionSuccess();
    } catch (error) {
      this.handleSubmissionError(error);
    } finally {
      this.setSubmitButtonState(false, "Share Your Memory");
    }
  }

  validateForm() {
    const description = document
      .getElementById("story-description")
      .value.trim();

    if (!description) {
      alert("Please add a description");
      return false;
    }

    if (!this.view.selectedLocation) {
      alert("Please select a location on the map");
      return false;
    }

    if (!this.view.photoFile) {
      alert("Please add a photo");
      return false;
    }

    return true;
  }

  prepareFormData() {
    const description = document
      .getElementById("story-description")
      .value.trim();

    return {
      description,
      photoFile: this.view.photoFile,
      location: this.view.selectedLocation,
      postAnonymously: this.postAnonymously,
    };
  }

  setSubmitButtonState(isSubmitting, text) {
    const submitButton = document.getElementById("submit-button");
    submitButton.disabled = isSubmitting;
    submitButton.textContent = text;
  }

  handleSubmissionSuccess() {
    alert("Story shared successfully!");
    window.location.hash = "#/";
  }

  handleSubmissionError(error) {
    console.error("Submission error:", error);

    if (
      error.message.includes("token") ||
      error.message.includes("authentication")
    ) {
      AuthService.logout();
      window.location.hash = "#/login";
    } else {
      alert(`Error: ${error.message || "Failed to submit story"}`);
    }
  }
}
