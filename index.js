const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const { User, Exercise } = require('./models');

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

// mongoose.connection.on('error', err => console.error('MongoDB error:', err)); 
// mongoose.connection.once('open', () => console.log('MongoDB connected'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// 1. POST /api/users - Create a new user
app.post('/api/users', async (req, res) => {
  try {
    // console.log('Request body:', req.body);
    const user = new User({ username: req.body.username });
    const savedUser = await user.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    // console.error('Error saving user:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/users - Get a list of all users
app.get('/api/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

// 3. POST /api/users/:_id/exercises - Add an exercise to any user by _id
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    // console.log('Request body:', req.body);
    const user = await User.findById(req.params._id);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const { description, duration, date } = req.body;

    const exercise = new Exercise({
      userId: user._id,
      description,
      duration,
      date: date ? new Date(date) : new Date()
    });

    const savedExercise = await exercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: savedExercise.date.toDateString(),
      duration: savedExercise.duration,
      description: savedExercise.description
    });
  } catch (err) {
    // console.error('Error saving exercise:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /api/users/:_id/logs - Retrieve a full exercise log of any user by _id
app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' }); 
  
    let query = { userId: user._id }; 
  
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
  
    let exercises = Exercise.find(query).select('description duration date -_id');
    if (limit) exercises = exercises.limit(Number(limit)); 
  
    const logs = await exercises.exec(); 
  
    res.json({
      _id: user._id,
      username: user.username,
      count: logs.length,
      log: logs.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))
    }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})