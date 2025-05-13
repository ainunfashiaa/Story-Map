import AuthPresenter from "../../mvp/presenters/auth-presenter";
import BaseAuthView from "../../mvp/views/base-auth-view";

export default class SignupPage {
  async render() {
    return `
      <div class="signup-view">
        <div class="hero">
          <h2>Create Your Account</h2>
          <p>Join our community of storytellers</p>
        </div>

        <form id="signupForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              placeholder="Your full name"
              required
              aria-describedby="name-error"
              aria-invalid="false"
              autocomplete="name"
            >
            <div class="error-message" id="name-error" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="your@email.com" 
              required
              aria-describedby="email-error"
              aria-invalid="false"
              autocomplete="username"
            >
            <div class="error-message" id="email-error" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="••••••••" 
              required
              minlength="8"
              aria-describedby="password-error"
              aria-invalid="false"
              autocomplete="new-password"
            >
            <div class="error-message" id="password-error" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              placeholder="••••••••" 
              required
              minlength="8"
              aria-describedby="confirmPassword-error"
              aria-invalid="false"
              autocomplete="new-password"
            >
            <div class="error-message" id="confirmPassword-error" role="alert"></div>
          </div>

          <button type="submit" class="submit-button" id="submit-button" disabled data-default-text="Sign Up">
            Sign Up
          </button>

          <div class="form-feedback" id="form-feedback" role="alert"></div>

          <div class="auth-switch">
            Already have an account? <a href="#/login" class="auth-link">Log in</a>
          </div>
        </form>
      </div>
    `;
  }

  async afterRender() {
    const view = new BaseAuthView("signupForm");
    new AuthPresenter(view, {
      mode: "register",
      loadingText: "Creating account...",
      successMessage: "Registration successful! Redirecting to login...",
      errorMessage: "Registration failed. Please try again.",
      redirectTo: "#/login",
      redirectDelay: 1500,
    });
  }
}
