const express = require('express')
const cors = require('cors')
const app = express()
const jsonwebtoken = require('jsonwebtoken')
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
        const bookingsCollection = client.db('bikeSeller').collection('bookings')
        const usersCollection = client.db('bikeSeller').collection('users')
        const suzukiCollection = client.db('suzuki').collection('suzukiBike')
        const yamahaCollection = client.db('yamaha').collection('yamahaBike')


        app.get('/royalBikes',async(req,res)=>{
            const query = {}
            const cursor = bikeCollection.find(query)
            const royalBikes = await cursor.toArray();
            res.send(royalBikes);
        })

        app.get('/royalBikes',async(req,res)=>{
            const email = req.query.email;
            const query = {email: email}
            const bookings = await bikeCollection.find(query).toArray()
            res.send(bookings)
        })

        // app.post('/royalEnfield',async(req,res)=>{
        //     const royal = req.body;
        //     const result = await bikeCollection.insertOne(royal)
        //     res.send(result)
        // })
        
        app.get('/royalBikes/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const royal = await bikeCollection.findOne(query);
            res.send(royal)
        })


        app.get('/suzukiBike',async(req,res)=>{
            const query = {}
            const cursor = suzukiCollection.find(query)
            const suzukiBikes = await cursor.toArray();
            res.send(suzukiBikes);
        })
        
        app.get('/suzukiBike/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const suzuki = await suzukiCollection.findOne(query);
            res.send(suzuki)
        })


        app.get('/yamahaBike',async(req,res)=>{
            const query = {}
            const cursor = yamahaCollection.find(query)
            const yamahaBike = await cursor.toArray();
            res.send(yamahaBike);
        })
        
        app.get('/yamahaBike/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const yamaha = await yamahaCollection.findOne(query);
            res.send(yamaha)
        })

        app.get('/jwt',async(req,res)=>{
            const email = req.query.email;
            const query = {email:email}
            const user = await usersCollection.findOne(query)
            if(user){
                const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn: '1h'})
                return res.send({accessToken:token})
            }
            res.status(403).send({accessToken:''})
        })

        app.post('/users',async(req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result);
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