const express = require('express')
const path = require('path')
const app = express()
const {connectDb, getDb} = require('./db')
const port = 8080
const { v4: uuidv4 } = require('uuid');



  //connect to db
  let db
  connectDb((err)=>{
    if(!err){
      app.listen(port,()=>{console.log(`Listening to server at port ${port}`)})
    }
    db = getDb()
  })

  let users = [];
  setTimeout(()=>{
    db.collection('users').find().forEach(user => users.push(user))
  },300)




/* 
    Serve static content from directory "public",
    it will be accessible under path /, 
    e.g. http://localhost:8080/index.html
*/
app.use(express.static('public'))

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }))

// parse application/json content from body
app.use(express.json())

// serve index.html as content root
app.get('/', function(req, res){
    var options = { 
        root: path.join(__dirname, 'public')
    }

    res.sendFile('index.html', options, function(err){
        console.log(err)
    })
})

app.get('/category.html', function(req, res){
  
  options = { 
      root: path.join(__dirname, 'public')
  }

  res.sendFile('category.html', options, function(err){
      console.log(err)
  })
})

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Check if the provided username and password match a user in the list
    const nUser = users.find((nUser) => nUser.username == username && nUser.password == password);
    if (nUser) {
      let sessionId = uuidv4()
      db.collection('users').updateOne({username: username}, {$set: {sessionId:sessionId}})
      res.send({ success: true,
                 message: 'Login successful!',
                 sessionId: sessionId
                });
    } else {
      res.send({ success: false, message: 'Invalid login credentials' });
    }
  });

  app.post('/add', (req, res) => {
    const {product, username, sessionId} = req.body
    console.log(product,username)

      async function addCart(product, username, sessionId){
        let authId;
        await db.collection('users').find({username:username}).forEach(user => authId = user.sessionId)
        if (sessionId == authId){
          if(await db.collection('cart').find({username:username}).hasNext()){
              if(await db.collection('cart').find({"products.id":product.id}).hasNext()){
                await db.collection('cart').updateOne({username:username,"products.id":product.id},{$inc: {"products.$.size":1}})
              }else{
                await db.collection('cart').updateOne({username:username}, {$push: {"products":product}})
                await db.collection('cart').updateOne({username:username, "products.id":product.id}, {$set: {"products.$.size":1}})
            } 
            }else{
                await db.collection('cart').insertOne({username:username, products:[]})
                await db.collection('cart').updateOne({username:username}, {$push: {"products":product}})
                await db.collection('cart').updateOne({username:username, "products.id":product.id}, {$set: {"products.$.size":1}})
          } 
          res.send({verified:true})
        }else{
          res.send({verified:false})
        }
    }
    addCart(JSON.parse(product), username, sessionId)
  });
  