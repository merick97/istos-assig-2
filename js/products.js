let myHeaders = new Headers();
myHeaders.append('Accept','application/json')

let init = {
    method: "GET",
    headers: myHeaders
}

const queryString = window.location.search;
const searchParams = new URLSearchParams(queryString);
let currentCat = searchParams.getAll('categoryId')[0];

let _products;
fetch(`https://wiki-shop.onrender.com/categories/${currentCat}/products`, init)
.then(response => response.json()
.then(products => {
    _products = products;
    console.log(`Product ${currentCat} Received`, products)
})
.catch(error => {
    console.log(error)
} ))

let _subcategories;
fetch(`https://wiki-shop.onrender.com/categories/${currentCat}/subcategories`, init)
.then(response => response.json()
.then(subcategories => {
    _subcategories = subcategories;
    console.log(`Subategory ${currentCat} Received`, subcategories)
})
.catch(error => {
    console.log(error)
} ))

var templates = {}
templates.subcategories = Handlebars.compile(`
    {{#each this}}
        <div class="pCard" id="{{{subcategory_id}}}">
            <img src={{{image}}} alt="{{{title}}}">
            <h4>{{{title}}}</h4>
            <p>Κωδικός Προιόντος: {{{id}}}</p>
            <p>{{{description}}}</p>
            <p>{{{cost}}}€</p>
        </div>
    {{/each}}   
`);

templates.filter = Handlebars.compile(`
    <p>Πατήστε το σύνδεσμο για φιλτράρισμα των προϊόντων ανάλογα με την υποκατηγορία τους</p>
    <input type="radio" id="all" name="filtered" value="All">
    <label for="all">Όλα</label><br>
    {{#each this}}
        <input type="radio" id="{{{id}}}" name="filtered" value="{{{title}}}">
        <label for="{{{id}}}">{{{title}}}</label><br>
    {{/each}}   
`);


setTimeout(function (){
    let content = templates.subcategories(_products);
    let div = document.querySelector("#subcat");
    div.innerHTML = content;

    content = templates.filter(_subcategories);
    div = document.querySelector("#filter")
    div.innerHTML = content;

    const radioButtons = document.querySelectorAll('input[name="filtered"]');
    for(const radioButton of radioButtons){
        radioButton.addEventListener('change', showSelected);
    }        
    function showSelected(e) {
        console.log(e);
        if (this.checked) {
            let selectedId = this.getAttribute('id');
            const displayedProducts = document.querySelectorAll('.pCard');
            for (const dp of displayedProducts){
                if(selectedId=='all'){
                    dp.style.display="flex";
                }else if(dp.getAttribute('id') != selectedId){
                    dp.style.display="none";
                }else {
                    dp.style.display="flex";
                }
            }
        }
    }   
},500)



