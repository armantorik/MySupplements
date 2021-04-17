// Users Module: Middleman between db and server requests
// All the functions related to users are implemented here
// User info, add2basket, getBasket, getProfile, editProfile, orderBasket and etc should be defined here

const { admin, db, firebase } = require('../../utils/admin');
var debug = require('debug')('user')



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
        var userCart = data.userCart;
        async function waitData(userCart) {
            userCart.forEach(async function (basketRef) {

                if (basketRef) {
                    debug("basketRef\n" + basketRef)

                    var basketGet = await basketRef.get()
                    debug("basketGet\n" + basketGet)

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
                            "link": product.link,
                            "quantity":basket.quantity,
                            "price": product.price
                        })
                    debug(productArr)

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
            debug("just before return:")
            debug(jsonProducts);
        })

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

    if (snapshot.empty) { // If no user and product combination is in basket, then create a new one
        var basketRef = basketCol.get().then(async function (snap) {
            var newId;
            debug("1")
            await db.collection('basket').add({
                quantity: 1,
                 product: db.doc('Products/' + pid),
                  user: db.doc('users/' + email)
            }).then(function(docRef) {
                newId = docRef.id;
            })
            .catch(function(error) {
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
        //var oldQuantity = await basketCol.where('user', '==', '/users/'+email).where('product', '==', '/Products/'+pid).get()
        var currId, oldQuantity;
        
        snapshot.forEach(doc=>{
            currId = doc.id;
            oldQuantity = doc.data().quantity
        })

        

        const basketRef2update = db.collection('basket').doc(currId.toString());

        // Set the 'capital' field of the city
        const res = await basketRef2update.update({quantity: oldQuantity+1});
        debug(res)
    }
}

