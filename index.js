const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const blogs = require("./data/blogs.json");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hxpxamt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyWorld").collection("toys");

    const myCollection = client.db("toyWorld").collection("myToys");

    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toyCollection.findOne(query);
      if (result) {
        res.send(result);
      } else {
        res.status(404).send("Item not found");
      }
    });

app.get("/my-toys", async (req, res) => {
  console.log(req.query.email);
  let query = {};
  if (req.query?.email) {
    query = { email: req.query.email };
  }
  const result = await myCollection.find(query).toArray();
  res.send(result);
});


    app.post("/my-toys", async (req, res) => {
      const newToys = req.body;
      console.log(newToys);
      const result = await myCollection.insertOne(newToys);
      res.send(result);
    });

    app.patch("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToys = req.body;
      console.log(updatedToys);
      const updateDoc = {
        $set: {
          status: updatedToys.status,
        },
      };
      const result = await myCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/blogs", (req, res) => {
      res.send(blogs);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy world is running");
});
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
