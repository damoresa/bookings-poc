const express = require('express');
const moment = require('moment');

const CONSTANTS = require('./../constants/constants');
const bookingService = require('./../services/bookings.service');
const logger = require('./../services/logger.service');

const parseBooking = (booking) => {
    return {
        code: booking['0'],
        date: moment.unix(Number(booking['1'])).format(CONSTANTS.DATE_FORMAT),
        startDate: moment.unix(Number(booking['2'])).format(CONSTANTS.DATE_FORMAT),
        endDate: moment.unix(Number(booking['3'])).format(CONSTANTS.DATE_FORMAT),
    };
};

class BookingsController {

    get router() {
        return this._router;
    }

    constructor() {
        this.init();
    }

    init() {
        this._router = express.Router();
        this._router.get('/', this.getBookings.bind(this));
        this._router.post('/', this.bookRoom.bind(this));
        this._router.get('/:bookId', this.getBookingsForRoom.bind(this));
    }

    bookRoom(request, response) {

        const roomId = request.body.roomId;
        const start = request.body.start;
        const end = request.body.end;

        // Validate the input parameters
        if (!roomId || !start || !end) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to book room (${roomId}, ${start}, ${end})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            const startDate = moment(start, CONSTANTS.DATE_FORMAT).unix();
            const endDate = moment(end, CONSTANTS.DATE_FORMAT).unix();

            logger.debug(`Creating booking for room ${roomId} from ${start} to ${end}`);
            bookingService.bookRoom(roomId, startDate, endDate)
                .then(() => {
                    response.json({message: 'Room has been booked successfully'});
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error booking room: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

    getBookings(request, response) {

        logger.debug(`Finding bookings`);
        bookingService.getBookings()
            .then((bookings) => {
                response.json(bookings.map(parseBooking));
            })
            .catch((error) => {
                const time = moment().unix();
                logger.error(`${time} | Error finding bookings: ${error}`);
                response.status(500).json({code: `${time}`, message: error});
            });

    }

    getBookingsForRoom(request, response) {

        const roomId = request.params.bookId;

        if (!roomId) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to find bookings for room (${roomId})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            logger.debug(`Finding bookings for room ${roomId}`);
            bookingService.getBookingsForRoom(roomId)
                .then((bookings) => {
                    response.json(bookings.map(parseBooking));
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error finding bookings for room: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

}

module.exports = new BookingsController();