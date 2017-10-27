var mongoose = require( 'mongoose' );
var gracefulShutdown;
// Defined a database connection string
var dbURI = 'mongodb://localhost/Loc8r';
//var dbURI = 'mongodb://username:password@localhost:27027/database'
if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGODB_URI;
}

// Opened a Mongoose connection at application startup
mongoose.connect(dbURI);


// Monitored the Mongoose connection events
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});


// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
}


var readLine = require ("readline");
if (process.platform === "win32"){
    var rl = readLine.createInterface ({
        input: process.stdin,
        output: process.stdout
    });
    rl.on ("SIGINT", function (){
        process.emit ("SIGINT");
    });
}


// Monitored some Node process events so that we can close the Mongoose connection when the application ends
process.once('SIGUSR2', function () { // For nodemon restarts
    gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', function () { // For app termination
    gracefulShutdown('app termination', function () {
    process.exit(0);
    });
});
process.on('SIGTERM', function() { // For Heroku app termination
    gracefulShutdown('Heroku app shutdown', function () {
    process.exit(0);
    });
});

require('./locations');