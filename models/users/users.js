// Users Module: Middleman between db and server requests
// All the functions related to users are implemented here
// User info, add2basket, getBasket, getProfile, editProfile, orderBasket and etc should be defined here

const { admin, db, firebase } = require('../../utils/admin');
var debug = require('debug')('user')


// Get the `FieldValue` object
const FieldValue = admin.firestore.FieldValue;


exports.createAccount = async function createAccount(email, fname, lname, address, phone, gender, bio) {

    const data = {
        "fname": fname,
        "lname": lname,
        "address": address,
        "phone": phone,
        "gender": gender,
        "bio": bio
    };
    var add2DB = await db.collection('users').doc(email).set(data);
    return add2DB;
};

exports.getProductsFromBasket = async function (email) {
    const usersRef = db.collection('users').doc(email);
    const userDoc = await usersRef.get();

    if (!userDoc.exists) {
        debug('No such document!');

    } else {

        var jsonProducts = {};
        var productArr = [];

        var data = userDoc.data();
        // const usersRef = db.collection('users').doc(email).where();
        if (!data.userCart) {
            jsonProducts.exist = "false";
            return jsonProducts;
        }

        else {
            var userCart = data.userCart;
            async function waitData(userCart) {
                userCart.forEach(async function (basketRef) {

                    if (basketRef) {

                        var basketGet = await basketRef.get()

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
                })
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve("foreach loop Return");
                    }, 800);
                });
            }

            waitData(userCart).then(() => {

                jsonProducts.productArr = productArr;
            })

        }

    }

    await new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
    return jsonProducts;

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
                });

            await db.collection('users').doc(email).update({
                userCart: admin.firestore.FieldValue.arrayUnion(db.doc('basket/' + newId))
            });

        })
            .catch((error) => {
                console.log(error)
            })

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

exports.removeFromBasket = async function rmBasket (email, pid) { // Delete a basket document without looking 

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
            if (quantity > 1){
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
    const usersRef = db.collection('users').doc(email);
    const userDoc = await usersRef.get();

    if (!userDoc.exists) {
        debug('No such document!');

    } else if (userDoc.data().userCart) {

        var total_price = 0;
        var data = userDoc.data();

        var userCart = data.userCart;


        userCart.forEach(async function (basketRef) {

            if (basketRef) {

                var basketGet = await basketRef.get()

                basket = basketGet.data();
                var inBasket = basket.quantity;
                var productRef = basket.product;

                if (productRef) {
                    var productGet = await productRef.get()
                    product = productGet.data();

                    var oldQuantity = product.quantity

                    total_price += product.price * inBasket;
                    const res = await productRef.update({ quantity: oldQuantity - inBasket });
                }
            }

            basketRef.delete().then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });
        })

        // Remove the 'userCart' field from the document
        const res = await usersRef.update({
            userCart: FieldValue.delete()
        });

    }
};
