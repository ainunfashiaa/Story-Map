import AuthModel from "../models/auth-model";

export default class AuthPresenter {
  constructor(view, options = {}) {
    this.view = view;
    this.model = AuthModel;
    this.options = options;
    this.hasInteracted = {};

    this.init();
  }

  init() {
    // Initialize hasInteracted for all fields
    const inputs = Array.from(this.view.form.querySelectorAll("input"));
    inputs.forEach((input) => {
      this.hasInteracted[input.id] = false;
    });

    this.view.bindInputValidation(this.handleInputValidation.bind(this));
    this.view.bindSubmitForm(this.handleSubmit.bind(this));
  }

  handleInputValidation(field, isBlur) {
    if (isBlur) {
      this.hasInteracted[field] = true;
    }

    this.validateField(field);
    this.validateForm();
  }

  validateField(field) {
    const value = document.getElementById(field)?.value.trim();
    const password =
      field === "confirmPassword"
        ? document.getElementById("password")?.value.trim()
        : null;

    if (!this.hasInteracted[field]) return false;

    if (!value) {
      this.view.showError(field, `${this.getFieldLabel(field)} is required`);
      return false;
    }

    if (field === "email" && !this.model.validateEmail(value)) {
      this.view.showError(field, "Please enter a valid email");
      return false;
    }

    if (field === "name" && !this.model.validateName(value)) {
      this.view.showError(field, "Name must be at least 3 characters");
      return false;
    }

    if (field === "password" && !this.model.validatePassword(value)) {
      this.view.showError(field, "Password must be at least 8 characters");
      return false;
    }

    if (
      field === "confirmPassword" &&
      !this.model.validatePasswordMatch(password, value)
    ) {
      this.view.showError(field, "Passwords do not match");
      return false;
    }

    this.view.clearError(field);
    return true;
  }

  getFieldLabel(field) {
    const labels = {
      name: "Full name",
      email: "Email",
      password: "Password",
      confirmPassword: "Password confirmation",
    };
    return labels[field] || field;
  }

  validateForm() {
    const inputs = Array.from(this.view.form.querySelectorAll("[required]"));
    const isValid = inputs.every((input) => this.validateField(input.id));
    this.view.setSubmitButtonState(false, "", isValid);
    return isValid;
  }

  async handleSubmit(formData) {
    if (!this.validateForm()) {
      this.view.focusFirstError();
      return;
    }

    try {
      this.view.setSubmitButtonState(
        true,
        this.options.loadingText || "Processing..."
      );

      let result;
      if (this.options.mode === "login") {
        result = await this.model.login(formData.email, formData.password);
      } else {
        result = await this.model.register(formData);
      }

      if (result.success) {
        this.view.setFormFeedback(
          this.options.successMessage || "Success!",
          true
        );
        if (this.options.redirectTo) {
          this.view.redirectTo(
            this.options.redirectTo,
            this.options.redirectDelay || 1500
          );
        }
      }
    } catch (error) {
      this.view.setFormFeedback(
        error.message || this.options.errorMessage || "An error occurred"
      );
      this.view.setSubmitButtonState(false);
    }
  }
}
