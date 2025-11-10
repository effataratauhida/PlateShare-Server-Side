const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

//middleware
app.use(cors())
app.use(express.json());

// const uri = "mongodb+srv://myProjectUser:<db_password>@cluster0.vdlk0az.mongodb.net/?appName=Cluster0";
const uri = "mongodb+srv://myProjectUser:95Jh4ln9Or1QxsVc@cluster0.vdlk0az.mongodb.net/?appName=Cluster0";


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
    const foodCollection = db.collection('foodData')

    app.get('/foodData', async (req,res) => {
      const result = await foodCollection.find().toArray()
      res.send(result)
    })
    






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
  //console.log(`Server is listening on port ${port}`)
})
