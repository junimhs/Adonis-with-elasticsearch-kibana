"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Product extends Model {}

Product.INDEX = "products";
Product.TYPE = "products";
Product.PROPERTIES = {
  id: { type: "integer" },
  name: { type: "text" },
  price: { type: "integer" },
  description: { type: "text" }
};

module.exports = Product;
