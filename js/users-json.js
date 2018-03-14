const Json = require('./json');

module.exports = class UsersJson extends Json {
  // constructor(...rest) {
  //   super(...rest);
  //   this.getUserByEmail = super.getElementByPropertyValue.bind(this, "email");
  // }

  getUserByEmail(userEmail) {
    console.log("--->" + userEmail);
    console.log("--->" + typeof(userEmail));
    return this.getElementByPropertyValue("email", userEmail);
  }

  getUserByToken(userToken) {
    const tokenArray = userToken.split(' '); //OR store "BEARER *TOKEN*" in database
    const tokenType = tokenArray[0];
    const token = Number(tokenArray[1]);

    if (tokenType === "Bearer") {
      return this.getElementByPropertyValue("token", token);
    }
  }

  getUserByCredentials(userEmail, userPassword) {
    const resultUser = this.obj.find(user => {
      return user.email === userEmail && user.password === userPassword;
    });
    return resultUser;
  }
};