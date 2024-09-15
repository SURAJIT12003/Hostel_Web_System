const { MongoClient, ObjectId } = require('mongodb');

// Replace with your MongoDB connection string
const uri = "mongodb+srv://surajitde29:ZIa8NJN2AoddPYn3@cluster1.hnejc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";
const client = new MongoClient(uri);

async function insertRandomObjects() {
    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db('test'); // Replace with your DB name
        const collection = database.collection('rooms'); // Replace with your collection name

        // Create an array of 100 random objects
        const objects = [];
        for (let i = 0; i < 100; i++) {
            objects.push({
                _id: new ObjectId(), // Automatically generate a unique ObjectId
                roomNumber: (1000 + Math.floor(Math.random() * 100)).toString(), // Random room 
            });
        }

        // Insert all objects together
        const result = await collection.insertMany(objects);
        console.log(`${result.insertedCount} documents inserted successfully!`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

insertRandomObjects();
