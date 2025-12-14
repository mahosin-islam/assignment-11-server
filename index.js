const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var admin = require("firebase-admin");
var serviceAccount = require("./gaments-firebase_key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const app = express();
//DynamicIdgenared
function generateTrackingId() {
  const uuid = crypto.randomUUID();
  return "PKG-" + uuid.split("-")[0].toUpperCase();
}
//madel-ware //
dotenv.config();
app.use(cors());
app.use(express.json());
//script-payment-emplement
const stripe = require("stripe")(process.env.SCRIFT_SCREAT);
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
    const productCollection = db.collection("product");
    const reviewCollection = db.collection("review");
    const orderCollection = db.collection("orders");
    const suspenCollection = db.collection("suspen");
    const trackCollection = db.collection("track");
    app.get("/", (req, res) => {
      res.send("Hello mahosin hosing");
    });
    //tracking-information-reltedia;
    app.post("/trackin", async (req, res) => {
      const TrackingInfo = req.body;
      const result = await trackCollection.insertOne(TrackingInfo);
      res.send(result);
    });
    app.get("/my-tracking/:id", async (req, res) => {
      const id = req.params.id;

      const result = await trackCollection.find({ trackingId: id }).toArray();
      res.send(result);
    });

    //user related-api
    app.post("/user", async (req, res) => {
      const { Email } = req.body;
      const exite = await userCollection.findOne({ Email });
      if (exite) {
        return res.status(404).send({ message: "Already exited you email" });
      }
      const result = await userCollection.insertOne(req.body);
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      const requer = req.body;
      const result = await userCollection.find(requer).toArray();
      res.send(result);
    });
    app.get("/user-role", async (req, res) => {
      const email = req.query.email;
      const result = await userCollection.findOne({ Email: email });
      res.send(result);
    });
    app.get("/suspens-info", async (req, res) => {
      const email = req.query.email;
      const resule = await suspenCollection
        .find({ SupenarEmai: email })
        .sort({ Time: -1 })
        .limit(1)
        .toArray();
      const result = resule[0] || null;
      res.send(result);
    });

    app.patch("/user-status/:id", async (req, res) => {
      const { approve } = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateUser = {
        $set: {
          status: approve,
        },
      };
      const result = await userCollection.updateOne(query, updateUser);
      res.send(result);
    });

    //product-related api
    app.post("/product", async (req, res) => {
      const query = req.body;
      const result = await productCollection.insertOne(query);
      res.send(result);
    });

    app.get("/product", async (req, res) => {
      const requer = req.body;
      const result = await productCollection.find(requer).toArray();
      res.send(result);
    });
    app.get("/Latest-porduct/:Homepage", async (req, res) => {
      const HomepageConver = req.params.Homepage;
      const Homepage = HomepageConver === "true";
      const result = await productCollection
        .find({ Homepage })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/product/:id",varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.get("/manager-product",varifyToken, async (req, res) => {
      const email = req.query.email;
      const search = req.query.search || "";

      const query = {
        cratorEmail: email,

        $or: [
          { ProductName: { $regex: search, $options: "i" } },
          { Category: { $regex: search, $options: "i" } },
        ],
      };

      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/Delet-prodcut/:id",varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/product/:id", async (req, res) => {
      const { Homepage } = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateUser = {
        $set: {
          Homepage: Homepage,
        },
      };
      const result = await productCollection.updateOne(query, updateUser);
      res.send(result);
    });

    app.patch("/updat-product/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const updateData = req.body;
      const updateDoc = {
        $set: updateData,
      };
      const result = await productCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.get("/All-pagination", async (req, res) => {
      try {
        const {limit=0,skip=0}=req.query;
        const result = await productCollection.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .toArray();
        const count =await productCollection.countDocuments();
        res.send({result,total:count});
      } catch (err) {
        res.status(400).json({ josin: "you hve wornd" });
      }
    });

    //sespent-collecotn
    app.post("/suspen/:id", async (req, res) => {
      const bode = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const updateUser = {
        $set: {
          status: "suspend",
        },
      };
      const resul = await userCollection.updateOne(query, updateUser);
      const result = await suspenCollection.insertOne(bode);
      res.send(result);
    });

    //order-collecton
    app.post("/orders", async (req, res) => {
      const query = req.body;
      const { ProductId, OrderQuantite } = query;

      const quer = { _id: new ObjectId(ProductId) };
      await productCollection.updateOne(quer, {
        $inc: { quantity: -OrderQuantite },
      });
      const trackind = generateTrackingId();
      query.createdAt = new Date();
      query.trackingId = trackind;
      const result = await orderCollection.insertOne(query);
      res.send(result);
    });
    app.get("/orders",varifyToken, async (req, res) => {
      const query = req.body;
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/myorder-product",varifyToken, async (req, res) => {
      const email = req.query.email;
      const result = await orderCollection
        .find({ OrderEmail: email })
        .toArray();
      res.send(result);
    });

    app.get("/manage-pending",varifyToken, async (req, res) => {
      const email = req.query.email;
      const { status } = req.query;
      const result = await orderCollection
        .find({ cratorEmail: email, status: status })
        .toArray();
      res.send(result);
    });

    app.get("/manage-Approved",varifyToken, async (req, res) => {
      const email = req.query.email;
      const { status } = req.query;
      const result = await orderCollection
        .find({ cratorEmail: email, status: status })
        .toArray();
      res.send(result);
    });

    //order-for approved
    app.patch("/order-Approved/:id", async (req, res) => {
      const id = req.params.id;
      const { statu } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          status: statu,
        },
      };
      const result = await orderCollection.updateOne(query, update);
      res.send(result);
    });
    // order-for Reject

    app.patch("/order-Rejected/:id", async (req, res) => {
      const id = req.params.id;
      const { statu } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          status: statu,
        },
      };
      const result = await orderCollection.updateOne(query, update);
      res.send(result);
    });

    app.get("/order-dtail/:id",varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    app.get("/searc-orders",varifyToken, async (req, res) => {
      const searchText = req.query.searchText;
      const query = {};
      if (searchText) {
        // query.name  = {$regex:searchText, $options: "i"};
        query.$or = [
          { status: { $regex: searchText, $options: "i" } },
        ];
      }
      const option = { sort: { createdAt: -1 } };
      const result = await orderCollection.find(query, option).toArray();
      res.send(result);
    });

    ///delete product from my-persel router
    app.delete("/product/:id",varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.delete("/Cancel-order/:id",varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // product review collecin
    app.post("/review", async (req, res) => {
      const query = req.body;
      const result = await reviewCollection.insertOne(query);
      res.send(result);
    });
    app.get("/review", async (req, res) => {
      const query = req.body;
      const result = await reviewCollection.find(query).limit(6).toArray();
      res.send(result);
    });

    //====stard-paymetn-porcess-method====///
    //post for pay to payment method

    app.post("/payment-checkout-session", async (req, res) => {
      const paymentIfo = req.body;
      const amoutn = parseInt(paymentIfo.Price) * 100;
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amoutn,
              product_data: {
                name: paymentIfo.ProductName,
              },
            },

            quantity: paymentIfo?.OrderQuantite,
          },
        ],
        mode: "payment",
        metadata: {
          ProductId: paymentIfo.ProductId,
          trackingId: generateTrackingId(),
          ProductName: paymentIfo.ProductName,
          DeliveryAddress: paymentIfo.DeliveryAddress,
          PaymentType: paymentIfo.PaymentType,
          FirstName: paymentIfo.FirstName,
          LastName: paymentIfo.LastName,
          ContactNumber: paymentIfo.ContactNumber,
          status: paymentIfo.status,
          cratorEmail: paymentIfo.cratorEmail,
          photo: paymentIfo.photo,
        },
        customer_email: paymentIfo.OrderEmail,
        success_url: `${process.env.SIDE_DOMAIN}/dashboard/successful?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SIDE_DOMAIN}/dashboard/Cancel-pay`,
      });
      res.send({ url: session.url });
    });
    //payment-succesful
    app.post("/payment-successs", async (req, res) => {
      const { sessionId } = req.body;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      //if need quentity then call this api
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      const quantitye = lineItems.data[0].quantity;
      //check doublicate order
      const Existedorder = await orderCollection.findOne({
        transationId: session.payment_intent,
      });
      if (Existedorder) {
        return res.send({
          message: "already axist this ",
        });
      }

      //  set mongodb-collection
      if (session.payment_status == "paid") {
        const orderquentity = quantitye;
        const ProductId = session.metadata.ProductId;
        const quere = { _id: new ObjectId(ProductId) };
        const resul = await productCollection.updateOne(quere, {
          $inc: { quantity: -orderquentity },
        });
        res.send(resul);
        const paymentInfo = {
          ProductId: session.metadata.ProductId,
          ProductName: session.metadata.ProductName,
          DeliveryAddress: session.metadata.DeliveryAddress,
          PaymentType: session.metadata.PaymentType,
          FirstName: session.metadata.FirstName,
          LastName: session.metadata.LastName,
          ContactNumber: session.metadata.ContactNumber,
          status: session.metadata.status,
          photo: session.metadata.photo,
          cratorEmail: session.metadata.cratorEmail,
          OrderEmail: session.customer_email,
          Price: session.amount_total / 100,
          OrderQuantite: quantitye,
          trackingId: session.metadata.trackingId,
          transationId: session.payment_intent,
          createdAt: new Date(),
        };

        const result = await orderCollection.insertOne(paymentInfo);
        res.send(result);
      }
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
