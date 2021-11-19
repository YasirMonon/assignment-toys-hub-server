const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();

//Config .env
require("dotenv").config();

//App running port
const PORT = process.env.PORT || 5000;

//Middleware
app.use(express.json());
app.use(cors());

//MongoDB uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yasircluster.zp3gw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    //DB connection
    await client.connect();
    const database = client.db("toy_DB");
    const toyCollection = database.collection("toys");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const usersCollection = database.collection("users");

    /* ==================== Toys Api ========================= */
    //Get all Toys from DB
    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find({});
      const users = await result.toArray();
      res.json(users);
    });
    //Get Toy by id
    app.get("/toys/:_id", async (req, res) => {
      const result = await toyCollection.findOne({
        _id: ObjectId(req.params._id),
      });
      res.json(result);
    });
    //Add a new Toy
    app.post("/toys", async (req, res) => {
      const result = await toyCollection.insertOne(req.body);
      res.json(result);
    });
    //Delete a Smartphone by id
    app.delete("/toys/:_id", async (req, res) => {
      const result = await toyCollection.deleteOne({
        _id: ObjectId(req.params._id),
      });
      res.json(result);
    });
    /* ====================Reviews Api ========================= */
    //GET API
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({});
      const users = await result.toArray();
      res.json(users);
    });
    //Get by _id
    app.get("/reviews/:_id", async (req, res) => {
      const result = await reviewCollection.findOne({
        _id: ObjectId(req.params._id),
      });
      res.json(result);
    });
    //POST API
    app.post("/reviews", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.json(result);
    });
    /* ==================== Orders Api ========================= */
    //GET API
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({});
      const users = await result.toArray();
      res.json(users);
    });
    //Get by Email
    app.get("/orders/:email", async (req, res) => {
      const result = await orderCollection.find({
        email: req.params.email,
      });
      const userOrders = await result.toArray();
      res.json(userOrders);
    });
    //POST API
    app.post("/orders", async (req, res) => {
      const result = await orderCollection.insertOne(req.body);
      res.json(result);
    });

    //UPDATE API
    app.patch("/orders/:_id", async (req, res) => {
      const filter = { _id: ObjectId(req.params._id) };
      const updateDoc = {
        $set: req.body,
      };
      const result = await orderCollection.findOneAndUpdate(filter, updateDoc);
      res.json(result);
    });
    //DELETE API
    app.delete("/orders/:_id", async (req, res) => {
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params._id),
      });
      res.json(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.json(result);

    })


    //Catch error
  } catch (err) {
    console.error(err.message);
  }
}

run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send(`<h2>App , made by Yasir ,running on port ${PORT}</h2>`);
});

app.listen(PORT, () => console.log(`listening to the port ${PORT}`));
