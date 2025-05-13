import CONFIG from "../config";
import AuthService from "../services/auth-service";

class StoryApi {
  static async _makeAuthenticatedRequest(url, options = {}) {
    const token = AuthService.getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (response.status === 401) {
      AuthService.logout();
      window.location.hash = "#/login";
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Request failed with status ${response.status}`
      );
    }

    return response;
  }

  static async getAllStories(params = {}) {
    try {
      const url = new URL(`${CONFIG.BASE_URL}${CONFIG.STORIES_ENDPOINT}`);

      Object.keys(params).forEach((key) => {
        url.searchParams.append(key, params[key]);
      });

      const response = await this._makeAuthenticatedRequest(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data.listStory || [];
    } catch (error) {
      console.error("Error in getAllStories:", error);
      throw error;
    }
  }

  static async createStory(storyData) {
    try {
      const formData = new FormData();
      formData.append("description", storyData.description);
      formData.append("photo", storyData.photo);

      if (storyData.lat && storyData.lon) {
        formData.append("lat", storyData.lat);
        formData.append("lon", storyData.lon);
      }

      const response = await this._makeAuthenticatedRequest(
        `${CONFIG.BASE_URL}${CONFIG.STORIES_ENDPOINT}`,
        {
          method: "POST",
          body: formData,
        }
      );

      return await response.json();
    } catch (error) {
      console.error("Error in createStory:", error);
      throw error;
    }
  }

  static async getStoryById(id) {
    try {
      const response = await this._makeAuthenticatedRequest(
        `${CONFIG.BASE_URL}${CONFIG.STORIES_ENDPOINT}/${id}`
      );

      const data = await response.json();
      return data.story || data;
    } catch (error) {
      console.error("Error in getStoryById:", error);
      throw error;
    }
  }
}

export default StoryApi;
