let myHeaders = new Headers();
myHeaders.append('Accept','application/json')

let init = {
    method: "GET",
    headers: myHeaders
}


//gets current category based on the url
const queryString = window.location.search;
const searchParams = new URLSearchParams(queryString);
let currentCat = searchParams.getAll('categoryId')[0];
let currentCatTitle = searchParams.getAll('title')[0];

let cartSize = 0;

let _products;
let _subcategories;

//fetches Product Data
async function getProdData(){
   await fetch(`https://wiki-shop.onrender.com/categories/${currentCat}/products`, init)
    .then(response => response.json()
    .then(products => {
        _products = products;
        console.log(`Product ${currentCat} Received`, products)
    })
    .catch(error => {
        console.log(error)
    } ))
}

//fetches Subcategory Data
async function getSubData(){
    await fetch(`https://wiki-shop.onrender.com/categories/${currentCat}/subcategories`, init)
    .then(response => response.json()
    .then(subcategories => {
        _subcategories = subcategories;
        console.log(`Subategory ${currentCat} Received`, subcategories)
    })
    .catch(error => {
        console.log(error)
    } ));
}

var templates = {}

//template that displays each product
templates.subcategories = Handlebars.compile(`
    {{#each this}}
        <div class="pCard" id="{{{subcategory_id}}}">
            <img src={{{image}}} alt="{{{title}}}">
            <h4>{{{title}}}</h4>
            <p>Κωδικός Προιόντος: {{{id}}}</p>
            <p>{{{description}}}</p>
            <p>{{{cost}}}€</p>
            <button id="product{{{id}}}">Αγορά</button>
        </div>
    {{/each}}   
`);

//template that displays the filter menu
templates.filter = Handlebars.compile(`
    <p>Πατήστε το σύνδεσμο για φιλτράρισμα των προϊόντων ανάλογα με την υποκατηγορία τους</p>
    <input type="radio" id="all" name="filtered" value="All">
    <label for="all">Όλα</label><br>
    {{#each this}}
        <input type="radio" id="{{{id}}}" name="filtered" value="{{{title}}}">
        <label for="{{{id}}}">{{{title}}}</label><br>
    {{/each}}   
`);

//template that displays the login message
templates.loginMessage = Handlebars.compile(`
    {{#if success }}
        <p id="ok"> {{{message}}} </p>
    {{else}}
        <p id="fail"> {{{message}}} </p>
    {{/if}}
`)
//template that displays the cart info
templates.cartInfo = Handlebars.compile(`
    {{#each this}}
        <p>Cart Size: {{size}}</p>
        <a href="cart.html?username={{username}}&sessionId={{sessionId}}">Click to view Cart</a>
    {{/each}} 
`)



//displays the filter menu
getSubData().then(()=>{
    content = templates.filter(_subcategories);
    div = document.querySelector("#filter")
    div.innerHTML = content;
}).then(()=>{
    getProdData()
    //displays the products
    .then(()=>{
        let content = templates.subcategories(_products);
        let div = document.querySelector("#subcat");
        div.innerHTML = content;

        document.querySelector('#title').innerHTML = currentCatTitle;
    })
    //Filtering system
    .then(()=>{
        const radioButtons = document.querySelectorAll('input[name="filtered"]');
        for(const radioButton of radioButtons){
        radioButton.addEventListener('change', showSelected);
        }           
        function showSelected(e) {
            //console.log(e);
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
    })
    .then(()=>{
        
    })
})

let loginData;
let loggedIn = false;
let username;
//Client side login service
window.onload = ()=>{
    let form = document.querySelector('#loginForm');
    if (form){
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            username = formData.get('username');
            const password = formData.get('password');
            const body = `username=${username}&password=${password}`;
            login(body).then(()=>{
                content = templates.loginMessage(loginData);
                div = document.querySelector("#loginmessage")
                div.innerHTML = content;
            })
        }); 
    }
    setTimeout(()=>{
        console.log()
        addItem()
    },600)
}

//POST request to the Login Service
async function login(body){
    await fetch('/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body:body,
        })
        .then((response) => response.json())
        .then((data) => {
        // login was successful
            loginData = data;
            loggedIn = true
        })
        .then(()=>{
            displayCart(username,loginData.sessionId);
        })
        .catch((error) => {
        // login failed
            console.log(error);
        });
}
let tempInfo;
//POST request to the  Cart Item Service
function addItem(){
    for (let i of _products){
        let selectedProduct = document.querySelector(`#product${i.id}`)
        selectedProduct.addEventListener('click', (event)=>{
            if (loggedIn){
                console.log(username)
                let boughtProduct = i;
                const addBody = `product=${JSON.stringify(boughtProduct)}&username=${username}&sessionId=${loginData.sessionId}`
                fetch('/add', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: addBody,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if(data.verified){
                            displayCart(username,loginData.sessionId);
                        }else{
                            alert("Παρακαλώ συνδεθείτε για προσθήκη προϊόντων στο καλάθι");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }else{
                alert("Παρακαλώ συνδεθείτε για προσθήκη προϊόντων στο καλάθι");
            }

        })
    }

}

//POST request to the Cart Size Service
async function getCartSize(username,sessionId){
    let size = 0;
    const body = `username=${username}&sessionId=${sessionId}`;
    await fetch('/shoping-cart/size', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    })
        .then((response) => response.json())
        .then((data) => {
            for(let i of data){
                size += i;
            }
            tempInfo = [{
                username:username,
                sessionId:sessionId,
                size:size
            }]
        })
        .catch((err) => {
            console.log(err);
        });

}

//Displays Cart Size
function displayCart(username,sessionId){
    getCartSize(username,sessionId).then(()=>{
        //console.log(tempInfo)
        content = templates.cartInfo(tempInfo);
        div = document.querySelector("#cart")
        div.innerHTML = content;
    });
}



