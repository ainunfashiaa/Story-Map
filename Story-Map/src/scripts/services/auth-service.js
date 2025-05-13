import CONFIG from "../config";

class AuthService {
  static async register({ name, email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || "Registration failed");
      }

      // Automatically login after registration
      const loginResult = await this.login(email, password);

      return {
        error: false,
        message: "Registration successful",
        data: loginResult.data,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        error: true,
        message: error.message,
      };
    }
  }

  static async login(email, password) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseJson = await response.json();

      if (!response.ok) {
        throw new Error(responseJson.message || "Login failed");
      }

      // Save auth data and trigger UI update
      this.saveAuthData(responseJson.loginResult);

      return {
        error: false,
        message: "Login successful",
        data: responseJson,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        error: true,
        message: error.message,
      };
    }
  }

  static logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Notify the app about auth state change
    this._dispatchAuthEvent();
    window.location.hash = "#/login";
  }

  static saveAuthData(authData) {
    localStorage.setItem("authToken", authData.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: authData.name,
        email: authData.email,
        userId: authData.userId,
      })
    );
    // Notify the app about auth state change
    this._dispatchAuthEvent();
  }

  static getAuthToken() {
    return localStorage.getItem("authToken");
  }

  static getUserData() {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }

  static isAuthenticated() {
    return !!this.getAuthToken();
  }

  static async verifyToken() {
    try {
      const token = this.getAuthToken();
      if (!token) return false;

      const response = await fetch(`${CONFIG.BASE_URL}/check-token`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Token verification error:", error);
      return false;
    }
  }

  static _dispatchAuthEvent() {
    // Create and dispatch custom event
    const event = new Event("authStateChanged");
    document.dispatchEvent(event);
  }
}

export default AuthService;
