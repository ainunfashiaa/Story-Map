export default class BaseAuthView {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.submitButton = document.getElementById("submit-button");
    this.formFeedback = document.getElementById("form-feedback");
  }

  bindInputValidation(handler) {
    const inputs = Array.from(this.form.querySelectorAll("input"));

    inputs.forEach((input) => {
      input.addEventListener("blur", () => handler(input.id, true));
      input.addEventListener("input", () => handler(input.id, false));

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const currentIndex = inputs.indexOf(input);
          if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
          } else {
            this.submitButton.focus();
          }
        }
      });
    });
  }

  bindSubmitForm(handler) {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = this.getFormData();
      await handler(formData);
    });

    this.submitButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.form.dispatchEvent(new Event("submit"));
      }
    });
  }

  getFormData() {
    const formData = {};
    Array.from(this.form.elements).forEach((element) => {
      if (element.name) {
        formData[element.name] = element.value.trim();
      }
    });
    return formData;
  }

  showError(field, message) {
    const input = document.getElementById(field);
    const errorElement = document.getElementById(`${field}-error`);

    input?.classList.add("input-error");
    input?.setAttribute("aria-invalid", "true");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  clearError(field) {
    const input = document.getElementById(field);
    const errorElement = document.getElementById(`${field}-error`);

    input?.classList.remove("input-error");
    input?.setAttribute("aria-invalid", "false");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }

  setFormFeedback(message, isSuccess = false) {
    this.formFeedback.textContent = message;
    this.formFeedback.style.display = message ? "block" : "none";
    this.formFeedback.setAttribute("role", "alert");
    this.formFeedback.className = isSuccess
      ? "form-feedback success"
      : "form-feedback error";
  }

  setSubmitButtonState(isLoading, text = "", isEnabled = true) {
    this.submitButton.disabled = !isEnabled || isLoading;
    this.submitButton.textContent =
      text || this.submitButton.dataset.defaultText;
    this.submitButton.setAttribute("aria-busy", isLoading.toString());
  }

  focusFirstError() {
    const firstErrorField = document.querySelector('[aria-invalid="true"]');
    if (firstErrorField) {
      firstErrorField.focus();
    }
  }

  redirectTo(hash, delay = 0) {
    setTimeout(() => {
      window.location.hash = hash;
    }, delay);
  }
}
