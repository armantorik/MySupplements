async function post_comment(){

    console.log('/user/comment/'+ $("#commentbar").val())

    document.getElementById("comment").innerHTML = ""
      const response = await fetch('/user/comment/'+ $("#commentbar").val());
  
      const myJson = await response.json(); //extract JSON from the http response
  
     if(myJson.status == true)
     {
        alert("Your comment is waiting approval from an admin!")
     }
     else
     {
         alert("Can't post comment")
     }
  }

  async function post_rating(){

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