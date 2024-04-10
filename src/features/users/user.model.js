export default class UserModel {
  constructor(username, email, hashedPassword) {
    this.username = username;
    this.email = email;
    this.hashedPassword = hashedPassword;
  }
}

var users = [];
