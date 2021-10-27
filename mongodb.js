//CRUD operations
const mongodb = require("mongodb");

// Initialize connection, mongoclient
const MongoClient = mongodb.MongoClient;

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

    // db.collection("users").insertOne(
    //   {
    //     name: "Jane",
    //     age: 27,
    //   },
    //   (error, result) => {
    //     if (error) {
    //       return log("Unable to insert!!", error);
    //     }
    //     log(result.insertedId);
    //   }
    // );

    // db.collection("users").insertMany(
    //   [
    //     {
    //       name: "T2",
    //       age: 27,
    //     },
    //     {
    //       name: "T1",
    //       age: 25,
    //     },
    //   ],
    //   (error, result) => {
    //     if (error) {
    //       return log("Unable to insert!!", error);
    //     }
    //     log(result.insertedIds);
    //   }
    // );

    db.collection("tasks").insertMany(
      [
        {
          description: "Laundry",
          completed: true,
        },
        {
          description: "Groceries",
          completed: false,
        },
      ],
      (error, result) => {
        if (error) {
          return log("Unable to insert!!", error);
        }
        log(result.insertedIds);
      }
    );
  }
);
