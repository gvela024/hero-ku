/*
POST example
curl -H "Content-Type: application/json" -d '{"firstName":"Chris", "lastName": "Chang", "email": "support@mlab.com"}' http://morning-badlands-24515.herokuapp.com/contacts
*/

var express = require("express");
// var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var 1B_DIAGNOSTICS = "1B-diagnostics";

var app = express();
app.use(express.static(__dirname + "/src/view"));
app.use(bodyParser.json());

// Connect to the database before starting the application server.
var database;
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, _database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  database = _database;
  app.listen(process.env.PORT || 8080);
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/contacts", function(req, res) {
  database.collection(1B_DIAGNOSTICS).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/contacts", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  console.log("Trying to POST a new contact");
  console.log("Request");
  console.log("\n");
  console.log(newContact)
  console.log("\n");
  console.log(newContact.firstName)
  console.log("\n");
  console.log(newContact.lastName)

  if (req.body.firstName == null || req.body.lastName == null) {
    handleError(res, "Invalid user input", "Must provide a first or last name and email.", 400);
  }

  if(req.body.email == null) {
    req.body.email = "blah@bleh.com";
  }

  database.collection(1B_DIAGNOSTICS).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/contacts/:id", function(req, res) {
  database.collection(1B_DIAGNOSTICS).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  database.collection(1B_DIAGNOSTICS).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/contacts/:id", function(req, res) {
  database.collection(1B_DIAGNOSTICS).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(204).end();
    }
  });
});
