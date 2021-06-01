
let pLeft = {};
async function getProducts2js() {
    firebase.auth().onAuthStateChanged(async(user) => {
    if (user) {
        console.log(user.email);
        var queryurl = "/api/basketQuery.json";


        $.get(queryurl).then(response => {
           console.log(response)
           
           productArr = response.jsonProducts.productArr;
           let subtot = 0;
           productArr.forEach( (row) => {

            pid = row.id;
            pname = row.name;
            cquantity = row.cQuantity;
            pquantity = row.pQuantity;
            info = row.info;
            link = row.link;
            price = row.price; 
            distributor = row.distributor
 
            subtot+=price * cquantity;
            
            if (cquantity >= pquantity){
                pLeft[pid] = false;
            }
            else{
                pLeft[pid] = true;
            }

            var cartRowContents = `
         <div width="100" height="100">
         <img width="200" height="200" src="${link}"> 
                 <span class="cart-item-title">Name: ${pname}</span>
             </div>
             <span class="cart-price cart-column">Price: ${price}₺</span>
             <span class="cart-price cart-column">Quantity in basket: ${cquantity}</span>
             <span class="cart-price cart-column">Available Quantity: ${pquantity}</span>
             
             <div class="cart-quantity cart-column">

                 <button onclick="addP(${pid})" type="button">+</button>
                 <button class="btn btn-danger" onclick="rmP(${pid})"type="button">-</button>
             </div>
             `
            var cartRow = document.createElement('div')
            cartRow.innerHTML = cartRowContents
            document.getElementById("productRows").append(cartRow);
           })
            
           let ship = 50/subtot;
           let taxes = subtot * 0.06
           let tot = subtot + ship + taxes;
           
           document.getElementById("subtot").innerHTML = subtot.toFixed(2);
           document.getElementById("ship").innerHTML = ship.toFixed(2);
           document.getElementById("taxes").innerHTML = taxes.toFixed(2);
           document.getElementById("tot").innerHTML = tot.toFixed(2);
           
        })
    }
    else {
        console.log("no user");
    }
})
}

getProducts2js();



function addP(pid){

    if(pLeft[pid] == false) // if no product left
    {
        alert("Sorry! No product left")
    }
    else {
    queryurl = "/api/add2basket" + firebase.auth().currentUser.email + "&pid=" + pid;
    axios.get(queryurl).then(
    (response) => {
      var result = response.data;
      console.log('Processing Request');
    
      getProducts2js();
      $("#shopping-cart--list").load(location.href + " #productRows");

    },
    (error) => {
        reject(error);
        }
    );
}
}
   function rmP(pid){
    queryurl = "/api/decrementFromBasket?email=" + firebase.auth().currentUser.email + "&pid=" + pid;
    axios.get(queryurl).then(
    (response) => {
      getProducts2js();
      $("#shopping-cart--list").load(location.href + " #productRows");
      resolve(result);
    },
    (error) => {
        reject(error);
        }
    );
    
   }