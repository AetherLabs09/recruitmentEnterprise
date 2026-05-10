const express = require('express');
const cors = require('cors');
const path = require('path');
require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const jobRoutes = require('./routes/job');
const resumeRoutes = require('./routes/resume');
const interviewRoutes = require('./routes/interview');

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
