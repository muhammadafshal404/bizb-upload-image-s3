import fs from "fs";
import AWS from "aws-sdk";
import sharp from "sharp";

// Enter copied or downloaded access ID and secret key here
// const ID = "";
// const SECRET = "";
// const REGION = "";

// The name of the bucket that you have created
const BUCKET_NAME = "landofsneakers";
const s3 = new AWS.S3({
  accessKeyId:process.env.ID,
  secretAccessKey:process.env.SECRET,
  region:process.env.REGION,
});

export default function S3Upload(fileContent, uploadName, key) {
  return new Promise(function (resolve, reject) {
    // console.log("fileName,uploadName", fileName, uploadName);
    // const fileContent = fs.readFileSync(fileName);

    // sharp(fileContent)
    // .resize({
    //   height: size,
    //   fit: sharp.fit[fit],
    //   withoutEnlargement: true,
    // })
    // .webp({ lossless: false, alphaQuality: 50, quality: 80 })
    // .toFile("./upload/thumb" + ".webp")
    // .then(() => {
    //   console.log("thumb generation complete");

    // });

    // Setting up S3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: uploadName, // File name you want to save as in S3
      Body: fileContent,
    };

    try {
      // Uploading files to the bucket
      s3.upload(params, function (err, data) {
        if (err) {
          console.log("oh la la ");
          reject(err);
        }
        resolve({
          status: true,
          msg: `File uploaded successfully. ${data.Location}`,
          key,
          url: data.Location,
        });
      });
    } catch (err) {
      console.log("S3 Upload Handler");
      console.log(err);
    }
  });
}
