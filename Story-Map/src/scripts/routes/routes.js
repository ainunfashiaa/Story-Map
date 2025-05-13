import HomePage from "../pages/home/home-page";
import SubmitPage from "../pages/submit/submit-page";
import LoginPage from "../pages/login/login-page";
import SignupPage from "../pages/signup/signup-page";
import ProfilePage from "../pages/profile/profile-page";
import DetailPage from "../pages/detail/detail-page";

const routes = {
  "/": new HomePage(),
  "/submit": new SubmitPage(),
  "/login": new LoginPage(),
  "/signup": new SignupPage(),
  "/profile": new ProfilePage(),
  "/detail/:id": new DetailPage(),
};

export default routes;
