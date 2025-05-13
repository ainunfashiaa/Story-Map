import HomeModel from "../models/home-model";
import HomeView from "../views/home-view";

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.model = HomeModel;
    this.init();
  }

  init() {
    this.view.initMap();
    this.loadStories();
    this.view.bindSearch(this.handleSearch.bind(this));
    this.view.bindRetry(this.loadStories.bind(this));
    this.view.bindCardClick(this.handleCardClick.bind(this));
  }

  handleCardClick(storyId) {
    window.location.hash = `#/detail/${storyId}`;
  }

  async loadStories() {
    try {
      this.view.renderLoading();
      const stories = await this.model.getStories();

      if (stories.length === 0) {
        this.view.renderEmpty();
      } else {
        this.view.renderStories(stories);
      }
    } catch (error) {
      this.view.renderError(error.message);
    }
  }

  handleSearch(searchTerm) {
    this.view.filterStories(searchTerm);
  }
}
