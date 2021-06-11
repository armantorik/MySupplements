async function post_comment(){


    const url = window.location.search;
    const pid = new URLSearchParams(url).get('pid');
    console.log(pid)

    document.getElementById("comment").innerHTML = ""
    var response = await fetch('/user/comment/' + pid + '/' + $("#commentbar").val(), {
        method: "post",
        headers: {
            'Accept': '/',
            'Content-Type': 'application/x-www-form-urlencoded'
        },

        //make sure to serialize your JSON body
        body: JSON.stringify({
            comm: $("#commentbar").val(),
            pid: pid
        })
        })
var myJson = await response.json();
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