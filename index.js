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



// Get foods by donator email
app.get('/myFoods', async (req, res) => {
  const { email } = req.query; // ?email=user@example.com
  try {
    const result = await foodCollection.find({ donator_email: email }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: 'Could not fetch foods' });
  }
});



// Update food data by donator
const { ObjectId } = require('mongodb');

app.put('/foodData/:id', async (req, res) => {
  const { id } = req.params;
  const updatedFood = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid ID format' });
  }

  try {
    const result = await foodCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFood }
    );
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Could not update food' });
  }
});

// Delete food data by donator
app.delete('/foodData/:id', async (req, res) => {
  const { id } = req.params;
  const ObjectId = require('mongodb').ObjectId;

  try {
    const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: 'Could not delete food' });
  }
});



// food request collection
const foodRequestsCollection = db.collection('foodRequests');

app.post('/foodRequests', async (req, res) => {
  const requestData = req.body; 
  try {
    const result = await foodRequestsCollection.insertOne({
      ...requestData,
      status: 'pending'
    });
    res.send({ success: true, data: result });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});




// Get food requests made by  user
app.get('/myFoodRequests', async (req, res) => {
  const { email } = req.query; 
  try {
    const query = email ? { requesterEmail: email } : {};
    const result = await foodRequestsCollection.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: 'Could not fetch user requests' });
  }
});




// GET requests by foodId
app.get('/foodRequests', async (req, res) => {
  const { foodId } = req.query; 
  try {
    const requests = await foodRequestsCollection.find({ foodId }).toArray();
    res.send(requests);
  } catch (err) {
    res.status(500).send({ error: 'Could not fetch requests' });
  }
});


// PATCH request status
app.patch('/foodRequests/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // accepted or rejected

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid ID format' });
  }

  try {
    const result = await foodRequestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (status === 'accepted') {
      const request = await foodRequestsCollection.findOne({ _id: new ObjectId(id) });
      await foodCollection.updateOne(
        { _id: new ObjectId(request.foodId) },
        { $set: { food_status: 'donated' } }
      );
    }

    res.send(result);
  } catch (err) {
    res.status(500).send({ error: 'Could not update request' });
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
