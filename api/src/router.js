const bookingsController = require('./controllers/bookings.controller');
const hotelsController = require('./controllers/hotels.controller');
const roomsController = require('./controllers/rooms.controller');

const routerConfiguration = (application) => {

    application.use('/api/bookings', bookingsController.router);
    application.use('/api/hotels', hotelsController.router);
    application.use('/api/rooms', roomsController.router);
};

module.exports = {
    routerConfiguration
};