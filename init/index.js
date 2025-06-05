const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const MONGO_URL = process.env.ATLASDB_URL;

main()
  .then(async () => {
    console.log("connected to DB");
    await initDB();
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    mongoose.connection.close();
    console.log("DB connection closed");
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  // Ensure initData.data provides the owner field directly for each listing.
  // The owner ID you want to use is '6840ef01add367a1ba8237d0'.
  // You will need to add this owner, plus reviews: [] and geometry, to each object in data.js manually.
  await Listing.insertMany(initData.data);
  console.log("Data was initialized from data.js");
};