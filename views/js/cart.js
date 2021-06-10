
let pLeft = {};
async function getProducts2js() {
    firebase.auth().onAuthStateChanged(async(user) => {
    if (user) {
        console.log(user.email);
        var queryurl = "/basket/";


        $.get(queryurl).then(response => {
           console.log(response)
           
           productArr = response.jsonProducts.productArr;
           let subtot = 0;
           productArr.forEach( (row) => {
            console.log(row)
             var pid = row.id;
             var pname = row.name;
             var cquantity = row.cQuantity;
             var pquantity = row.pQuantity;
             var info = row.info;
             var link = row.link;
             var price = row.price; 
 
            subtot+=price * cquantity;
            
            if (cquantity >= pquantity){
                pLeft[pid] = false;
            }
            else{
                pLeft[pid] = true;
            }
            var cartRowContents = ` <div class="row border-top border-bottom">
            <div class="row main align-items-center">
                <div class="col-2"><img class="img-fluid" src="${link}"></div>
                <div class="col">
                    <div class="row text-muted">${pname}</div>
                    <div class="row">supplements.com</div>
                </div>
                <div class="col"> <a href="#">-</a><a href="#" class="border"> ${cquantity}</a><a href="#">+</a> </div>
                <div class="col">$ ${price}<span class="close">&#10005;</span></div>
            </div>
            </div>`


        //     var cartRowContents = `
        //  <div width="100" height="100">
        //  <img width="200" height="200" > 
        //          <span class="cart-item-title">Name: </span>
        //      </div>
        //      <span class="cart-price cart-column">Price: ${price}₺</span>
        //      <span class="cart-price cart-column">Quantity in basket:</span>
        //      <span class="cart-price cart-column">Available Quantity: ${pquantity}</span>
             
        //      <div class="cart-quantity cart-column">

        //          <button onclick="addP(${pid})" type="button">+</button>
        //          <button class="btn btn-danger" onclick="rmP(${pid})"type="button">-</button>
        //      </div>
        //      `
            document.getElementById("productRows").innerHTML += cartRowContents;
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