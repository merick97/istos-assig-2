let myHeaders = new Headers();
myHeaders.append('Accept','application/json')

let init = {
    method: "GET",
    headers: myHeaders
}

let _products = [];
for(let i=0; i<3; i++){
    fetch(`https://wiki-shop.onrender.com/categories/${i+1}/products`, init)
    .then(response => response.json()
    .then(products => {
        _products[i] = products;
        console.log(`Product ${i+1} Received`, products)
    })
    .catch(error => {
        console.log(error)
    } ))
}

var templates = {}
templates.subcategories = Handlebars.compile(`
    {{#each this}}
        <div class="pCard">
            <img src={{{image}}} alt="{{{title}}}">
            <h4>{{{title}}}</h4>
            <p>Κωδικός Προιόντος: {{{id}}}</p>
            <p>{{{description}}}</p>
            <p>{{{cost}}}€</p>
        </div>
    {{/each}}   
`);

const queryString = window.location.search;
const searchParams = new URLSearchParams(queryString);
setTimeout(function (){
    console.log('id: ', _products[0][0].id)
    let currentCat = searchParams.getAll('categoryId')[0];
    let content = templates.subcategories(_products[currentCat-1]);
    let div = document.querySelector("#subcat");
    div.innerHTML = content;
},500)