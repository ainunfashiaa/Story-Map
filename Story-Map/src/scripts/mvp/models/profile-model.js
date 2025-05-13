import AuthService from "../../services/auth-service";

export default class ProfileModel {
  static getUserData() {
    return AuthService.getUserData();
  }

  static logout() {
    return AuthService.logout();
  }
}
