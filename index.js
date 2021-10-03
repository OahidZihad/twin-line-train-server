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
// const uri = `mongodb+srv://metroRail:valarmorgulis@cluster0.zeznz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zeznz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const ticketCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("getTickets");

  const lostAndFoundCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("lostAndFound");

  const adminCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("admin");

  const stripeCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("stripe");

  console.log("database connected");

  app.post("/addTicket", (req, res) => {
    const ticket = req.body;
    ticketCollection.insertOne(ticket).then((result) => {
      // console.log(result);
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
      // console.log("result result", result);
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

  app.post("/ticketsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    // console.log("date email", date);
    adminCollection.find({ email: email }).toArray((err, admins) => {
      // console.log("admins", admins);
      const filter = { date: date.date };
      if (admins.length === 0) {
        filter.email = email;
        // console.log("filter", filter);
      }
      ticketCollection.find(filter).toArray((err, documents) => {
        //ei line a find(filter) bosale todays patient a kono data show kore na....
        // abar find({ date: date.date }) bosale todays patient a data show kore button
        // localhost:5000/dashboard/appointment a data filter hoye ase na... sob datai show kore
        // jodio seta doctor er mail diye dhukleo
        // console.log(email, date.date, doctors, documents);
        // console.log(documents);
        res.send(documents);
      });
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admins) => {
      res.send(admins.length > 0);
    });
  });

  /////////// try to post payment data on server
  // app.post("/addStripeData", (req, res) => {
  //   const stripeData = req.body;
  //   stripeCollection.insertOne(stripeData).then((result) => {
  //     res.send(result.insertedId);
  //   });
  // });

  //   client.close();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || port);
