import ProfilePresenter from "../../mvp/presenters/profile-presenter";
import ProfileView from "../../mvp/views/profile-view";
import ProfileModel from "../../mvp/models/profile-model";

export default class ProfilePage {
  async render() {
    const view = new ProfileView();
    const user = ProfileModel.getUserData();
    return view.render(user);
  }

  async afterRender() {
    const view = new ProfileView();
    new ProfilePresenter(view);
  }
}
