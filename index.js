const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { response } = require("express");
const {
  MongoClient,
  ServerApiVersion,
  CURSOR_FLAGS,
  ObjectId,
} = require("mongodb");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hvxqvqc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const bikeCollection = client.db("bikes").collection("royalBikes");
    const bookingsCollection = client.db("bikes").collection("bookings");
    const usersCollection = client.db("bikes").collection("users");
    const suzukiCollection = client.db("bikes").collection("suzukiBike");
    const yamahaCollection = client.db("bikes").collection("yamahaBike");
    const paymentsCollection = client.db("bikes").collection('payments');

    app.get("/royalBikes", async (req, res) => {
      const query = {};
      const result = await bikeCollection.find(query).toArray();
      res.send(result);
    });
    app.get('/myRoyal', async (req, res) => {
      const sellerName = req.query.sellerName;
      const query = { sellerName: sellerName };
      const result = await bikeCollection.find(query).toArray();
      res.send(result);
  });

    app.post("/royalBikes", async (req, res) => {
      const data = req.body;
      const result = await bikeCollection.insertOne(data);
      res.send(result);
    });

    app.get("/royalBikes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.findOne(query);
      res.send(result);
    });

    app.get("/suzukiBike", async (req, res) => {
      const query = {};
      const result = await suzukiCollection.find(query).toArray();
      res.send(result);
    });
    app.get('/mySuzuki', async (req, res) => {
      const sellerName = req.query.sellerName;
      const query = { sellerName: sellerName };
      const result = await suzukiCollection.find(query).toArray();
      res.send(result);
  });


    app.post("/suzukiBike", async (req, res) => {
      const data = req.body;
      const result = await suzukiCollection.insertOne(data);
      res.send(result);
    });

    app.get("/suzukiBike/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await suzukiCollection.findOne(query);
      res.send(result);
    });

    app.get("/yamahaBike", async (req, res) => {
      const query = {};
      const result = await yamahaCollection.find(query).toArray();
      res.send(result);
    });
    app.get('/myYamaha', async (req, res) => {
      const sellerName = req.query.sellerName;
      const query = { sellerName: sellerName };
      const result = await yamahaCollection.find(query).toArray();
      res.send(result);
  });

    app.post("/yamahaBike", async (req, res) => {
      const data = req.body;
      const result = await yamahaCollection.insertOne(data);
      res.send(result);
    });

    app.get("/yamahaBike/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await yamahaCollection.findOne(query);
      res.send(result);
    });

    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  });

  app.get('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingsCollection.findOne(query);
      res.send(booking);

  });

  app.get('/booked', async (req, res) => {
      const query = {};
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);

  });

  app.get('/bookings', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
          return res.status(403).send({ message: 'forbidden access' });
      }

      const query = { email: email };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
  });

  app.post('/create-payment-intent', async (req, res) => {
    const booking = req.body;
    const currentPrice = parseInt(booking.currentPrice);
    const amount = currentPrice * 100;

    const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: amount,
        "payment_method_types": [
            "card"
        ]
    });
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});


app.post('/payments', async (req, res) => {
    const payment = req.body;
    const result = await paymentsCollection.insertOne(payment);
    const _id = payment.bookingId;
    const filter = { _id: ObjectId(_id) };
    const updatedDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }
    const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
    console.log(updatedResult)
    res.send(result);
});

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
  });

  app.get('/users', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
  });

  app.get('/user', async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
  });

  app.get('/allusers', async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
  });

  app.delete('/allUsers/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
  })
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("reseller bike server is running");
});

app.listen(port, () => {
  console.log(`reseller server listening on ${port}`);
});
