
let pLeft = {};
async function getProducts2js() {
    firebase.auth().onAuthStateChanged(async(user) => {
    if (user) {
        console.log(user.email);
        var queryurl = "/basket/";
        
        var totQuantity = 0;

        $.get(queryurl).then(response => {
           console.log(response)
           
           productArr = response.jsonProducts.productArr;
           let subtot = 0;

           document.getElementById("row").innerHTML = ""
           document.getElementById("productRows").innerHTML = ""
           document.getElementById("row").innerHTML = ""

           productArr.forEach( (row) => {
            console.log(row)
             var pid = row.id;
             var pname = row.name;
             var cquantity = row.cQuantity;
             totQuantity+=cquantity;
             var pquantity = row.pQuantity;
             var info = row.info;
             var link = row.link;
             var price = row.price; 
 
             var singleItemsPrice = price * cquantity;
            subtot+=singleItemsPrice;
            
            if (cquantity >= pquantity){
                pLeft[pid] = false;
            }
            else{
                pLeft[pid] = true;
            }
            var cartRowContents = 

            document.getElementById("productRows").innerHTML += ` <div class="row border-top border-bottom">
            <div class="row main align-items-center">
                <div class="col-2"><img class="img-fluid" src="${link}"></div>
                <div class="col">
                    <div class="row text-muted">${pname}</div>
                    <div class="row">supplements.com</div>
                </div>
                <div class="col"> <a onclick="decrementP('${pid}')">-</a><a class="border"> ${cquantity}</a><a onclick="addP('${pid}')">+</a> </div>
                <div class="col">$ ${price}<span onclick="rmP('${pid}')" class="close">&#10005;</span></div>
            </div>
            </div>`;

            document.getElementById("row").innerHTML += `<div class="col" style="padding-left:0;">${pname}</div>
            <div class="col text-right">$ ${singleItemsPrice.toFixed(2)}</div>`
            
           })
            
           totQuantity
           document.getElementById("itemCount").innerHTML = totQuantity + " items";
           document.getElementById("totP").innerHTML = subtot.toFixed(2);
           
        })
    }
    else {
        console.log("no user");
    }
})
}

getProducts2js();


async function addP(pid){

    if(pLeft[pid] == false) // if no product left
    {
        alert("Sorry! No product left")
    }
    else {

        if (!pid) {alert("Error in pid!"); return;}
    queryurl = "/basket/addProduct?pid=" + pid;

    const req = await fetch(queryurl);
    getProducts2js();

    const response = await req.json(); //extract JSON from the http response
      var result = response.data;
      console.log(result);
    

    }
}
async function decrementP(pid) {
    queryurl = "/basket/decrementProduct?pid=" + pid;
    const req = await fetch(queryurl);
    getProducts2js();

    const response = await req.json(); //extract JSON from the http response
   }

   async function rmP(pid) {
    queryurl = "/basket/removeProduct?pid=" + pid;
    const req = await fetch(queryurl);
    getProducts2js();

    const response = await req.json(); //extract JSON from the http response
   }

    function order() {
      
    firebase.auth().onAuthStateChanged(async user => {
    if (user) {

      var cardNo = $("#cardno").val();

      var response = await fetch("/order/post", {
        method: "post",
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        //make sure to serialize your JSON body
        body: JSON.stringify({
            cardNo,
        })
        })
        response = await response.json();
        location.href = "orderSuccess.html?oid=" + response.oid;

    }
    else {
      console.log("no user");
    }
    });

  };