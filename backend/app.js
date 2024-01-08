const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt')
const  errorHandler  = require('./helpers/error-handler')
require("dotenv/config");
app.use(cors());
app.options('*', cors)
const api = process.env.API_URL;

// middleware
app.use(bodyParser.json()); // json converter
app.use(morgan("tiny")); // logger
app.use(authJwt());
// handling error
app.use(errorHandler)

const categoriesRouter = require('./routers/category');
const usersRouter = require('./routers/user');
const ordersRouter = require("./routers/order");
const productsRouter = require("./routers/product");

// ROUTERS 
app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);


// DB CONNECTION
mongoose.connect(process.env.DB_CONNECTION_STRING, { })
  .then(() => {
    console.log(process.env.DB_CONNECTION_READY);
  })
  .catch((err) => {
    console.log(err);
  });

// APP
app.listen(3000, () => {
  console.log(api);
  console.log(process.env.SERVER_RUNS_ON);
});
