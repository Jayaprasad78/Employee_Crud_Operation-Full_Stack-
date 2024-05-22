// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


// Create Express app
const app = express();
app.use(cors(
    {
        origin: ["https://curdoperation3frontend-api.vercel.app"],
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow DELETE method
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
));
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://jayaprasadb718:rm7BP1ed2p6qsNpO@cluster0.mfxrh9f.mongodb.net/Employee_database?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Define a mongoose schema for the employee model
const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: String,
  dateOfJoin: Date,
  bloodGroup: String,
});

// Create a mongoose model for the employee collection
const employee = mongoose.model('employee', employeeSchema);

// Routes


app.get('/',(req,res)=>{
  res.json("hello home page");
})

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await employee.find();
    const modifiedEmployees = employees.map((emp, index) => ({
      ...emp.toObject(),
      employeeId: (index + 1).toString().padStart(4, '0'), // Generating custom employee ID
      dateOfJoin: emp.dateOfJoin.toISOString().split('T')[0] // Extract date part
    }));
    console.log(modifiedEmployees);
    res.json(modifiedEmployees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Check if email exists
app.post('/api/employees/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    const existingEmployee = await employee.findOne({ email: email });
    if (existingEmployee) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(200).json({ message: 'Email is available' });
  } catch (err) {
    console.error('Error checking email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/employees', async (req, res) => {
  try {
    const { _id, ...employeeData } = req.body; // Exclude _id from the request body if present
    const newemployee = new employee(employeeData);
    await newemployee.save();
    res.status(201).json(newemployee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await employee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const updatedemployee = await employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    res.json(updatedemployee);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
