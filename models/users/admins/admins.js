var crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
var debug = require('debug')('user')

const { admin, db, firebase } = require('../../../utils/admin');
var bucket = admin.storage().bucket();
const uuid = require('uuid-v4');



function hash(password){ // implementation of hashing
    var md5sum = crypto.createHash('md5');

    md5sum.update(password);
    var hashed = md5sum.digest('hex');
    return hashed;
}

async function uploadFile(iname, file, encoding = 'ascii') {
  return new Promise((resolve, reject) => {
    const tempPath = path.join(os.tmpdir(), 'ecommerce-');
    fs.mkdtemp(tempPath, async (err, folder) => {
        if (err) 
            reject(err)
        const name = path.join(folder, iname);
        fs.writeFile(name, file.buffer, encoding, async(error_file) => {
            if (error_file) 
                reject(error_file);


                const metadata = {
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

    if (receivedHashedPass == adminUser.hashedPassword){
        return adminUser.isPmOrSm;

    }
    else{
        return null;
    }
}

exports.addProduct = async (image, body) => {

    uploadFile(image.originalname, image).catch(console.error);
    var add = await db.collection("Products").add(body);

}