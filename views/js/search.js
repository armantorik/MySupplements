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
