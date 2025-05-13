import AuthService from "../../services/auth-service";
import CONFIG from "../../config";

export default class SubmitModel {
  static async submitStory(data) {
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("photo", data.photoFile);
    formData.append("lat", data.location.lat);
    formData.append("lon", data.location.lng);

    const isGuest = !AuthService.isAuthenticated() || data.postAnonymously;
    const url = isGuest
      ? `${CONFIG.BASE_URL}${CONFIG.STORIES_ENDPOINT}/guest`
      : `${CONFIG.BASE_URL}${CONFIG.STORIES_ENDPOINT}`;

    const options = {
      method: "POST",
      body: formData,
    };

    if (!isGuest) {
      options.headers = {
        Authorization: `Bearer ${AuthService.getAuthToken()}`,
      };
    }

    const response = await fetch(url, options);
    return response.json();
  }

  static getUserData() {
    return AuthService.getUserData();
  }

  static isAuthenticated() {
    return AuthService.isAuthenticated();
  }
}
