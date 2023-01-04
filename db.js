const MongoClient = require('mongodb').MongoClient;

let dbConnection
let uri = 'mongodb+srv://nick:password@cluster0.awpqdwz.mongodb.net/WikiShop?retryWrites=true&w=majority'

module.exports = {
    connectDb: (cb)=>{
        MongoClient.connect(uri)
        .then((client) => {
            dbConnection = client.db()
            return cb()
        })
        .catch(err => {
            console.log(err)
            return cb(err)
        })
    },
    getDb: () => dbConnection
}
