
// import sharp from "sharp";

// const imgTransforms = [
//     {
//       name: "image",
//       transform: { size: 1600, fit: "inside", format: "jpg", type: "image/jpeg" },
//     },
//     {
//       name: "large",
//       transform: { size: 1000, fit: "inside", format: "jpg", type: "image/jpeg" },
//     },
//     {
//       name: "medium",
//       transform: { size: 600, fit: "inside", format: "jpg", type: "image/jpeg" },
//     },
//     {
//       name: "thumbnail",
//       transform: { size: 235, fit: "inside", format: "png", type: "image/png" },
//     },
//   ];
//   export default  function imageTransform(filename){

//   sharp(filename)
//   .resize({
//     height: size,
//     fit: sharp.fit[fit],
//     withoutEnlargement: true,
//   })
//   .webp({ lossless: false, alphaQuality: 50, quality: 80 })
//   .toFile("/thumb" + ".webp")
//   .then(() => {

//   });
// }