process.env.MODE = 'test';

const assert = require('chai').assert;
const app = require('../app');
const stop = require('../app').stop;

const chai = require('chai');
const chaiHttp = require('chai-http');
//const server = require('../server');
const should = chai.should();
const expect = chai.expect();

const users = require('../data/users');
const catalog = require('../data/catalog');
const products = require('../data/products');

//const host = 'http://localhost:3003/api';

chai.use(chaiHttp);

describe('GET ALL USERS request of App:', function() {
  after(() => {
    stop();
  });

  it('Response status is 200', (done) => {
    chai.request(app)
      .get('/api/users')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('Response is array', (done) => {
    chai.request(app)
      .get('/api/users')
      .end((err, res) => {
        res.body.should.be.a('array');
        done();
      });
  });

  it('Response array is equal to test array', (done) => {
    chai.request(app)
      .get('/api/users')
      .end((err, res) => {
        res.body.should.be.eql(users);
        done();
      });
  });

  it('it should GET first product', (done) => {
    chai.request(app)
      .get('/api/products/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.be.eql(products[0]);

        done();
      });
  });
});

describe('GET CATALOG request of App:', function() {
  after(() => {
    stop();
  });

  it('Response status is 200', (done) => {
    chai.request(app)
      .get('/api/categories')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('Response is array', (done) => {
    chai.request(app)
      .get('/api/categories')
      .end((err, res) => {
        res.body.should.be.a('array');
        done();
      });
  });

  it('Response array is equal to test array', (done) => {
    chai.request(app)
      .get('/api/categories')
      .end((err, res) => {
        res.body.should.be.eql(catalog);
        done();
      });
  });
});  

describe('GET FIRST PRODUCT request of App:', function() {
  after(() => {
    stop();
  });

  it('Response status is 200', (done) => {
    chai.request(app)
      .get('/api/products/1')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('Response is array', (done) => {
    chai.request(app)
      .get('/api/categories')
      .end((err, res) => {
        res.body.should.be.a('array');
        done();
      });
  });

  it('Response array is equal to test array', (done) => {
    chai.request(app)
      .get('/api/products/1')
      .end((err, res) => {
        res.body.should.be.eql(products[0]);
        done();
      });
  });
}); 

describe('POST LOGIN request of App for existent user:', function() {
  after(() => {
    stop();
  });

  it('Response status is 200', (done) => {
    chai.request(app)
      .post('/api/login')
      .type('form')
      .send({
        'email': 'user@user.com',
        'password': 'user'
      })
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });

  it('Response logged user is equal to a test user', (done) => {
    chai.request(app)
      .post('/api/login')
      .type('form')
      .send({
        "email": "user@user.com",
        "password": "user"
      })
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.be.eql(users[0]);
        done();
      });
  });
});

describe('POST LOGIN request of App for nonexistent user:', function() {
  after(() => {
    stop();
  });

  it('Response status is 401', (done) => {
    chai.request(app)
      .post('/api/login')
      .type('form')
      .send({
        'email': 'user@u',
        'password': 'user123'
      })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('Response is object', (done) => {
    chai.request(app)
      .post('/api/login')
      .type('form')
      .send({
        'email': 'nosuchuser@fantom.com',
        'password': 'nosuchpasword',
      })
      .end((err, res) => {
        res.body.should.be.a('object');
        done();
      });
  });

  it('Response object is equal to test object', (done) => {
    chai.request(app)
      .post('/api/login')
      .type('form')
      .send({
        'email': 'nosuchuser@fantom.com',
        'password': 'nosuchpasword',
      })
      .end((err, res) => {
        res.body.should.be.eql({
          "success": false,
          "message": "Invalid email or password."
      });
        done();
      });
  });
});