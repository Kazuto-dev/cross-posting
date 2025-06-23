const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const linkedinRoutes = require('./routes/linkedin');
const postRoutes = require('./routes/posts');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@db-1.skakipj.mongodb.net/crossposter?retryWrites=true&w=majority&appName=db-1',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('✅ Connected to MongoDB'))
 .catch(err => console.error('❌ MongoDB connection error:', err));

// Mount routers
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
