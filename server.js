require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');
const { createClient } = require('redis');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const redisClient = createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});


const MONGODB_URI = process.env.MONGODB_URI ;
const mongoClient = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});


async function connectToMongoDB(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoClient.connect();
      console.log('Successfully connected to MongoDB');
      return true;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}
let mongoCollection;


const mqttClient = mqtt.connect(process.env.MQTT_BROKER);


const REDIS_KEY = 'FULLSTACK_TASK_JOHN';

async function init() {
  try {
    console.log('Connecting to Redis and MongoDB...');
    await redisClient.connect();
    
    // Connect to MongoDB 
    const mongoConnected = await connectToMongoDB();
    if (!mongoConnected) {
      throw new Error('Failed to connect to MongoDB after multiple retries');
    }
    
    mongoCollection = mongoClient.db(process.env.MONGODB_DB || 'SupaBase').collection(process.env.MONGODB_COLLECTION || 'tasks');

    
    mqttClient.subscribe(process.env.MQTT_TOPIC_ADD, (err) => {
      if (!err) {
        console.log('Subscribed to', process.env.MQTT_TOPIC_ADD);
      }
    });

    
    mqttClient.on('message', async (topic, message) => {
      if (topic === process.env.MQTT_TOPIC_ADD) {
        try {
          const task = JSON.parse(message.toString());
          await addTask(task);
        } catch (error) {
          console.error('Error processing MQTT message:', error);
        }
      }
    });

  } catch (error) {
    console.error('Error initializing connections:', error);
    process.exit(1);
  }
}

async function addTask(task) {
  try {
   
    let tasks = [];
    const tasksStr = await redisClient.get(REDIS_KEY);
    if (tasksStr) {
      tasks = JSON.parse(tasksStr);
    }


    tasks.push(task);

    // If tasks exceed 50, move to MongoDB and clear Redis
    if (tasks.length > 50) {
      await mongoCollection.insertMany(tasks);
      await redisClient.del(REDIS_KEY);
      tasks = [];
    } else {
     
      await redisClient.set(REDIS_KEY, JSON.stringify(tasks));
    }
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
}


app.get('/fetchAllTasks', async (req, res) => {
  try {
   
    const redisTasksStr = await redisClient.get(REDIS_KEY);
    const redisTasks = redisTasksStr ? JSON.parse(redisTasksStr) : [];

    // Get tasks 
    const mongoTasks = await mongoCollection.find({}).toArray();

    // Combine 
    const allTasks = [...mongoTasks, ...redisTasks];

    res.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


init();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});