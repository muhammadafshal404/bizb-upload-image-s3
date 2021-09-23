import pkg from "../package.json";
import SimpleSchema from "simpl-schema";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
const mySchema = importAsString("./schema.graphql");

var _context = null;

const resolvers = {
  Product: {
    async media(parent, args, context, info) {

      return parent.media;
    },
  },
};
async function getProductMedia(
  context,
  productId
 
) {
  const { collections } = context;
  const { Products } = collections;

  const selector = {
    "_id":productId
  };
console.log(selector)

  return Products.findOne(selector);
}


function myStartup1(context) {
  _context = context;
  const { app, collections, rootUrl } = context;
  if (app.expressApp) {
    app.expressApp.post("/uploadByURL", function (req, res, next) {
      console.log("body",req.body)
      // write your callback code here.
      res.send("asdasdasds")
    });
  }

  const ImageSizes = new SimpleSchema({
    large: {
      type: String,
      label: "Large",
      optional: true,
    },
    medium: {
      type: String,
      label: "Medium",
      optional: true,
    },
    original: {
      type: String,
      label: "Original",
      optional: true,
    },
    small: {
      type: String,
      label: "Small",
      optional: true,
    },
    thumbnail: {
      type: String,
      label: "Thumbnail",
      optional: true,
    },
  });
  const ImageInfo = new SimpleSchema({
    priority: {
      type: Number,
      defaultValue: 0,
    },
    productId: {
      type: String,
      label: "Product Id",
    },
    variantId: {
      type: String,
      label: "Variant Id",
      optional: true,
    },
    URLs: {
      type: ImageSizes,
      optional: true,
    },
  });

  context.simpleSchemas.Product.extend({
    media: {
      type: Array,
      label: "Media",
      optional: true,
    },
    "media.$": {
      type: ImageInfo,
    },
    mediaS3: {
      type: Array,
      label: "Media",
      optional: true,
    },
    "mediaS3.$": {
      type: ImageInfo,
    },
  });
  context.simpleSchemas.ProductVariant.extend({
    media: {
      type: Array,
      label: "Media",
      optional: true,
    },
    "media.$": {
      type: ImageInfo,
    },
    mediaS3: {
      type: Array,
      label: "Media",
      optional: true,
    },
    "mediaS3.$": {
      type: ImageInfo,
    },
  });
}

// The new myPublishProductToCatalog function parses our products,
// gets the new uploadedBy attribute, and adds it to the corresponding catalog variant in preparation for publishing it to the catalog
async function S3PublishMedia(catalogProduct,{ context, product, shop, variants }) {
  const { app, collections, rootUrl } = context;
const {Product}=collections;
// let productObj=await getProductMedia(context,catalogProduct.productId);
catalogProduct.media=product.media;
catalogProduct.primaryImage=product.media[0];
  catalogProduct.variants &&
    catalogProduct.variants.map(async (catalogVariant) => {
      const productVariant = variants.find(
        (variant) => variant._id === catalogVariant.variantId
      );
      catalogVariant.media=productVariant.media;
    });
}

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Image to S3",
    name: "images-S3",
    version: pkg.version,
    functionsByType: {
      startup: [myStartup1],
      publishProductToCatalog: [S3PublishMedia],
    },
    graphQL: {
      schemas: [mySchema],
      resolvers
    },
  });
}
