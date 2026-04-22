const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Dummy data for laundry machines
let machines = [
  { id: 1, name: 'Washer 1', type: 'washer', status: 'available', timeRemaining: 0 },
  { id: 2, name: 'Washer 2', type: 'washer', status: 'busy', timeRemaining: 15 },
  { id: 3, name: 'Washer 3', type: 'washer', status: 'available', timeRemaining: 0 },
  { id: 4, name: 'Dryer 1', type: 'dryer', status: 'busy', timeRemaining: 45 },
  { id: 5, name: 'Dryer 2', type: 'dryer', status: 'available', timeRemaining: 0 },
  { id: 6, name: 'Dryer 3', type: 'dryer', status: 'out-of-order', timeRemaining: 0 },
];

// Get all machines
app.get('/api/machines', (req, res) => {
  res.json(machines);
});

// Book a machine
app.post('/api/book', (req, res) => {
  const { id } = req.body;
  const machineIndex = machines.findIndex(m => m.id === id);

  if (machineIndex !== -1) {
    if (machines[machineIndex].status === 'available') {
      machines[machineIndex].status = 'busy';
      machines[machineIndex].timeRemaining = 60; // Default 60 mins
      res.json({ success: true, message: 'Machine booked successfully', machine: machines[machineIndex] });
    } else {
      res.status(400).json({ success: false, message: 'Machine is not available' });
    }
  } else {
    res.status(404).json({ success: false, message: 'Machine not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
