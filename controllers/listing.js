const Listing = require('../models/listing');
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
  // Optional depending on the providers
  // fetch: customFetchImplementation,
  // apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
  // formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index.ejs', {allListings: allListings});
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs');
}

module.exports.showListing = async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id).populate({path : 'reviews', populate:{path: 'author'}}).populate('owner');
  if(!listing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }
  res.render('listings/show.ejs', {listing});
}

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Geocode the location
    const locationString = req.body.listing.location;
    if (locationString) {
        try {
            console.log('Server-side Geocoding for:', locationString);
            const geoData = await geocoder.geocode(locationString);
            if (geoData && geoData.length > 0) {
                console.log('Coordinates:', { latitude: geoData[0].latitude, longitude: geoData[0].longitude });
                newListing.geometry = {
                    type: 'Point',
                    coordinates: [geoData[0].longitude, geoData[0].latitude] // GeoJSON order: [longitude, latitude]
                };
            } else {
                // If geocoder returns no data, treat as an error for creating the listing if geometry is essential
                req.flash('error', 'Location could not be geocoded. Please provide a valid location.');
                return res.redirect('/listings/new'); // Redirect back to form
            }
        } catch (err) {
            console.error('Geocoding error:', err.message);
            req.flash('error', `Geocoding failed: ${err.message}. Please try a different location or check the address.`);
            return res.redirect('/listings/new'); // Redirect back to form
        }
    } else {
        // If locationString is essential for your listings (e.g., if geometry is always required by your model)
        req.flash('error', 'Location is required.');
        return res.redirect('/listings/new');
    }

    // Handle file upload
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    } else {
        // If an image is mandatory for new listings
        req.flash('error', 'Listing image is required.');
        return res.redirect('/listings/new');
    }

    // Attempt to save the listing
    try {
        console.log("Attempting to save new listing:", JSON.stringify(newListing, null, 2));
        await newListing.save();
        req.flash('success', 'New listing created successfully!');
        res.redirect('/listings');
    } catch (saveError) {
        console.error('Error saving listing to database:', saveError);
        // Handle Mongoose validation errors more gracefully
        let errorMessages = saveError.message;
        if (saveError.name === 'ValidationError') {
            errorMessages = Object.values(saveError.errors).map(e => e.message).join(', ');
        }
        req.flash('error', `Failed to save listing: ${errorMessages}`);
        // Consider re-rendering the form with `req.body.listing` to preserve user input
        // For now, just redirecting back to the new form.
        res.redirect('/listings/new');
    }
};

module.exports.renderEditForm = async (req, res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace('/upload','/upload/w_250')
  res.render('listings/edit.ejs', {listing, originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
  let {id} = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

  if(typeof req.file !== 'undefined'){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
  }

  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  req.flash('success', 'Listing deleted successfully!');
  res.redirect('/listings');
}
