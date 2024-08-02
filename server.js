const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://movieguy3333:Eg3csWV4A@testapicluster.qmp6iba.mongodb.net/?retryWrites=true&w=majority&appName=TestApiCluster');
const db = mongoose.connection;
db.once('open', () => console.log('Connected to Database'));

// Define the Event schema and model
const gymEventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String },
    availability: { type : String, default: '25'}
});

const gymEvent = mongoose.model('Event', gymEventSchema);

// Routes
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
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'gymEvent not found' });
        }
  
});

app.delete('/api/events/:id', async (req, res) => {
   
        const result = await gymEvent.findByIdAndDelete(req.params.id);
        if (result) {
            res.json({ message: 'gymEvent deleted successfully' });
        } else {
            res.status(404).json({ message: 'gymEvent not found' });
        }
   
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
