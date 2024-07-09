require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const dns = require('dns');
const app = express();
const mongoose = require("mongoose");
const { MongoClient } = require('mongodb');

// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URI);

async function run() {
  try {
    mongoose.connect(process.env.MONGO_URI);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

//Schema n Model
const Schema22 = mongoose.Schema;
const urlSchema = new Schema22({
  id: Number,
  url: String
});

const urlModel = mongoose.model("url", urlSchema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res) => {
  const newUrl = new URL(req.body.url);
    dns.lookup(newUrl.hostname, (err, address, family) => {
    if (err ) {
      console.log("here")
     return res.json({ "error": "invalid URL" });
    } else {
      urlModel
        .find()
        .then(data => {
          new urlModel({
            id: data.length + 1,
            url: req.body.url
          })
            .save()
            .then(() => {
              res.json({
                original_url: req.body.url,
                short_url: data.length + 1
              });
            })
            .catch(err => {
              res.json(err);
            });
        });
    }
  });
});

app.get("/api/shorturl/:number", (req, res) => {
  urlModel
    .find({ id: req.params.number })
    .exec()
    .then(url => {
      res.redirect(url[0]["url"])
    });
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
