import ProfileModel from "../models/profile-model";

export default class ProfilePresenter {
  constructor(view) {
    this.view = view;
    this.model = ProfileModel;
    this.init();
  }

  init() {
    const user = this.model.getUserData();
    this.view.bindLogout(this.handleLogout.bind(this));
  }

  handleLogout() {
    this.model.logout();
  }
}
