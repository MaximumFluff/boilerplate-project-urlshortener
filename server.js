"use strict";
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var dns = require("dns");
var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;
const mongooseURL =
  "mongodb://alex:alex1234@ds151453.mlab.com:51453/freecodecamp";

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

// Handle POST to database
app.post("/api/shorturl/new", function(req, res) {
  mongo.connect(
    mongooseURL,
    function(err, db) {
      if (err) throw err;
      db.collection("shortURL")
        .count()
        .then(number => {
          db.collection("shortURL").insert(
            { original_url: req.body.url, short_url: number + 1 },
            function(err, doc) {
              res.json({
                original_url: doc.ops[0].original_url,
                short_url: doc.ops[0].short_url
              });
              db.close();
            }
          );
        });
    }
  );
});

// Handle redirecting
app.get("/api/shorturl/:id", function(req, res) {
  console.log(req.params.id);
  mongo.connect(
    mongooseURL,
    function(err, db) {
      if (err) throw err;
      db.collection("shortURL")
        .findOne({ short_url: parseInt(req.params.id) })
        .then(doc => {
          res.redirect(doc.original_url);
          db.close();
        });
    }
  );
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
