const express = require('express');
require('dotenv').config();
const app = express();
const errorHandler = require('./middleware/errorHandler.js');
const PORT = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors()); // Middleware to allow cross-origin requests
app.use(express.json()); // Middleware to parse JSON data

app.use('/api', require('./routes/todoRoute.js'));

app.use(errorHandler); // Error handler middlweware

app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
