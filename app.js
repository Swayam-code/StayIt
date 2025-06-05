if(process.env.NODE_ENV != 'production'){
   require('dotenv').config();
}

// console.log(process.env.SECRET);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate= require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
 

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

// const MONGO_URL = "mongodb://localhost:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
  console.log('Connected to MongoDB');
  }).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  });

async function main(){
  mongoose.connect(dbUrl)
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
  console.log('error with mongo store', e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true, // Helps prevent XSS attacks
  }
}

// app.get('/', (req, res) => {
//   res.send('Hi, I am root');
// });

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user; // Make currentUser available in all templates
  next();
});

// app.get('/demouser', async (req, res) => {
//   let fakeUser = new User({
//     email : 'student@gmail.com',
//     username: 'delta-student',
//   });
//     let registeredUser = await User.register(fakeUser, 'password123');
//     res.send(`User created with username: ${registeredUser.username} and email: ${registeredUser.email}`);
// });



app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

// app.get('/testListing', async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the beach.",
//         image: "",
//         price: 1200,
//         location: "Calangute,Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("Sample listing saved");
//     res.send("Sample listing saved");

// });


app.all("*", (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
  let{statusCode= 500,message='Something went wrong!'} = err;
  res.status(statusCode).render('error.ejs', {err});
  // res.status(statusCode || 500).send(message || 'Something went wrong!');
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});