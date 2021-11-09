//CRUD operations
const mongodb = require("mongodb");

// Initialize connection, mongoclient
const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectID;

const log = console.log;

// Defined connect url
const connectionUrl = "mongodb://127.0.0.1:27017"; // 27017 is default port for mongodb
const dataBaseName = "task-manager";

// Connect to db server
MongoClient.connect(
  connectionUrl,
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return log("Error while connecting to DB", error);
    }
    const db = client.db(dataBaseName);
    log(`Connected to DB correctly!`);
    // find returns a cursor i.e pointer to data not actual data. toArray, count, limit are run on cursor

    // const updateNamePromise = db.collection("tasks").updateMany(
    //   {
    //     completed: false,
    //   },
    //   {
    //     $set: {
    //       completed: true,
    //     },
    //   }
    // );

    // updateNamePromise
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    const deletePromise = db.collection("users").deleteOne({
      age: 25,
    });
    deletePromise
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
);
