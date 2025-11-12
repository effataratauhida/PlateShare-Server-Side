const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;


const uri = process.env.MONGO_URI;

//middleware
app.use(cors())
app.use(express.json());


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('plateshare-db');
    const foodCollection = db.collection('foodData');

  //get all food
  app.get('/foodData', async (req,res) => {
    const result = await foodCollection.find().toArray()
      res.send(result)
    })
    
   // POST new food (from AddFood.jsx)
    app.post('/foodData', async (req, res) => {
      const newFood = req.body;
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

   
    // Get single food by id
    app.get('/foodData/:id', async (req, res) => {
  const { id } = req.params;
  const ObjectId = require('mongodb').ObjectId;
  try {
    const food = await foodCollection.findOne({ _id: new ObjectId(id) });
    res.send(food);
  } catch (err) {
    res.status(500).send({ error: 'Food not found' });
  }
});


// Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    //console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is Running!!!')
})

// app.get('/hello', (req, res) => {
//   res.send('How are you???')
// })


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
