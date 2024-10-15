class CurrentUser {
    constructor() {
      if (!CurrentUser.instance) {
        this.userInfo = null;  // Initial user info is null
        CurrentUser.instance = this;
      }
      return CurrentUser.instance;
    }
  
    // Set user info (you can pass the Firebase Auth user data here)
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
    }
  
    // Get the current user info
    getUserInfo() {
      return this.userInfo;
    }


    resetUserInfo() {
      this.userInfo = null;
    }
}

  
  const instance = new CurrentUser();
  Object.freeze(instance);  // Freeze the instance to prevent modifications
  
  export default instance;
  //the following will be the code for the current adding employee file
