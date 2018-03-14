module.exports = {
  host: {
    url: "http://localhost:3003/",
    api: {
      url: "http://localhost:3003/api/"
    }
  },

  client: {
    url: "http://localhost:7777"
  },

  cart: {
    url: "/cart"
  },

  categories: {
    url: "/categories",
    category: {
      url: "/categories/:categoryName",
      products: {
        url: "/categories/:categoryName/products",
        product: {
          url: "/products/:itemId"
        }
      }
    }
  },

  type: {
    url: "/type",
    products: {
      url: "/type/:typeName/products"
    }
  },

  users: {
    url: "/users",
    user: {
      url: "/users/:userLogin"
    }
  },

  login: {
    url: "/login"
  },

  register: {
    url: "/register"
  },

  search: {
    url: "/search"
  }
};