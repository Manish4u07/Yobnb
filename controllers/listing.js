const Listing = require("../models/listing");
// const ExpressError = require("../utils/ExpressError.js");
const { cloudinary } = require("../cloudConfig");


module.exports.index = async (req, res) => {

    let { country } = req.query;

    let allListings;

    if (country) {
        allListings = await Listing.find({
            country: { $regex: country, $options: "i" }
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index", { allListings });
};


module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};


module.exports.createListing = async (req, res) => {
    try {
        // 2. create listing
        let newListing = new Listing(req.body.listing);

        const location = newListing.location;
        const geoData = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${location}`, {
            headers: {
                "User-Agent": "Yobnb-App"
            }
        }
        );

        const data = await geoData.json();

        const lng = data[0].lon;
        const lat = data[0].lat;

        newListing.geometry = {
            type: "Point",
            coordinates: [lng, lat]
        };

        // 3. save image data
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);

            newListing.image = {
                url: result.secure_url,
                filename: result.public_id
            };
        }

        // 4. owner set (important)
        newListing.owner = req.user._id;
        await newListing.save();
        res.redirect("/listings");

    } catch (err) {
        console.log(err);
        res.send("Error uploading");
    }
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate:
                { path: "author" }
        })
        .populate("owner");
    // console.log(listing.image);
    if (!listing) {
        req.flash("error", "Listing you are searching for does not Exist");
        return res.redirect("/listings");
    }
    res.render('./listings/show.ejs', { listing });
};



module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are searching for does not Exist");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
};



module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // 1. Find existing listing
    let listing = await Listing.findById(id);

    // 2. Update basic data
    let updatedData = req.body.listing;

    if (updatedData.location && updatedData.location != listing.location) {

        const geoData = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(updatedData.location + ", " + updatedData.country)}`,
            {
                headers: { "User-Agent": "Yobnb-App(ffpro3424@gmail.com)" }
            }
        );

        const data = await geoData.json();
        // console.log(data);

        if (!data.length) {
            console.log("location not found!");
        }
        else {
            updatedData.geometry = {
                type: "Point",
                coordinates: [
                    parseFloat(data[0].lon),
                    parseFloat(data[0].lat)
                ]
            };
        }
    }

    // 3. Check if new image uploaded
    if (req.file) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // Delete old image from Cloudinary
        await cloudinary.uploader.destroy(listing.image.filename);

        // Set new image
        updatedData.image = {
            url: result.secure_url,
            filename: result.public_id
        };
    } else {
        // No new image → keep old image
        updatedData.image = listing.image;
    }

    // 4. Update DB
    await Listing.findByIdAndUpdate(id, updatedData, { new: true });

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};



module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");

};


// module.exports.search = async (req, res) => {
//     let { country } = req.query;

//     const listings = await Listing.find({
//         country: { $regex: country, $options: "i" }
//     });

//     res.render("listings/index.ejs", { allListings: listings });
// };