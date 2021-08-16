// Products Module:
// getProduct function returns the array consisting all of the products

const { db } = require("../../utils/admin");

exports.getProducts = async function getProducts(pid) {

    productsJson = {};
    productsArr = [];
    if (typeof pid == "undefined") {
        let productsRef = db.collection('Products');
        const snapshot = await productsRef.get();

        snapshot.forEach(doc => {
            var data = doc.data();
            data.id = doc.id;
            productsArr.push(data);
        });
        productsJson.arr = productsArr;
    } else {
        var products = await db.collection('Products').doc(pid).get();
        productsJson.product = products.data();
    }

    return productsJson;

};