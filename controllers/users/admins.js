var crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
var debug = require('debug')('adminController')

const { admin, db, firebase } = require('../../utils/admin');
var bucket = admin.storage().bucket();
const uuid = require('uuid-v4');
const FieldValue = admin.firestore.FieldValue;


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

  
  if (username && password) {
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
    if (body.name.includes("gr")) {
      body.keywords.splice(body.keywords.indexOf("gr"), 1);
    }

    body.publishedDate = FieldValue.serverTimestamp();
    await db.collection("Products").add(body);

  }).catch(console.error);


}

exports.removeProduct = async (pid) => {

  var query =  await db.collection("Products").doc(pid).get();

  if (query){
    await db.collection("Products").doc(pid).delete();
  }
  else{
    return false;
  }

}


exports.pendingComments = async () => {

  var snapshot = await db.collection("Products").get();

  var json = {}
  var jsonArr = []
  snapshot.forEach(pro => { // Iterate through product docs
    var commentArr = pro.data().comments;
    
    if (commentArr.length > 0) {
      debug(commentArr.length)
      var subArr = [];
      var data = {product:pro.data().name, pid:pro.id}
      commentArr.forEach(comment => { // Iterate through comments arr in a product
        if (comment.verified == false){
          subArr.push(comment);
        }
      })
      data.arr = subArr;
      jsonArr.push(data)
    }
    
  })
  json.arr = jsonArr;
  return json;
}

exports.verify = async (pid, cid) => {

  var pro = await db.collection("Products").doc(pid).get()

  if (pro) {
    var comArr = pro.data().comments;
    var count = 0;

    comArr.forEach((comm) => {
     if(comm.user = cid)
      comArr[count].verified = true;
      count+=1;
    })

    var snapshot = await db.collection("Products").doc(pid).update({
      comments:comArr
  });
  }
}


exports.getOrdersToBeCancelled  = async () => {

  var Query = await db.collection("orders").where("cancelRequest", "==", true).get();


  var json = {};
  var jsonArr = [];

  Query.forEach(order => {

    var data = {
      user:order.data().user.id,
      price:order.data().totalPrice,
      date:order.data().orderTime,
      delStatus:order.data().status,
      id:order.id
    }

    jsonArr.push(data)
  
  })

  json.arr = jsonArr;
  return json;
}


exports.cancelOrder = async (oid) => {

  var Query = await db.collection("orders").doc(oid).get();

  var order = Query.data(); // Order that is gonna be cancelled if not already delivered

  var status = order.status;
  if (status == "Delivered") // if it is delivered, then it is too late
    return null;


  if (!order.cancelRequest)
    return false;

  var pros = order.products;


  for await (pro of pros) {
    var pid = pro.pid;
    var qInBasket = pro.quantity;

    var pRef = db.collection("Products").doc(pid);
    var doc = await pRef.get()
    var oldQuantity = doc.data().quantity;

    await pRef.update({
      quantity: oldQuantity + qInBasket
    })
  }


  await db.collection("orders").doc(oid).delete();
  return true;

}

exports.changeStatus = async (oid, newStatus) => {
  var returned;
  var orderRef = db.collection("orders").doc(oid);
  await orderRef.get().then(async (doc) => {
    if (doc.exists) {
      if (newStatus == "Delivered" || newStatus == "Processing" || newStatus == "In-Transit") {
        await db.collection("orders").doc(oid).update({ status: newStatus });
        returned = true;
      }
      returned = false;

    } else {
      console.log("No such document!");
      returned = null;
    }
  }).catch((error) => {
    console.log("Error getting document:", error);
  });

  return returned;

}

exports.getOrders = async () => {

  ordersJson = {};
  orderArr = [];
  var orders = await db.collection("orders").get();
  var count=0;
  orders.forEach(doc => {

    var temp = doc.data();
    count+=1;
    
    var data = {
      date:temp.orderTime,
      price:temp.totalPrice,
      status:temp.status,
      oid:doc.id,
      address:temp.address
    }

    if (temp.products){
      var quan=0;
      temp.products.forEach(pro => {
        quan += pro.quantity;
      })
      data.quantity = quan;
    }
    if (temp.products){
      data.user = temp.user.id;
    }
    orderArr.push(data);
  });
  ordersJson.arr = orderArr;
      return ordersJson;
  
  
};

exports.changePrice = async (pid, newPrice, expiresAt) => {

  var proRef = db.collection("Products").doc(pid);

  var queryRef = await proRef.get();

  var oldPrice = queryRef.data().price;

  if (queryRef.data().discounted)
    return false;

  if (newPrice < oldPrice) {
    await proRef.update({
      discounted: true,
      price: newPrice
    })

    debug(expiresAt)
    var datetime = new Date();
    if (expiresAt < datetime) {
      return false;
    }
    await db.collection("Discounted Products").add({
      product: pid,
      newPrice: newPrice,
      expiresAt: expiresAt,
      oldPrice
    });

  }
  else {
    debug("too exp")
    return false;
  }


}

exports.removeExpired = async () => {

  var datetime = new Date();

  var snapshot = await db.collection("Discounted Products").where("expiresAt", "<=", datetime).get();
  snapshot.forEach(async (doc) => {
    pid = doc.pid;

    await db.collection("Products").doc(pid).update({
      price: discP,
      discounted: false
    });

    doc.delete();

  })

}


