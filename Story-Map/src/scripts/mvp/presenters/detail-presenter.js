import StoryDetailModel from "../models/detail-model";
import StoryDetailView from "../views/detail-view";

export default class StoryDetailPresenter {
  constructor(view, storyId) {
    this.view = view;
    this.model = new StoryDetailModel();
    this.storyId = storyId;
    this.init();
  }

  async init() {
    try {
      const story = await this.model.getStoryById(this.storyId);
      this.view.renderStory(story);
      this.view.initMap(story.lat, story.lon);
    } catch (error) {
      this.view.renderError(error.message);
    }
  }
}
