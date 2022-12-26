class Category {
    constructor(id, title, img_url) {
        this.id = id;
        this.title = title;
        this.img_url = img_url;
    }

    get id() {return this.idVal;}
    get title() {return this.titleVal;}
    get img_url() {return this.img_urlVal;}

    set id(value) {this.idVal = value;}
    set title(value) {this.titleVal = value;}
    set img_url(value) {this.img_urlVal = value;}
}

const categories = [];

fetch('https://wiki-shop.onrender.com/categories')
.then((response) => response.json())
.then((data) => {

    for (let i = 0; i < data.length; i++) {
        let c = new Category(data[i].id, data[i].title, data[i].img_url);
        categories.push(c);
    }
});



