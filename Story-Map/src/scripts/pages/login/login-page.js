import AuthPresenter from "../../mvp/presenters/auth-presenter";
import BaseAuthView from "../../mvp/views/base-auth-view";

export default class LoginPage {
  async render() {
    return `
      <div class="login-view">
        <div class="hero">
          <h2>Welcome back!</h2>
          <p>Log in to access your stories</p>
        </div>

        <form id="loginForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="email">Email</label>
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
            <div class="password-wrapper">
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required
                minlength="8"
                aria-describedby="password-error"
                aria-invalid="false"
                autocomplete="current-password"
              >
              <button type="button" class="toggle-password" aria-label="Show password">
                <i class="ph ph-eye"></i>
              </button>
            </div>
            <div class="error-message" id="password-error" role="alert"></div>
          </div>

          <button type="submit" class="submit-button" id="submit-button" disabled data-default-text="Log In">
            Log In
          </button>

          <div class="form-feedback" id="form-feedback" role="alert"></div>

          <div class="auth-switch">
            Don't have an account? <a href="#/signup" class="auth-link">Sign up</a>
          </div>
        </form>
      </div>
    `;
  }

  async afterRender() {
    const view = new BaseAuthView("loginForm");
    new AuthPresenter(view, {
      mode: "login",
      loadingText: "Logging in...",
      successMessage: "Login successful! Redirecting...",
      errorMessage: "Email or password incorrect",
      redirectTo: "#/",
    });

    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.getElementById("password");

    togglePassword?.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePassword.innerHTML = isPassword
        ? '<i class="ph ph-eye-slash"></i>'
        : '<i class="ph ph-eye"></i>';
      togglePassword.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
      );
    });
  }
}
