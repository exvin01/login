const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
//fetch from data, static files
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.urlencoded({extended: true}));

//connect to database
const uri = process.env.MONGODB_URI;
let client;
let db;
async function connectDB() {
  if(!db){
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('PORTAL-DATA');
    console.log('Connected to DB');
  }
  return db;
}
//Signup api
app.post('/Signup', async (req, res) =>{
  try {
  const {email, phoneNumber, username, password} = req.body;
  //DEFINE DATABASE
  const database = await connectDB();
  const collection = database.collection('SIGNUP');
  //VALIDATING
  const hashedPassword = await bcrypt.hash(password,10);
  const userExist = await collection.findOne({username, password});
  if(userExist){
    return res.send('<h1>UserName Already Exist</h1><br><p><a href="/login.html">GO BACK</a></p>')
  }
  if(!password || password.length <6){
    return res.send('<h1>The password must be Atleast 6 characters</h1><br><p><a href="/login.html">GO BACK</a></p>')
  }
    await collection.insertOne({
      email,
      phoneNumber,
      username,
      password: hashedPassword,
      creatAt: new Date().toLocaleDateString('en-CA', {timeZone: 'Africa/Blantyre'}),     
    })
  res.send('<h1>Registerd Successfuly</h1>')

  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Signup failed');
  }
  
})
//api calls login
app.post('/login', async (req, res) =>{
  try {
  const {username, password} = req.body;
  //DEFINE DATABASE
  const database = await connectDB();
  const collection = database.collection('SIGNUP');
  //VALIDATING
  const userExist = await collection.findOne({username});
  if(!userExist){
    return res.sendFile(path.join(__dirname, 'reject.html'));
  }
  const comparePassword = await bcrypt.compare(password, userExist.password);
  if(!comparePassword){
    return res.sendFile(path.join(__dirname, 'reject.html'));
  }

  res.send('<h1>Registerd Successfuly</h1>')

  } catch (err) {
    console.error(err);
    res.status(500).send('Error: Signup failed');
  }
  
})
app.get('/', (req, res) =>{
  res.sendFile(path.join(__dirname, 'index.html'));
})
app.get('/login', (req, res) =>{
  res.sendFile(path.join(__dirname, 'login.html'));
})

module.exports = app;
