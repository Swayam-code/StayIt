const User = require('../models/user');

module.exports.renderSignupForm = (req, res) => {
  res.render('users/signup.ejs');
}

module.exports.signup = async (req, res) => {
    try{
        let {username, email, password} = req.body;
        let newuser = new User ({email, username});
        const registeredUser = await User.register(newuser,password);
        console.log(registeredUser);
        req.login(registeredUser, (err)=> {
            if(err) {
                return next(err);
            }
            req.flash('success', 'Welcome to Wanderlust!');
            res.redirect(req.session.redirectUrl || '/listings');
        })
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('/signup');
    }
}

module.exports.renderLoginForm = (req, res) => {
  res.render('users/login.ejs');
}

module.exports.login = async(req, res) => {
    req.flash ('success','Welcome back to Wanderlust!');
    let redirectUrl = res.locals.redirectUrl || '/listings';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res,next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash('success', 'Logged out successfully!');
        res.redirect('/listings');
    });
}