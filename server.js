const express = require("express");
const mongoose = require("mongoose");
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(express.json());

// Import routes
const usersRoute = require('./routes/usersRoute');
const busesRoute = require('./routes/busesRoute');
const bookingsRoute = require("./routes/bookingsRoute");

// Use routes
app.use('/api/users', usersRoute);
app.use('/api/buses', busesRoute);
app.use("/api/bookings", bookingsRoute);

// Serve static files in production
const path = require("path");
if(process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log("Failed to connect to MongoDB", err));

// Start server
app.listen(port, () => console.log("Node server listening on port ${port}"));