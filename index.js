const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion, CURSOR_FLAGS, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hvxqvqc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const bikeCollection = client.db('royalEnfield').collection('royalBikes')
        const suzukiCollection = client.db('suzuki').collection('suzukiBikes')


        app.get('/royalBikes',async(req,res)=>{
            const query = {}
            const cursor = bikeCollection.find(query)
            const royalBikes = await cursor.toArray();
            res.send(royalBikes);
        })
        
        app.get('/royalBikes/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const royal = await bikeCollection.findOne(query);
            res.send(royal)
        })

        
        app.get('/suzukiBikes',async(req,res)=>{
            const query = {}
            const cursor = suzukiCollection.find(query)
            const suzukiBikes = await cursor.toArray();
            res.send(suzukiBikes);
        })
        
        app.get('/suzukiBikes/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const suzuki = await suzukiCollection.findOne(query);
            res.send(suzuki)
        })


    }
    finally{

    }
}

run().catch(err=>console.error(err))


app.get('/',(req,res)=>{
    res.send('reseller bike server is running')
})
 
app.listen(port, ()=>{
    console.log(`reseller server listening on ${port}`)
})