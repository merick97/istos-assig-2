let myHeaders = new Headers();
myHeaders.append('Accept','application/json')

let init = {
    method: "GET",
    headers: myHeaders
}
const queryString = window.location.search;
const searchParams = new URLSearchParams(queryString);
let username = searchParams.getAll('username')[0];
let sessionId = searchParams.getAll('sessionId')[0];
const body = `username=${username}&sessionId=${sessionId}`;


let cartData;
async function getCartData(){
    await fetch('/shoping-cart', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
    })
        .then((response) => response.json())
        .then((data) => {
            cartData = data.productInfo[0];
        })
        .catch((err) => {
            console.log(err);
        });
}


let templates = {}
templates.cartTable = Handlebars.compile(`
    <table>
    <tr>
        <th>Προιόν</th>
        <th>Ποσότητα</th>
        <th>Τιμή</th>
    </tr>
    {{#each this}}
    <tr>
        <td>{{{title}}}</td>
        <td>{{{size}}}</td>
        <td>{{{cost}}}€</td>
    </tr>
    {{/each}}
    </table>
    <div id="totalPrice"></div>
`)

getCartData().then(()=>{
    console.log(cartData)
    content = templates.cartTable(cartData.cartItems);
    div = document.querySelector("#cartTable")
    div.innerHTML = content;

}).then(()=>{
    document.querySelector("#totalPrice").innerHTML =`<p>Συνολική τιμή: ${cartData.totalCost}€</p>`
})