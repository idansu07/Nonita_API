module.exports = function (req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "http://localhost:3006"); // restrict it to the required domain
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS,PATCH");
    // Set custom headers for CORS
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Custom-Header,Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    return next();
};