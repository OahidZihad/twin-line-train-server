const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const fs = require("fs-extra");

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

  console.log("database connected");

  app.post("/addTicket", (req, res) => {
    const ticket = req.body;
    ticketCollection.insertOne(ticket).then((result) => {
      console.log(result);
      res.send(result.insertedId);
    });
  });
  //   client.close();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
