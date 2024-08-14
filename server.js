const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs= require('fs');



// copy and paste the following link to browser:
// http://localhost:2000


const app = express();
const PORT = 2000;
const jwtSecret = 'your_jwt_secret_key';
//const num = 23;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
    dest: 'uploads/',
    limits: {fileSize: 5 * 1024 * 1024}, //limiting size to 5MB
    fileFilter(req, file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'));
        }
        cb(null,true);
    }
});

if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}


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
    

// Define the `updateUserProfilePicture` function
const updateUserProfilePicture = async (userId, profilePicture) => {
    try {
        await User.findByIdAndUpdate(userId, { profilePicture });
    } catch (err) {
        throw new Error('Error updating profile picture');
    }
};
app.post('/api/updateProfilePicture', upload.single('profilePicture'), async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('No token provided');

    jwt.verify(token, jwtSecret, async (err, decoded) => {
        if (err) return res.status(401).send('Invalid token');
        
        const userId = decoded.id;
        const file = req.file;

        if (!file) return res.status(400).send('No file uploaded');

        const filePath = path.join('uploads', file.filename);
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

        try {
            await updateUserProfilePicture(userId, fileUrl);
            res.status(200).json({ profilePictureUrl: fileUrl });
        } catch (err) {
            res.status(500).send('Error updating profile picture');
        }
    });
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
        const { name } = req.params; // Get the username from the route parameter
      
        try {
          // Find the user by username
          const user = await User.findOne({ username: name });
      
          if (user) {
            // Clear the user's balance
            user.accountBalance = 0;
            await user.save(); // Save the updated user
      
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
   
        const events = await gymEvent.find();
        res.json(events);

});

app.post('/api/events', async (req, res) => {
 
        const event = new gymEvent(req.body);
        await event.save();
        res.status(201).json(event);
  
});

app.put('/api/events/:id', async (req, res) => {
   
        const event = await gymEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
       
            res.json(event);
       
  
});




app.delete('/api/events/:id', async (req, res) => {
   
        const result = await gymEvent.findByIdAndDelete(req.params.id);
       
        

      
   
});
// Define Workout schema and model
// Define Workout schema and model
const workoutSchema = new mongoose.Schema({
    name: String,
    date: Date,
    location: String,
    description: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to User
});

const Workout = mongoose.model('Workout', workoutSchema);

  
  app.use(cors());
  app.use(bodyParser.json());
  
  // POST endpoint to save a new workout
  app.post('/api/workouts', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('No token provided');

    jwt.verify(token, jwtSecret, async (err, decoded) => {
        if (err) return res.status(401).send('Invalid token');
        
        try {
            const workout = new Workout({
                ...req.body,
                user: decoded.id // Associate workout with the user
            });
            await workout.save();
            res.status(201).json(workout);
        } catch (err) {
            res.status(500).send('Error creating workout');
        }
    });
});
  
// GET endpoint to fetch all workouts for the authenticated user
app.get('/api/workouts', async (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('No token provided');

    jwt.verify(token, jwtSecret, async (err, decoded) => {
        if (err) return res.status(401).send('Invalid token');
        
        try {
            const workouts = await Workout.find({ user: decoded.id });
            res.json(workouts);
        } catch (err) {
            res.status(500).send('Error fetching workouts');
        }
    });
});
  

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
