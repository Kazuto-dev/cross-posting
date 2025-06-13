const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const linkedinRoutes = require('./routes/linkedin'); // adjust path if needed

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount the LinkedIn router here
app.use('/api/linkedin', linkedinRoutes);

// Optional: health check
app.get('/', (req, res) => res.send('API running'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
