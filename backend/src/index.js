const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// User routes
const userroutes = require("./routes/userroutes");
app.use("/api/users", userroutes);

const storeRoutes = require("./routes/stores");
app.use("/api/stores", storeRoutes);

const storeroutes = require("./routes/storeroutes");
app.use("/stores", storeroutes);

const storeownerroutes = require("./routes/storeownerroutes");
app.use("/api/storeownerroutes",storeownerroutes)

const adminroutes = require("./routes/adminroutes");
app.use("/api/adminroutes",adminroutes)

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
