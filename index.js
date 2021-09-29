const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const fs = require("fs-extra");

const fileUpload = require("express-fileupload");
app.use(express.static("admin"));
app.use(fileUpload());

require("dotenv").config();

const port = 4000;

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://metroRail:valarmorgulis@cluster0.zeznz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const ticketCollection = client.db("twinLine").collection("getTickets");
  const lostAndFoundCollection = client
    .db("twinLine")
    .collection("lostAndFound");
  const adminCollection = client.db("twinLine").collection("admin");

  console.log("database connected");

  app.post("/addTicket", (req, res) => {
    const ticket = req.body;
    ticketCollection.insertOne(ticket).then((result) => {
      console.log(result);
      res.send(result.insertedId);
    });
  });

  app.get("/tickets", (req, res) => {
    ticketCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/lostAndFound", (req, res) => {
    const lostFound = req.body;
    lostAndFoundCollection.insertOne(lostFound).then((result) => {
      console.log("result result", result);
      res.send(result.insertedId);
    });
  });

  app.get("/lostItems", (req, res) => {
    lostAndFoundCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addAdmin", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = req.files.file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };

    adminCollection
      .insertOne({ name: name, email: email, image })
      .then((result) => {
        res.send(result.insertedId);
      });
  });

  app.get("/admins", (req, res) => {
    adminCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  //   client.close();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
