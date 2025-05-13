import StoryApi from "../../data/api";

export default class HomeModel {
  static async getStories(params = {}) {
    try {
      const stories = await StoryApi.getAllStories(params);
      return stories;
    } catch (error) {
      console.error("HomeModel error:", error);
      throw error;
    }
  }
}
