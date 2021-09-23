import pkg from "../package.json";
import SimpleSchema from "simpl-schema";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
const mySchema = importAsString("./schema.graphql");
// import getMedia from "./utils/getMedia.js";

var _context = null;

const resolvers = {
  Product: {
    async media(parent, args, context, info) {

      return parent.media;
    },
  },
};
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
  });
}

// The new myPublishProductToCatalog function parses our products,
// gets the new uploadedBy attribute, and adds it to the corresponding catalog variant in preparation for publishing it to the catalog
function myPublishProductToCatalog(
  catalogProduct,
  { context, product, shop, variants }
) {
  // catalogProduct.variants &&
  //   catalogProduct.variants.map((catalogVariant) => {
  //     const productVariant = variants.find(
  //       (variant) => variant._id === catalogVariant.variantId
  //     );
  //     catalogVariant.uploadedBy = productVariant.uploadedBy || null;
  //   });
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
      publishProductToCatalog: [myPublishProductToCatalog],
    },
    graphQL: {
      schemas: [mySchema],
      resolvers
    },
  });
}
