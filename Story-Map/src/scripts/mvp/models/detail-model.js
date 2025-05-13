import StoryApi from "../../data/api";

export default class StoryDetailModel {
  async getStoryById(id) {
    try {
      const story = await StoryApi.getStoryById(id);
      return story;
    } catch (error) {
      console.error("StoryDetailModel error:", error);
      throw error;
    }
  }
}
