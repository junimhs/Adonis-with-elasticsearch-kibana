"use strict";

const Product = use("App/Models/Product");
const Env = use("Env");
const elasticsearch = use("elasticsearch");

const esHost = Env.get("ELASTICSEARCH_HOST", "127.0.0.1");
const esPort = Env.get("ELASTICSEARCH_PORT", "9200");
const esLog = Env.get("ELASTICSEARCH_LOG", "trace");
const esClient = new elasticsearch.Client({
  host: esHost + ":" + esPort,
  log: esLog
});

class ProductController {
  async index({ request, response, view }) {
    let params = {
      index: Product.INDEX,
      body: {
        query: {
          match_all: {}
        }
      }
    };

    const { q } = request.get();

    if (q) {
      params = {
        index: Product.INDEX,
        q: q
      };
    }

    const products = await esClient.search(params);

    let data = [];

    if (products.hits.hits) {
      products.hits.hits.forEach(function(product) {
        data.push(product._source);
      });
    }

    return {
      message: "Product List",
      data
    };
  }
  async store({ request, response }) {
    const { name, price, description } = request.all();

    const product = await Product.create({
      name,
      price,
      description
    });

    // Criando o dado no elasticsearch
    esClient.index({
      index: Product.INDEX,
      type: Product.TYPE,
      id: product.id,
      body: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description
      }
    });

    return {
      message: "Product Created",
      data: product
    };
  }
  async search({ request, response, params: { query } }) {
    const products = await esClient.search({
      index: Product.INDEX,
      body: {
        query: {
          // match: {
          //   slug: query,
          // }
          multi_match: {
            query: query,
            fields: ["name", "description"]
          }
        }
      }
    });

    let data = [];
    if (products.hits.hits) {
      products.hits.hits.forEach(function(product) {
        data.push(product._source);
      });
    }

    return {
      message: "Search result",
      data
    };
  }

  async teste({ request, response }) {
    const dados = await Product.all();

    return dados;
  }
}

module.exports = ProductController;
