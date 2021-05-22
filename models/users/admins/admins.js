var crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
var debug = require('debug')('user')

const { admin, db, firebase } = require('../../../utils/admin');
var bucket = admin.storage().bucket();
const uuid = require('uuid-v4');



function hash(password) { // implementation of hashing
  var md5sum = crypto.createHash('md5');

  md5sum.update(password);
  var hashed = md5sum.digest('hex');
  return hashed;
}

var metadata = {};
async function uploadFile(iname, file, encoding = 'ascii') {
  return new Promise((resolve, reject) => {
    const tempPath = path.join(os.tmpdir(), 'ecommerce-');
    fs.mkdtemp(tempPath, async (err, folder) => {
      if (err)
        reject(err)
      const name = path.join(folder, iname);
      fs.writeFile(name, file.buffer, encoding, async (error_file) => {
        if (error_file)
          reject(error_file);


        metadata = {
          metadata: {
            // This line is very important. It's to create a download token.
            firebaseStorageDownloadTokens: uuid()
          },
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000',
        };
        // Uploads a local file to the bucket
        await bucket.upload(name, {
          // Support for HTTP requests made with `Accept-Encoding: gzip`
          gzip: true,
          metadata: metadata,
        });

        console.log(`${file} uploaded.`);


        resolve(name)
      })
    })
  })


}

exports.login = async (username, password) => {

  var receivedHashedPass = hash(password);

  let adminRef = await db.collection('admins').doc(username).get();
  var adminUser = adminRef.data();

  if (receivedHashedPass == adminUser.hashedPassword) {
    return adminUser.isPmOrSm;

  }
  else {
    return null;
  }
}

exports.addProduct = (image, body) => {

  uploadFile(image.originalname, image).then(async () => {

    // Add thumbnailUrl
    body.thumbnailUrl = "https://firebasestorage.googleapis.com/v0/b/ecommerce-ca57f.appspot.com/o/" + image.originalname + "?alt=media&token=" +
      metadata.metadata.firebaseStorageDownloadTokens;

    // Add keywords to search
    body.keywords = body.name.split(" ");
    if (body.name.includes("gr")){
      body.keywords.splice(body.keywords.indexOf("gr"), 1);  
    }

    await db.collection("Products").add(body);

  }).catch(console.error);


}



exports.getInvoices = async () => {
  var ordersRef = db.collection("orders");
  const snapshot = await ordersRef.get();

  var jsonOrd = {};
  arrOrd = [];

  snapshot.forEach(order => {
    arrOrd.push(order.data());
  })
  jsonOrd.arrOrd = arrOrd;
  return jsonOrd;
}
