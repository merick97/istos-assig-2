let myHeaders = new Headers();
myHeaders.append('Accept','application/json')

let init = {
    method: "GET",
    headers: myHeaders
}
let _categories;
let _subcategories = [];
fetch("https://wiki-shop.onrender.com/categories", init)
.then(response => response.json()
.then(categories => {
    _categories = categories;
    console.log('Object Received', categories)
})
.catch(error => {
    console.log(error)
} ))

for(let i=0; i<3; i++){
    fetch(`https://wiki-shop.onrender.com/categories/${i+1}/subcategories`, init)
    .then(response => response.json()
    .then(subcategories => {
        _subcategories[i] = subcategories;
        console.log(`Subategory ${i+1} Received`, subcategories)
    })
    .catch(error => {
        console.log(error)
    } ))
}



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