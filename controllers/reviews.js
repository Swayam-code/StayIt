const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id; 
  console.log(newReview);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash('success', 'New review added successfully!');
  res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async (req, res) => {
  try {
    let {id, reviewId} = req.params;
    
    // Check if the review exists and belongs to the listing
    const review = await Review.findById(reviewId);
    if (!review) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      req.flash('error', 'Review not found');
      return res.redirect(`/listings/${id}`);
    }
    
    // Check if the user is authorized to delete the review
    if (!review.author.equals(req.user._id) && !req.user.isAdmin) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      }
      req.flash('error', 'Not authorized to delete this review');
      return res.redirect(`/listings/${id}`);
    }
    
    // Delete the review
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ 
        success: true, 
        message: 'Review deleted successfully!',
        reviewId: reviewId
      });
    }
    
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/listings/${id}`);
    
  } catch (error) {
    console.error('Error deleting review:', error);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(500).json({ 
        success: false, 
        message: 'An error occurred while deleting the review',
        error: error.message 
      });
    }
    
    req.flash('error', 'An error occurred while deleting the review');
    res.redirect(`/listings/${id}`);
  }
}