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

        async function add2json(){
            for (const index in userCart) {

                     var basketGet = await userCart[index].get()
    
                     basket = basketGet.data();
                     var productRef = basket.product;
    
                     if (productRef) {
                         var productGet = await productRef.get()
    
                         product = productGet.data();
                         pid = productGet.id;

                         productArr.push({
                             "id": pid,
                             "name": product.name,
                             "info": product.info,
                             "link": product.thumbnailUrl,
                             "quantity": basket.quantity,
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
        var basketRef = basketCol.get().then(async function (snap) {

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
            });
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

        // Set the 'capital' field of the city
        const res = await basketRef2update.update({ quantity: oldQuantity + 1 });
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
                if (productRef) {
                    var productGet = await productRef.get()
                    product = productGet.data(); // fetch current product in cart

                    var oldQuantity = product.quantity
                    const res = await productRef.update({ quantity: oldQuantity - inBasket });

                    db.collection('orders').doc(id).update({
                        products: FieldValue.arrayUnion(productRef.id)
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


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.retrieveOrders = async function (email, res) {
    const usersRef = db.collection('users').doc(email);
    const snapshot = await db.collection("orders").where('user', '==', db.doc('users/' + email)).get();

        var orders = {};
        var ordersArr = [];
        var count=0;
        if (snapshot.size > 0) { 
            snapshot.forEach(async function (orderRef, callback) {
                var pros = [];
                var order = orderRef.data();
                var oid = orderRef.id;
                await Promise.all(
                     order.products.map(async (pid)=>{
                        var pro = await product.getProducts(pid);
                        pros.push(pro.product);
                     })
                )
                    ordersArr.push({
                    time: order.orderTime,
                    pros: pros,
                    status: order.status,
                    oid: oid
                });
                if (snapshot.size - 1 == count){
                    res.jsonp(
                        {
                          orders:ordersArr
                        })
                }
                count+=1;
            })
        }
};


exports.getProfile = async function (email) {
    const usersRef = db.collection('users').doc(email);
    const userDoc = await usersRef.get();
    if (!userDoc.exists) {
        debug('No such document!');

    } else {
        var data = userDoc.data();
        
        var profile = {
            fname:data.fname,
            lname:data.lname,
            phone:data.phone,
            address:data.address,
            gender:data.gender,
            bio:data.bio
        }
        return profile;
    }
};

