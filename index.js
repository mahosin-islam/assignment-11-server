const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");
var admin = require("firebase-admin");
var serviceAccount = require("./gaments-firebase_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

dotenv.config();
const app = express();
//madel-ware //
app.use(cors());
app.use(express.json());

const port = process.env.port || 5000;
const uri = `mongodb+srv://${process.env.VITE_USER}:${process.env.VITE_PASSWORD}@dream.gcatzqm.mongodb.net/?appName=Dream`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// veryfyTooken funtion

const varifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({ message: "unAthorized access" });
  }

  try {
    const idTooken = token.split(" ")[1];
    const douced = await admin.auth().verifyIdToken(idTooken);
    req.douced_email = douced.email;
    next();
  } catch (err) {
    res.status(403).send({ message: "not fined your token" });
  }
};

async function run() {
  try {
    // await client.connect();   //first commit for deploy---1
    const db = client.db("Garments_pd");
    const userCollection = db.collection("user");
    app.get("/", (req, res) => {
      res.send("Hello mahosin hosing");
    });

    app.post("/product", async (req, res) => {
      const { Email } = req.body;
      const exite = await userCollection.findOne({ Email });
      if (exite) {
        return res.status(404).send({ message: "Already exited you email" });
      }
      const result = await userCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/product", async (req, res) => {
      const requer = req.body;
      const result = await userCollection.find(requer).toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 }); commit for deploy ---2
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close(); commit fordeploy ---3
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
