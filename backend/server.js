const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const requestRoutes = require('./routes/requests');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: "🎉 IT Request Backend API", 
    version: "1.0.0",
    endpoints: ["/api/requests", "/api/health"]
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', requestRoutes);

app.listen(3001, '0.0.0.0', () => {
  console.log('Backend running at http://0.0.0.0:3001');
  console.log('test from backend')
});

