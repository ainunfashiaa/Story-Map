import AuthService from "../../services/auth-service";

export default class AuthModel {
  static async login(email, password) {
    try {
      const result = await AuthService.login(email, password);
      if (result.error)
        throw new Error(result.message || "Email or password incorrect");
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static async register(userData) {
    try {
      const result = await AuthService.register(userData);
      if (result.error)
        throw new Error(result.message || "Registration failed");
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Shared validation methods
  static validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static validatePassword(password) {
    return password.length >= 8;
  }

  static validateName(name) {
    return name.length >= 3;
  }

  static validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
  }
}
