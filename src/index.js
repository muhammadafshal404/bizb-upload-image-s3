import pkg from "../package.json";
import SimpleSchema from "simpl-schema";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import fileUpload from "express-fileupload";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import _ from "lodash";
import S3Upload from "./utils/s3Upload.js";
const mySchema = importAsString("./schema.graphql");

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
    // enable files upload
    app.expressApp.use(
      fileUpload({
        createParentPath: true,
      })
    );

    //add other middleware
    app.expressApp.use(cors());
    app.expressApp.use(bodyParser.json());
    app.expressApp.use(bodyParser.urlencoded({ extended: true }));
    app.expressApp.use(morgan("dev"));
    app.expressApp.post("/upload", async (req, res) => {
console.log(process.env);
console.log("req.body",req.body)
      let isMulti=req.body.isMulti;
      let uploadPath=req.body.uploadPath;

      let uploads = [];
      try {
        if (!req.files) {
          res.send({
            status: false,
            message: "No file uploaded",
          });
        } else if(isMulti=='true') {
          let data = [];

          //loop all files
          _.forEach(_.keysIn(req.files.photos), (key) => {
            let photo = req.files.photos[key];
            let promise = S3Upload(
              req.files.photos[key].data,
              "userProducts/" + req.files.photos[key].name,key
            ).then((uploadResponse) => {
              console.log("upload resposne", uploadResponse);
            if(uploadResponse["key"]){
              data[uploadResponse["key"]].url=uploadResponse.url
            }  
            });
            uploads.push(promise);
            //push file details
            data.push({
              name: photo.name,
              mimetype: photo.mimetype,
              size: photo.size,
            });
          });
          Promise.all(uploads)
            .then(async function () {
              console.log(data);
              res.send({
                status: true,
                message: "Files are uploaded",
                data: data,
              });
            })
            .catch(function (err) {
              console.log(err);
              res.send(err);
            });
          //return response
        }else if(isMulti=='false'){
          let data = [];

             //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
             let photo = req.files.photos;
             data.push({
              name: photo.name,
              mimetype: photo.mimetype,
              size: photo.size,
            });
          S3Upload(
              req.files.photos.data,
              uploadPath + req.files.photos.name,0
            ).then((uploadResponse) => {
            
              data[0].url=uploadResponse.url
             
            res.send({
              status: true,
              message: 'File is uploaded',
              data
          });
            });
 
          
        }
      } catch (err) {
        console.lofg("err", err);
        res.status(500).send(err);
      }
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
async function S3PublishMedia(
  catalogProduct,
  { context, product, shop, variants }
) {
  const { app, collections, rootUrl } = context;
  const { Product } = collections;
  // let productObj=await getProductMedia(context,catalogProduct.productId);
  catalogProduct.media = product.media;
  catalogProduct.primaryImage = product.media[0];
  catalogProduct.variants &&
    catalogProduct.variants.map(async (catalogVariant) => {
      const productVariant = variants.find(
        (variant) => variant._id === catalogVariant.variantId
      );
      catalogVariant.uploadedBy = productVariant.uploadedBy || null;
      catalogVariant.ancestorId = productVariant["ancestors"][0]
        ? productVariant["ancestors"][0]
        : null;

      catalogVariant.media = productVariant.media;
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
      resolvers,
    },
  });
}
