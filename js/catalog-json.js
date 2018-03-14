const Json = require('./json');

module.exports = class CatalogJson extends Json {
  // constructor(...rest) {
  //   super(...rest);
  //   this.getCategoryByName = super.getElementByPropertyValue.bind(this, "name");
  // }
  getCategoryByName(name) {
    return this.getElementByPropertyValue("name", name);
  }
};