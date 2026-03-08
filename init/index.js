const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

main()
  .then(() => {
    console.log("Connection successful to Db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Yobnb");
}

const initDb = async () => {
  await Listing.deleteMany({});

  const enrichedData = [];

  for (let obj of initData.data) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(obj.location + ", " + obj.country)}`
      );

      const data = await response.json();

      let geometry;

      if (data.length) {
        geometry = {
          type: "Point",
          coordinates: [
            parseFloat(data[0].lon),
            parseFloat(data[0].lat),
          ],
        };
      } else {
        // fallback if API fails
        geometry = {
          type: "Point",
          coordinates: [0, 0],
        };
      }

      enrichedData.push({
        ...obj,
        owner: "69a050bb0b23e92d465f98a3",
        geometry,
      });

      console.log(`Processed: ${obj.title}`);

      // 1 sec delay to avoid rate limit
      await new Promise((r) => setTimeout(r, 300));

    } catch (err) {
      console.log(`Error processing ${obj.title}`, err);
    }
  }

  await Listing.insertMany(enrichedData);
  console.log("Data initialized with real coordinates");
  mongoose.connection.close();
};

initDb();