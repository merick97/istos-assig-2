let myHeaders = new Headers();
myHeaders.append('Accept','application/json')

let init = {
    method: "GET",
    headers: myHeaders
}
let _categories;
fetch("https://wiki-shop.onrender.com/categories", init)
.then(response => response.json()
.then(categories => {
    _categories = categories;
    console.log('Object Received', categories)
})
.catch(error => {
    console.log(error)
} ))


var templates = {}
templates.categories = Handlebars.compile(`
    {{#each this}}
        <section id="{{{id}}}" class="category">
			<h3>{{{title}}}</h3>
            <a href="category.html?categoryId={{{id}}}"><img src="{{{img_url}}}" alt="{{{title}}}"></a>
		</section>
    {{/each}}
`);

setTimeout(function (){
    let content = templates.categories(_categories)
    let div = document.querySelector("#contact")
    div.innerHTML = content;
},500)