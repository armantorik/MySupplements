// Users Module: Middleman between db and server requests
// All the functions related to users are implemented here
// User info, add2basket, getBasket, getProfile, editProfile, orderBasket and etc should be defined here

const { admin, db, firebase } = require('../../utils/admin');
var debug = require('debug')('user')
var product = require("../products/products")

// Get the `FieldValue` object
const FieldValue = admin.firestore.FieldValue;


exports.createAccount = async function createAccount(email, fname, lname, address, phone, gender, bio) {
    debug(email)
    const data = {
        "fname": fname,
        "lname": lname,
        "address": address,
        "phone": phone,
        "gender": gender,
        "bio": bio
    };
    await db.collection('users').doc(email).set(data);
    return true;

};

exports.removeAccount = async function createAccount(email) {
    var exist = db.collection("users").doc(email);
    exist.get().then((docSnapshot) => async function () {
        if (docSnapshot.exists) {
            const res = await db.collection('users').doc('email').delete();
            return true;
        } else {
            return false;
        }
    });
}

exports.getProductsFromBasket = async function (email) {
    const usersRef = db.collection('users').doc(email);
    const userDoc = await usersRef.get();
    var jsonProducts = {};
    if (userDoc.data().userCart) {

        var productArr = [];
        var userCart = userDoc.data().userCart;

        async function add2json() {
            for (const proOfCart of userCart) {

                var basketGet = await proOfCart.get()

                basket = basketGet.data();
                var productRef = basket.product;
                if (productRef) {
                    var productGet = await productRef.get()

                    product = productGet.data();
                    pid = productGet.id;
                    debug(productGet)
                    productArr.push({
                        "id": pid,
                        "name": product.name,
                        "info": product.info,
                        "link": product.thumbnailUrl,
                        "cQuantity": basket.quantity,
                        "pQuantity": product.quantity,

                        "price": product.price
                    })

                }
            }
            jsonProducts.productArr = productArr;
            return jsonProducts;
        }
        return await add2json();
    }
    else return jsonProducts.exist = "false";
}
exports.add2basket = async function (email, pid) {

    var basketCol = db.collection('basket');
    const snapshot = await basketCol.where('user', '==', db.doc('users/' + email)).where('product', '==', db.doc('Products/' + pid)).get();
    if (!(snapshot.size > 0)) { // If no user and product combination is in basket, then create a new one
            var newId;
            await db.collection('basket').add({
                quantity: 1,
                product: db.doc('Products/' + pid),
                user: db.doc('users/' + email)
            })
                .then(function (docRef) {
                    newId = docRef.id;
                })
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                    return false;
                });

            await db.collection('users').doc(email).update({
                userCart: admin.firestore.FieldValue.arrayUnion(db.doc('basket/' + newId))
            })
            .catch((error) => {
                console.log(error)
                return false;
            })
        return true;
    }
    else { // Increment the quantity of basket element with email and pid

        var currId, oldQuantity;

        snapshot.forEach(doc => {
            currId = doc.id;
            oldQuantity = doc.data().quantity
        })

        const basketRef2update = db.collection('basket').doc(currId.toString());

        await basketRef2update.update({ quantity: oldQuantity + 1 }).catch((error)=>{
            return error
        });
    }
}

exports.postcomment = async function (email, pid, comment) {

  //Eğer hiç comment atılmamışsa önce comment map array ini açması
  //daha once comment atmış mı tara

  var can_comment = true;
  var productRef = db.collection('Products').doc(pid);
  const productDoc = await productRef.get();
  var comment_array = productDoc.get('comments');

//   function between(min, max) {  
//     return Math.floor(
//       Math.random() * (max - min) + min
//     )
//   }

  const new_comment = {
    //cid:between(0,2329328),
    comment: comment,
    user: email,
    verified: false
  };

  if(comment_array == null)
  {
      const res = await db.collection('Products').doc(pid).update({
        comments: new_comment
     });
      return true;
  }
  
  for (const commentx of comment_array)
  {
    if(commentx.user == email)
    {
        can_comment = false;
        break;
    }
  }

  console.log(can_comment)

  if (can_comment == false) { // If the user has already made a comment for this product do not allow for a new one
    return false;
  }
  else{ //atmadıysa burda comment atabilir yazdığı comment database de comments arrayine gidicek userid ile birlikte

      // Add a new comment to the comment_array
     const res = await db.collection('Products').doc(pid).update( {
        comments: admin.firestore.FieldValue.arrayUnion(new_comment)
       
     });
     return true;
  }
  
}

exports.postrating = async function (email, pid, rating) { // şu an integer üzerinden çalışıyor float a convertlemek lazım
  
    var has_rated = false;
    var rating_num = Number(rating);
    var productRef = db.collection('Products').doc(pid);
    const productDoc = await productRef.get();
    var rating_array = productDoc.get('ratings');
    var rating_count = productDoc.get('rating_count');
    var overall_rating = productDoc.get('ovr_rating');

    const new_rating = {
        rating: rating_num,
        user: email
    };

    console.log(rating_array)

    if(rating_array == null)
    {
        const res = await db.collection('Products').doc(pid).update({
            ratings: new_rating
        });
        const res2 = await db.collection('Products').doc(pid).update({
            rating_count: 1
        });
        const res3 = await db.collection('Products').doc(pid).update({
            ovr_rating: rating_num
        });

        console.log(new_rating, rating_num)

        return true;
    } 
    for (const ratingx of rating_array)
    {
        if(ratingx.user == email)
        {
            has_rated = true;
            break;
        }
    }

    if (has_rated == true) { // If the user has already rated this product update it with the new rating
        return false;
    }
    else{ //atmadıysa burda yeni rating

        // Add a new rating to the rating_array
        const res = await db.collection('Products').doc(pid).update( {
            ratings: admin.firestore.FieldValue.arrayUnion(new_rating)        
        });
        const res3 = await db.collection('Products').doc(pid).update({
            ovr_rating: ((overall_rating*rating_count) + rating_num)/(rating_count+1)
        });
        const res2 = await db.collection('Products').doc(pid).update({
            rating_count: rating_count+1
        });
       
        return true;
    }
}




exports.removeFromBasket = async function rmBasket(email, pid) { // Delete a basket document without looking 

    const basketRef = await db.collection('basket').where('user', '==', db.doc('users/' + email)).where('product', '==', db.doc('Products/' + pid))

    basketRef.get().then(function (querySnapshot) {
        if (!querySnapshot.empty)
            querySnapshot.forEach(async function (doc) {
                var idRemove = doc.id
                const res = await db.collection('users').doc(email).update({
                    userCart: FieldValue.arrayRemove(db.doc('/basket/' + idRemove))
                })
                doc.ref.delete();
            });

        else {
            debug("null")
            return null
        }
    });
}

exports.decrementFromBasket = async function (email, pid) {
    const basketRef = await db.collection('basket').where('user', '==', db.doc('users/' + email)).where('product', '==', db.doc('Products/' + pid))

    basketRef.get().then(function (querySnapshot) {

        if (!querySnapshot.empty)
            querySnapshot.forEach(async function (doc) {
                let data = doc.data()
                let refId = doc.id
                let quantity = data.quantity;
                if (quantity > 1) {
                    await db.collection('basket').doc(refId).update({ quantity: quantity - 1 });
                }
                else {
                    exports.removeFromBasket(email, pid);
                }
            });

        else {
            debug("null")
            return null
        }

    })
}


exports.order = async function (email) {
    const usersRef = db.collection('users').doc(email); // user reference
    const userDoc = await usersRef.get(); // user get

    if (userDoc.exists && userDoc.data().userCart) { // If user exists and has no empty basket

        var data = userDoc.data();
        var userCart = data.userCart; // user's cart


        /************** Create new order document *****************/
        const order = {
            "user": db.doc('users/' + email),
            "status": "Processing",
            "orderTime": FieldValue.serverTimestamp()
        };

        var orderRef = await db.collection('orders').add(order);
        var id = orderRef.id;
        /**********************************************************/




        /**************************  ITERATE OVER ITEMS IN BASKET - Start ****************************************/
        userCart.forEach(async function (basketRef) {

            if (basketRef) {


                var basketGet = await basketRef.get()

                basket = basketGet.data();
                var inBasket = basket.quantity;
                var productRef = basket.product;


                 // Decrement products from stocks
                if (productRef) {
                    var productGet = await productRef.get()
                    product = productGet.data(); // fetch current product in cart

                    var oldQuantity = product.quantity
                    await productRef.update({ quantity: oldQuantity - inBasket });
                    var pid = productRef.id;


                    const proInfo = {
                        pid: pid,
                        quantity:inBasket
                    }

                   // var proInfo = {map: (pid, inBasket)}
                    db.collection('orders').doc(id).update({
                        products: FieldValue.arrayUnion(proInfo)
                    })

                }
            }

            basketRef.delete().catch((error) => {
                console.error("Error removing document: ", error);
            });
        })
        /**************************  ITERATE OVER ITEMS IN BASKET - END ****************************************/



        // Remove the 'userCart' field from the document
        const res = await usersRef.update({
            userCart: FieldValue.delete()
        });

        return id;

    }
    else return null;
};

exports.retrieveOrders = async function (email, res) {

    const snapshot = await db.collection("orders").where('user', '==', db.doc('users/' + email)).get();

    var ordersArr = [];
    var count = 0;
    if (snapshot.size > 0) {
        snapshot.forEach(async function (orderRef) {
            var pros = [];
            var order = orderRef.data();
            var oid = orderRef.id;

            for await (pid of order.products)
            {
                var pro = await product.getProducts(pid.pid);
                pros.push(pro.product);
            }
                
            ordersArr.push({
                time: order.orderTime,
                pros: pros,
                status: order.status,
                oid: oid
            });
            
            if (snapshot.size - 1 == count) {
                
                res.jsonp(
                    {
                        orders: ordersArr
                    })
            }
            count += 1;
        })
    }
    else res.status(400);
};


exports.getProfile = async function (email) {
    const usersRef = db.collection('users').doc(email);
    const userDoc = await usersRef.get();
    if (!userDoc.exists) {
        var profile = {
            exist: false
        }
        return profile;

    } else {
        var data = userDoc.data();

        var profile = {
            fname: data.fname,
            lname: data.lname,
            phone: data.phone,
            address: data.address,
            gender: data.gender,
            bio: data.bio,
            exist: true
        }
        return profile;
    }
};


function intersect(a, b) {
    var setB = new Set(b);
    return [...new Set(a)].filter(x => setB.has(x));
  }
exports.search = async (queries) => {


    var union = [];
    var queryArr = queries.split(" ");
    var proJson = {};
    var count = 0;
        for await (const query of queryArr)  {

            const snap = await db.collection("Products").where('keywords', 'array-contains', query).get();
            var proArr = [] // Array of products filtered by query
    
            snap.forEach((product) => {
                proArr.push(product.data());
            });
            
            if (count == 0) {
                union = proArr;
                count++;
            }
            else {
                intersect(union, proArr)
            }
            
        }
        proJson.proArr = union;
        return proJson;
}


exports.getByCat = async (cat) => {

    var snap = await db.collection("Products").where('category', '==', cat).get();

    proJson = {};
    proArr = [];

    snap.forEach((product) => {
        debug(product.data());
        proArr.push(product.data());
    })

    proJson.proArr = proArr;

    return proJson;
}

exports.askToCancel = async (email, oid) => {

    var Query = await db.collection("orders").doc(oid).get();

    var order = Query.data(); // Order that is gonna be cancelled if not already delivered

    if (order) // if oid valid, get user's email
        var verEmail = order.user.id;
    else return null;

    var status = order.status;
    if (status == "Delivered") // if it is delivered, then it is too late
        return null;
    
    if (email == verEmail){ // the emails should match

        await db.collection("orders").doc(oid).update({
            cancelRequest:true // Cancel Request
        })
        return true;
    }
    else return false;




}