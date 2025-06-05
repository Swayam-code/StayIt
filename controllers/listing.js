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
    try {
        const { title, description, price, location, country } = req.body.listing;
        
        // Basic validation
        if (!title || !description || price === undefined || !location || !country) {
            req.flash('error', 'All fields are required');
            return res.redirect('/listings/new');
        }
        
        // Price validation - must be a positive number
        const priceValue = parseFloat(price);
        if (isNaN(priceValue)) {
            req.flash('error', 'Price must be a valid number');
            return res.redirect('/listings/new');
        }
        
        if (priceValue < 0) {
            req.flash('error', 'Price cannot be negative');
            return res.redirect('/listings/new');
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        // Simple location validation
        if (location.trim().length < 2) {
            req.flash('error', 'Location must be at least 2 characters long');
            return res.redirect('/listings/new');
        }

        // Set location and try to geocode
        newListing.location = location.trim();
        
        // Try to geocode the location (but don't fail if it doesn't work)
        try {
            const locationString = `${location}, ${country}`;
            console.log('Geocoding location:', locationString);
            const geoData = await geocoder.geocode(locationString);
            
            if (geoData && geoData.length > 0) {
                const firstResult = geoData[0];
                console.log('Geocoding successful:', { 
                    formatted: firstResult.formattedAddress,
                    coordinates: [firstResult.longitude, firstResult.latitude]
                });
                
                newListing.geometry = {
                    type: 'Point',
                    coordinates: [firstResult.longitude, firstResult.latitude]
                };
                
                // Use the formatted address if available
                if (firstResult.formattedAddress) {
                    newListing.location = firstResult.formattedAddress;
                }
            }
        } catch (err) {
            console.warn('Geocoding not available or failed:', err.message);
            // Continue without geocoding - not a critical error
        }

        // Handle file upload
        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            newListing.image = { url, filename };
        } else {
            req.flash('error', 'Listing image is required.');
            return res.redirect('/listings/new');
        }

        // Save the listing
        await newListing.save();
        req.flash('success', 'New listing created successfully!');
        res.redirect(`/listings/${newListing._id}`);
        
    } catch (error) {
        console.error('Error creating listing:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            req.flash('error', `Validation error: ${messages}`);
        } else if (error.code === 11000) {
            req.flash('error', 'A listing with this title already exists. Please choose a different title.');
        } else {
            req.flash('error', 'An error occurred while creating the listing. Please try again.');
        }
        
        // Redirect back to the form with the error message
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
  try {
    const {id} = req.params;
    const { title, description, price, location, country } = req.body.listing;
    
    // Basic validation
    if (!title || !description || price === undefined || !location || !country) {
      req.flash('error', 'All fields are required');
      return res.redirect(`/listings/${id}/edit`);
    }
    
    // Price validation - must be a positive number
    const priceValue = parseFloat(price);
    if (isNaN(priceValue)) {
        req.flash('error', 'Price must be a valid number');
        return res.redirect(`/listings/${id}/edit`);
    }
    
    if (priceValue < 0) {
        req.flash('error', 'Price cannot be negative');
        return res.redirect(`/listings/${id}/edit`);
    }
    
    // Simple location validation
    if (location.trim().length < 2) {
        req.flash('error', 'Location must be at least 2 characters long');
        return res.redirect(`/listings/${id}/edit`);
    }

    // Prepare update data
    let updatedData = { ...req.body.listing };
    updatedData.location = location.trim();
    
    // Try to geocode the location (but don't fail if it doesn't work)
    try {
        const locationString = `${location}, ${country}`;
        console.log('Geocoding location:', locationString);
        const geoData = await geocoder.geocode(locationString);
        
        if (geoData && geoData.length > 0) {
            const firstResult = geoData[0];
            console.log('Geocoding successful:', { 
                formatted: firstResult.formattedAddress,
                coordinates: [firstResult.longitude, firstResult.latitude]
            });
            
            updatedData.geometry = {
                type: 'Point',
                coordinates: [firstResult.longitude, firstResult.latitude]
            };
            
            // Use the formatted address if available
            if (firstResult.formattedAddress) {
                updatedData.location = firstResult.formattedAddress;
            }
        }
    } catch (err) {
        console.warn('Geocoding not available or failed:', err.message);
        // Continue without geocoding - not a critical error
    }
    
    // Find and update the listing
    const listing = await Listing.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
    
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }
    
    // Handle file upload if a new image was provided
    if (req.file) {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    
    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${id}`);
    
  } catch (error) {
    console.error('Error updating listing:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      req.flash('error', `Validation error: ${messages}`);
    } else if (error.code === 11000) {
      req.flash('error', 'A listing with this title already exists. Please choose a different title.');
    } else {
      req.flash('error', 'An error occurred while updating the listing. Please try again.');
    }
    
    // Redirect back to the edit form with the error message
    res.redirect(`/listings/${req.params.id}/edit`);
  }
}

module.exports.destroyListing = async (req, res) => {
  try {
    let {id} = req.params;
    
    // Check if the listing exists
    const listing = await Listing.findById(id);
    if (!listing) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }
    
    // Check if the user is authorized to delete the listing
    if (!listing.owner.equals(req.user._id) && !req.user.isAdmin) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
      }
      req.flash('error', 'Not authorized to delete this listing');
      return res.redirect(`/listings/${id}`);
    }
    
    // Delete the listing
    await Listing.findByIdAndDelete(id);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ 
        success: true, 
        message: 'Listing deleted successfully!',
        listingId: id
      });
    }
    
    req.flash('success', 'Listing deleted successfully!');
    res.redirect('/listings');
    
  } catch (error) {
    console.error('Error deleting listing:', error);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while deleting the listing',
        error: error.message 
      });
    }
    
    req.flash('error', 'An error occurred while deleting the listing');
    res.redirect(`/listings/${id}`);
  }
}
