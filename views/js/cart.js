async function getProducts2js(user) {
    if (user) {
        console.log(firebase.auth().currentUser.email);
        var queryurl = "/api/basketQuery.json?&email=" + firebase.auth().currentUser.email;


        $.get(queryurl).then(response => {
           console.log(response)
           
           productArr = response.jsonProducts.productArr;
           let subtot = 0;
           productArr.forEach( (row) => {

            pid = row.id;
            pname = row.name;
            quantity = row.quantity;
            info = row.info;
            link = row.link;
            price = row.price; 
            distributor = row.distributor
 
            subtot+=price * quantity;
            var cartRowContents = `
         <div" width="100" height="100">
         <img size="200" src="${link}"> 
                 <span class="cart-item-title">Name: ${pname}</span>
             </div>
             <span class="cart-price cart-column">Price: ${price}₺</span>
             <span class="cart-price cart-column">Quantity: ${quantity}</span>
             <div class="cart-quantity cart-column">

                 <button onclick="addP(${pid})" type="button">Add</button>
                 <button class="btn btn-danger" onclick="rmP(${pid})"type="button">REMOVE</button>
             </div>
             `
            var cartRow = document.createElement('div')
            //cartRow.classList.add('cart-row')    
            cartRow.innerHTML = cartRowContents
            document.getElementById("productRows").append(cartRow);
           })
            
           let ship = 50/subtot;
           let taxes = subtot * 0.06
           let tot = subtot - ship - taxes;
           
           document.getElementById("subtot").innerHTML = subtot.toFixed(2);
           document.getElementById("ship").innerHTML = ship.toFixed(2);
           document.getElementById("taxes").innerHTML = taxes.toFixed(2);
           document.getElementById("tot").innerHTML = tot.toFixed(2);
           
        })
    }
    else {
        console.log("no user");
    }
}
firebase.auth().onAuthStateChanged(user => getProducts2js(user));



function addP(pid){
    queryurl = "/api/add2basket?&email=" + firebase.auth().currentUser.email + "&pid=" + pid;
    axios.put(queryurl).then(
    (response) => {
      var result = response.data;
      console.log('Processing Request');
      

      resolve(result);

    },
    (error) => {
        reject(error);
        }
    );
        location.reload()
}
   function rmP(pid){
    queryurl = "/api/decrementFromBasket?email=" + firebase.auth().currentUser.email + "&pid=" + pid;
    axios.get(queryurl).then(
    (response) => {
      var result = response.data;
      console.log('Processing Request');
      resolve(result);
    },
    (error) => {
        reject(error);
        }
    );
    location.reload(); 

   }