const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.connect(
  `mongodb+srv://shahid:12345@cluster0.wrzgzmu.mongodb.net/inotebook`,
);

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.on("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = mongoose;
