// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session && req.session.userRole === 'Admin') {
        return next();
    }
    res.status(403).send('Access denied');
};

// Middleware to check if user is manager
const isManager = (req, res, next) => {
    if (req.session && req.session.userRole === 'Manager') {
        return next();
    }
    res.status(403).send('Access denied');
};

module.exports = {
    isLoggedIn,
    isAdmin,
    isManager
};
