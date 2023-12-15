const mongoose=require('./db')
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");



// Call the connectToMongo function to establish a connection with MongoDB

const port = 5000;

// Enable CORS for all routes
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(port, () => {
    console.log(`NoteCraft app is listening at http://localhost:${port}`);
});
