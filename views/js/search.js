async function dosearch(){

  document.getElementById("results").innerHTML = ""
    const response = await fetch('/products/search/'+ $("#searchinput").val());

    const myJson = await response.json(); //extract JSON from the http response

    myJson.proArr.forEach(pro => {

       
        document.getElementById("results").innerHTML += `
        <a class="dropdown-item" href="../html/product.html?pid=${pro.id}"> 
        
          <th>${pro.product.name} - </th>
          <th>${pro.product.price}$</th>
        </a>

        `
      });
}

async function dossssearch(){


queryurl = "/products/search/" + $("#searchinput").val();

axios.get(queryurl).then(
 (response) => {
    alert(response)
  myJson = response.json();
  console.log('Processing Request');

  console.log(response)
    console.log($("#searchinput").val())
    alert(myJson)
    myJson.proArr.forEach(pro => {

        console.log(pro.id)
        alert(pro.id)
       
        document.getElementById("searchid").innerHTML += `
        <a class="dropdown-item" href="/products?pid=${pro.id}"> 
        
          <th>${pro.product.name}</th>
          <th>${pro.porduct.price}</th>
        </a>

        `
},
(error) => {
    reject(error);
    }
);
})
}
