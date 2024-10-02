const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require("./Models/users.model.js")
const Exercise = require("./Models/execiseLogs.model.js")
require('dotenv').config()

// Config stuff
app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST request for creating  new Users
app.post("/api/users", async (req, res)=> {
  try {
    const nameUser = req.body.name
    const userData = await User.create({username: nameUser})
    res.status(200).json({
      username: userData.username,
      _id: userData._id
    })

  } catch (error) {
    res.status(500).send(error.message)
    console.log(error)
  }
  
})

// GET request for submitting data of all signed up users
app.get("/api/users", async (req, res)=> {
  try {
    const userData = await User.find()
    res.status(200).json(userData)

  } catch (error) {
    res.status(500).json(error.message)
    console.log(error)
  }
})

//POST request for logging exercise routine
app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    const userId = req.body["_id"]
    
    // finding username given id
    const userData = await User.findById(userId);

    // Error handling for wrong user input
    if(!userData){
      return res.status(404).send(`User cannot be found`)
    }

    const username = userData.username;
    


    // Retrieving user info from POST req 
    const descpt = req.body.description;
    const durat = req.body.duration;
    let date = req.body.date;
    if(date == "") date = Exercise.date;
    

     const ExerciseLog =  await Exercise.create({
      username: username,
      duration: durat,
      description: descpt,
      date: date,
      userId: userId
    })

    res.status(200).json({
      username: ExerciseLog.username,
      description: ExerciseLog.description,
      duration: ExerciseLog.duration,
      date: ExerciseLog.date.toDateString(),
      _id: ExerciseLog.userId
    })

  } catch (error) {
    console.log(error.message)
    res.status(500).json(error.message)
  }
})

//GET request to /api/users/:_id/logs to retrieve Exercise logs of a user
app.get("/api/users/:_id/logs", async (req, res) =>{
  try {
    const userId = req.params._id;
    const {from, to, limit} = req.query;

    const userData = await User.findById(userId);
    if(!userData){
      return res.status(404).send(`Can not find User`)
    }
    const userName = userData.username;

    //handling query parameters if present;
    const query = {userId: userId};
    const dateObj = {};
    if(from) dateObj["$gte"] = new Date(from);

    if(to){
      dateObj["$lte"] = new Date(to);

      //Adjusing ISO format to extend query results
      dateObj["$lte"].setHours(23, 59, 59)
    }


    if(from || to) query.date = dateObj;
    
    
    // converting limit query parameter to number
    const filter = parseInt(limit) || 0;

    const logs = await Exercise.find(query).limit(filter);
    const exerciseLog = logs.map(doc => ({description: doc.description, duration: doc.duration, date: doc.date.toDateString()}));

    res.status(200).json({
      username: userName,
      count: logs.length,
      _id: userId,
      log: exerciseLog
    })

  } catch (error) {
    res.status(500).json(error.message);
    console.log(error.message)
  }
})



//Server Setup
const runServer = async () => {
  try {
    const dB = await mongoose.connect(process.env.Mongoose)
    console.log("Connected to dB")

    app.listen(process.env.PORT , () => {
    console.log("Server is fired up 🔥")
  })
  } catch (error) {
    console.log(error.message)
  }
  
}

runServer()

