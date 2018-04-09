const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const winston = require('winston');

const router = require('./router');

// ExpressJS service
const applicationPort = process.env.PORT || 3300;
const application = express();

// FIXME: CORS FILTER
application.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, Authorization');
    // Allow all preflight OPTIONS requests in order to avoid issues since they don't have the Authorization header
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});


// Server configuration
// Parse requests body as JSON
application.use(bodyParser.json());
application.use(bodyParser.urlencoded({
    extended: true
}));

// Configure morgan to dispatch traces to winston
application.use(morgan('combined', { stream: { write: message => winston.info }}));

// Application endpoints
router.routerConfiguration(application);

// Start application and listen to error events
application.listen(applicationPort, () => {
    console.log(`BookingManager backend listening on port ${applicationPort}!`)
});

application.on('error', (error) => {
    console.log(` ## ERROR # ${error} ## `);
    throw error;
});
