class CurrentUser {
  constructor() {
    if (!CurrentUser.instance) {
      this.userInfo = null;  // Initial user info is null
      CurrentUser.instance = this;
    }
    return CurrentUser.instance;c // Return the singleton instance
  }

  // Set the current user info during login
  setUserInfo(userInfo) {
    this.userInfo = userInfo;
  }

  // Get the current user info
  getUserInfo() {
    return this.userInfo;
  }

  // Get the current user's UID
  getUserUID() {
    return this.userInfo ? this.userInfo.uid : null;
  }

  // Get the current user's email
  getUserEmail() {
    return this.userInfo ? this.userInfo.email : null;
  }

  // Reset the user info (for logout or clearing the session)
  resetUserInfo() {
    this.userInfo = null;
  }
}

// Ensure singleton instance
const instance = new CurrentUser();


export default instance;
