const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');




// copy and paste the following link to browser:
// http://localhost:2000


const app = express();
const PORT = 2000;
const jwtSecret = 'your_jwt_secret_key';



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb+srv://movieguy3333:Eg3csWV4A@testapicluster.qmp6iba.mongodb.net/?retryWrites=true&w=majority&appName=TestApiCluster');
const db = mongoose.connection;
db.once('open', () => console.log('Connected to Database'));



const userSchema = new mongoose.Schema({
        username: { type: String, unique: true, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        bio: { type: String },
        accountBalance: { type: Number, default: 0 },
        profilePicture: { type: String } 
    });
    
    const User = mongoose.model('User', userSchema);
    

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static('public'));
    


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  

  app.use('/uploads', express.static('uploads'));
  

  app.post('/upload', upload.single('image'), (req, res) => {
    res.json({ filePath: `/uploads/${req.file.filename}` });
  });
  


    app.post('/signup', async (req, res) => {
        try {
            const { username, email, password, bio } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ username, email, password: hashedPassword, bio });
            await user.save();
            res.status(200).send('User registered');
        } catch (err) {
            res.status(500).send('Error registering user');
        }
    });
    

    app.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) return res.status(401).send('Invalid username or password');
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).send('Invalid username or password');
            const token = jwt.sign({ id: user._id }, jwtSecret);
            res.json({ token });
        } catch (err) {
            res.status(500).send('Error logging in');
        }
    });
    
 
    app.get('/profile', async (req, res) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).send('No token provided');
        jwt.verify(token, jwtSecret, async (err, decoded) => {
            if (err) return res.status(401).send('Invalid token');
            try {
                const user = await User.findById(decoded.id).select('username email bio accountBalance');
                if (!user) return res.status(404).send('User not found');
                res.json(user);
            } catch (err) {
                res.status(500).send('Error fetching profile');
            }
        });
    });
    app.put('/api/add/:name', async (req, res) => {
        const { name } = req.params;
        const { availability } = req.body;
    
      
    
        try {
          
            const user = await User.findOne({ username: name }); 
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
    
        
            if (availability > 0) {
             
                user.accountBalance += 10;
                await user.save();
            }
    
            res.status(200).json({ message: 'Account balance updated', user });
        } catch (error) {
            console.error('Error updating account balance:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    app.delete('/api/clearbalance/:name', async (req, res) => {
        const { name } = req.params; 
        try {

          const user = await User.findOne({ username: name });
      
          if (user) {
  
            user.accountBalance = 0;
            await user.save(); 
      
            res.status(200).json({ message: `The balance for user ${name} has been cleared.` });
          } else {
            res.status(404).json({ message: 'User not found' });
          }
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while clearing the balance' });
        }
      });

const gymEventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String },
    availability: { type : Number, default: '25'}
});

const gymEvent = mongoose.model('Event', gymEventSchema);

app.put('/api/book/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
      
        const event = await gymEvent.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

  
        if (event.availability <= 0) {
            return res.status(400).json({ message: 'Availability is already at zero' });
        }


        event.availability -= 1;

    
        await event.save();

        res.json({ message: 'Availability updated', event });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/api/events', async (req, res) => {
    try {
        const events = await gymEvent.find();
        res.json(events);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ message: 'Server error while fetching events' });
    }
});

app.post('/api/events', async (req, res) => {
    try {
        const event = new gymEvent(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(400).json({ message: 'Invalid data provided' });
    }
});

app.put('/api/events/:id', async (req, res) => {
    try {
        const event = await gymEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json(event);
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(400).json({ message: 'Invalid data provided' });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        const result = await gymEvent.findByIdAndDelete(req.params.id);
        
        if (!result) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.status(204).end(); 
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ message: 'Server error while deleting event' });
    }
});


let workouts = [];


app.post('/submit-workout', (req, res) => {
    const workoutData = req.body;
    console.log('Received workout data:', workoutData);


    workouts.push(workoutData);

 
    res.json({
        message: 'Workout data received successfully!',
        data: workouts
    });
});

  

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
