'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multer = require('multer');
const upload = multer();
const path = require('path');

const paths = require('./paths');

const router = express.Router();

const UsersJson = require('../js/users-json.js');
const CatalogJson = require('../js/catalog-json.js');
const ProductsJson = require('../js/products-json.js');

const users = new UsersJson(path.join(__dirname, '..', 'data', 'users.json'));
const catalog = new CatalogJson(path.join(__dirname, '..', 'data', 'catalog.json'));
const products = new ProductsJson(path.join(__dirname, '..', 'data', 'products.json'));

function generateRandomToken() {
  return Math.round(Math.random() * 100000000000);
}

router.post(paths.register.url, upload.array(), (req, res) => {
  //res.setHeader("Access-Control-Allow-Credentials", "true");

  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (userEmail && userPassword) {
    let user = users.getUserByEmail(userEmail);
    console.log(">>>>" + user + "<<<<<");
    if (user) {
      res.status(403).send({ success: false, message: 'This email is already taken.'});
    } else {
      //CreateUser//
      console.log("Creating user");
      const newUser = {
        "email": userEmail,
        "password": userPassword,
        "token": generateRandomToken(),
        "cart": []  // OR cart from session storage
      };
      users.obj.push(newUser);
      users.writeInFile();

      res.send({
        token: newUser.token,
        cart: newUser.cart
      });
      //res.send(users.obj);
    }
  } else {
    res.status(403).send({ success: false, message: 'Wrong email or password.'});
  }
});

router.post(paths.login.url, upload.array(), (req, res, next) => {
  const userCredentials = req.body;
  const userEmail = userCredentials.email;
  const userPassword = userCredentials.password;

  const user = users.getUserByCredentials(userEmail, userPassword);

  if (user) {
    user.token = generateRandomToken(); // and -> to session storage // = unAuthorizedToken || userToken
    users.writeInFile();

    res.send({
      token: user.token,
      cart: user.cart
    });
    //res.send(user);
  }
  else {
    res.status(401).send({ success: false, message: 'Invalid email or password.'});
  }
});

router.get(paths.users.url, (req, res) => {
  res.send(users.obj);
});

router.get(paths.users.user.url, (req, res) => {
  const userEmail = req.params.userEmail;
  const user = users.getUserByEmail(userEmail);

  res.send(user);
});

router.get(paths.cart.url, (req, res, next) => {
  const userToken = req.headers.authorization;
  //return res.status(401).send({ success: false, message: 'Hello.'});

  if (userToken) {
    const user = users.getUserByToken(userToken); // || unauthorized cart -> session storage
    //delete user.password;
    if (user) {
      let responseCart = [];
      let index = 0;
      user.cart.forEach((productInCart) => {
        //productInCart.product = products.getItemById(productInCart.id);
        responseCart[index] = {};
        responseCart[index].id = productInCart.id;
        responseCart[index].product = products.getItemById(productInCart.id);
        responseCart[index].quantity = productInCart.quantity;
        index++;
      });
      console.log("-----");
      console.log(user.token);
      console.log(user.cart);
      console.log("-----");

      //res.header('Content-Type', 'application/json');

      //res.send(user);

      res.send({
        token: user.token,
        cart: responseCart
      });
    } else {
      res.status(401).send({ success: false, message: 'Invalid email or password.'});
    }

  } else {
    res.status(401).send({ success: false, message: 'Authorization error: No token provided.'});
  }
});

router.post("/cart", jsonParser, (req, res, next) => {
  //const productId = Number(req.body.id);
  const reqCart = req.body;

  console.log("-----");
  console.log(reqCart);
  console.log("-----");

  if (!reqCart || reqCart.length < 1 || !Array.isArray(reqCart)) return res.sendStatus(400);

  const userToken = req.headers.authorization;

  if (!userToken) return res.status(401).send({ success: false, message: 'Authorization error: No token provided.'});

  if (userToken) {
    const user = users.getUserByToken(userToken);
    if (!user) return res.sendStatus(401); // continue and check availability, etc. ???

    if (reqCart.length > 1)
    {
      reqCart.forEach((cartItem) => {
        const product = products.getItemById(cartItem.id);

        if (product && product.availability && cartItem.quantity) {
          const productInServerCart = user.cart.find(serverCartItem => {
            return serverCartItem.id === cartItem.id;
          });

          if (productInServerCart) {
            productInServerCart.quantity += cartItem.quantity;
          } else {
            user.cart.push({id: cartItem.id, quantity: cartItem.quantity});
          }
        }
      });
    } else {
      const cartItem = reqCart[0];
      const product = products.getItemById(cartItem.id);

      if (product && product.availability) {
        const productInServerCart = user.cart.find(serverCartItem => {
          return serverCartItem.id === cartItem.id;
        });

        if (productInServerCart) {
          productInServerCart.quantity += cartItem.quantity;
        } else {
          user.cart.push({id: cartItem.id, quantity: cartItem.quantity});
        }
      } else {
        return res.status(404).send({ success: false, message: 'This product is unavailable at the moment.'}); // FOR ONE PRODUCT BUT WHAT IF THERE ARE MORE THAN ONE PRODUCT?y
      }
    }
      users.writeInFile();
      //delete user.password;
      res.send({
        token: user.token,
        cart: user.cart
      });
  } else {
    res.status(404).send({ success: false, message: 'This product is unavailable at the moment.'});
  }
});

router.delete(paths.cart.url, jsonParser, (req, res, next) => {
  //const productId = Number(req.body.id);
  const reqCart = req.body;

  if (!reqCart || reqCart.length < 1 || !Array.isArray(reqCart)) return res.sendStatus(400);

  const userToken = req.headers.authorization;

  if (!userToken) return res.status(401).send({ success: false, message: 'Authorization error: No token provided.'});

  if (userToken) {
    const user = users.getUserByToken(userToken);
    if (!user) return res.sendStatus(401);

    if (reqCart.length > 1) //then delete all elements of cart
    {
      reqCart.forEach((cartItem) => {
        const newCart = user.cart.filter(serverCartItem => {
          return serverCartItem.id != cartItem.id;
        });

        user.cart = newCart;
      });
    } else {
      const indexOfEl = user.cart.findIndex(serverCartItem => {
        return serverCartItem.id === reqCart[0].id;
      });
      if (indexOfEl >= 0) {
        user.cart.splice(indexOfEl, 1);
      }
    }
      users.writeInFile();
      //delete user.password;
      res.send({
        token: user.token,
        cart: user.cart
      });
  } else {
    res.status(404).send({ success: false, message: 'This product is unavailable at the moment.'});
  }
});

// router.delete("/cart", upload.array(), (req, res, next) => {
//   const productId = Number(req.body.id);

//   if (productId) {
//     const userToken = req.headers.authorization;
//     if (userToken) {
//         const user = users.getUserByToken(userToken);
//         const indexOfProduct = user.cart.findIndex((element) => {
//           return element.id === productId;
//         });
//         if (indexOfProduct > 0) {
//           console.log(user.cart);
//           user.cart.splice(indexOfProduct, 1);
//           console.log(user.cart);

//           users.writeInFile();
//           //delete user.password;
//           res.send(user);
//         } else {
//           res.status(404).send({ success: false, message: 'Error: No such product in cart.'});
//         }
//     } else {
//       res.status(401).send({ success: false, message: 'Authorization error: No token provided.'});
//     }
//   } else {
//     res.status(404).send({ success: false, message: 'Product error: No product ID provided.'});
//   }
// });

router.get(paths.categories.url, (req, res) => {
  //res.setHeader("Cache-Control", "public, max-age=2592");
  //res.setHeader("Expires", new Date(Date.now() + 2592000).toUTCString());
  //res.setHeader("Access-Control-Allow-Origin", "http://localhost:7777");

  res.send(catalog.obj);
});

router.get(paths.categories.category.url, (req, res) => {
  const name = req.params.categoryName;
  const category = catalog.getCategoryByName(name);

  //res.setHeader("Cache-Control", "public, max-age=2592");
  //res.setHeader("Expires", new Date(Date.now() + 2592000).toUTCString());
  //res.setHeader("Access-Control-Allow-Origin", "http://localhost:7777");

  res.send(category);
});

router.get(paths.categories.category.products.url, (req, res) => {
  const categoryUrlName = req.params.categoryName;
  const items = products.getProductsFromCategory(categoryUrlName);

  //res.setHeader("Cache-Control", "public, max-age=2592");
  //res.setHeader("Expires", new Date(Date.now() + 2592000).toUTCString());
  //res.setHeader("Access-Control-Allow-Origin", "http://localhost:7777");

  res.send(items);
});

router.get(paths.type.products.url, (req, res) => {
  const typeName = req.params.categoryName;
  const items = products.getProductsByType(typeName);

  //res.setHeader("Cache-Control", "public, max-age=2592");
  //res.setHeader("Expires", new Date(Date.now() + 2592000).toUTCString());
  //res.setHeader("Access-Control-Allow-Origin", "http://localhost:7777");

  res.send(items);
});

router.get(paths.categories.category.products.product.url, (req, res) => {
  const itemId = Number(req.params.itemId);
  const item = products.getItemById(itemId);

  //res.setHeader("Cache-Control", "public, max-age=2592");
  //res.setHeader("Expires", new Date(Date.now() + 2592000).toUTCString());
  //res.setHeader("Access-Control-Allow-Origin", "http://localhost:7777");

  res.send(item);
});

router.get(paths.search.url, (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery || searchQuery == " " || searchQuery.length < 2) return res.send([]);

  let result = products.findItemByTitle(searchQuery);

  // if (result.length == 0) {
  //   res.send([{ title: "No results for your query"}]);
  // }
  console.log(result);

  res.send(result);
});

module.exports = router;
