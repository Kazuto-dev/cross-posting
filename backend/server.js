const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const linkedinRoutes = require('./routes/linkedin');
const postsRoutes = require('./routes/posts'); // <- add this

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/linkedin', linkedinRoutes);
app.use('/api/posts', postsRoutes); // <- mount here

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
