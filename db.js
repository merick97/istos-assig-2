const MongoClient = require('mongodb').MongoClient;

let dbConnection

module.exports = {
    connectDb: (cb)=>{
        MongoClient.connect('mongodb://0.0.0.0:27017/WikiShop')
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