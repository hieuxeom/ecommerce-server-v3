var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
const cors = require("cors");
var app = express();

app.use(
    cors({
        credentials: true,
        origin: function (origin, callback) {
            callback(null, true);
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use(logger("dev"));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', 'jade');

var apiV1Router = require("./src/routes/apiRouter");

app.use("/api", apiV1Router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
