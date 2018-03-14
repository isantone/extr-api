const Json = require('./json');

module.exports = class ProductsJson extends Json {
  getProductsFromCategory(categoryUrlName) {
    return this.getElementsByPropertyValue("category", categoryUrlName);
  }

  getItemById(itemId) {
    return this.getElementByPropertyValue("id", itemId);
  }

  findItemByTitle(title) {
    return this.filterElementsByPropertyValue("title", title);
  }
};