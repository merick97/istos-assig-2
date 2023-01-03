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



  async function isValidated(username,sessionId){
    let valid = await db.collection('users').find({username:username, sessionId:sessionId}).hasNext()
    return await valid
  }


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

      async function addCart(product, username, sessionId){
        if (isValidated(username,sessionId)){
          if(await db.collection('cart').find({username:username}).hasNext()){
              if(await db.collection('cart').find({username:username,"products.id":product.id}).hasNext()){
                await db.collection('cart').updateOne({username:username,"products.id":product.id},{$inc: {"products.$.size":1}})
              }else{
                console.log("in2")
                await db.collection('cart').updateOne({username:username}, {$push: {"products":product}})
                await db.collection('cart').updateOne({username:username, "products.id":product.id}, {$set: {"products.$.size":1}})
            } 
            }else{
              console.log("in3")
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
  
app.post('/shoping-cart/size',(req,res) => {
  const {username, sessionId} = req.body
  if(isValidated(username,sessionId)){
    let size = 0
    db.collection('cart').aggregate([
      {
         $match: { username:username }
      },
      {
         $group: { _id: "$products.size"} 
      }
   ]).toArray((err, result)=>{
      //console.log(result[0]._id)
      res.send(result[0]._id)
   })
  }
})

app.post('/shoping-cart',(req,res) => {
  let totalCost  = 0;
  const {username, sessionId} = req.body
  isValidated(username,sessionId).then((valid)=>{
    console.log(valid)
    if(valid){
      db.collection('cart').findOne({ username:username }, function(err, cart) {
        if (err) throw err;
  
        // Create an array of objects with size and cost properties for each product in the cart
        const cartItems = cart.products.map(product => ({ title:product.title, size: product.size, cost: product.cost }));
        for(let i of cartItems){
          totalCost += i.cost;
        }
        let productInfo = [{
          cartItems:cartItems,
          totalCost:totalCost
        }]
  
        // Send the cartItems array as a response
        res.send({ productInfo });
      });
    }
  })

})