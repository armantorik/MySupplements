var addToCartButton = document.getElementsByClassName('add-to-cart')[0]
addToCartButton.addEventListener('click', addToCartClicked)

function addToCartClicked(event){
    console.log("added to cart")
    cartNumbers();
}

function cartNumbers(){
    var productNumbers = localStorage.getItem('cartNumbers');
    productNumbers = parseInt(productNumbers);
    
    if(productNumbers){
        localStorage.setItem('cartNumbers', productNumbers+1);
    } 
    else {
        localStorage.setItem('cartNumbers', 1);
    }
}