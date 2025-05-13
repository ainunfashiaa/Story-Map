export default class ProfileView {
  constructor() {
    this.logoutButton = null;
  }

  render(user) {
    return `
      <div class="profile-view">
        <div class="profile-header">
          <h3>User Profile</h3>
        </div>
        
        <div class="profile-content">
          <div class="profile-image">
            <img src="/images/image.jpg" alt="Profile photo" class="profile-photo">
          </div>
          
          <div class="profile-info">
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
          </div>
          
          <button id="logout-button" class="logout-button">
            Logout
          </button>
        </div>
      </div>
    `;
  }

  bindLogout(handler) {
    this.logoutButton = document.getElementById("logout-button");
    if (this.logoutButton) {
      this.logoutButton.addEventListener("click", handler);
    }
  }
}
