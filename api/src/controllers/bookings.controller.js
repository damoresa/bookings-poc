const express = require('express');
const moment = require('moment');

const CONSTANTS = require('./../constants/constants');
const bookingService = require('./../services/bookings.service');
const logger = require('./../services/logger.service');
const transformers = require('./../utils/transformers');

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
        const visitors = Number(request.body.visitors);
        const children = Number(request.body.children) || 0;

        // Validate the input parameters
        if (!roomId || !start || !end || !visitors || !children) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to book room (${roomId}, ${start}, ${end}, ${visitors}, ${children})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            const startDate = moment(start, CONSTANTS.DATE_FORMAT).unix();
            const endDate = moment(end, CONSTANTS.DATE_FORMAT).unix();
            const totalVisitors = visitors + children;

            logger.debug(`Creating booking on room ${roomId} for ${totalVisitors} visitors from ${start} to ${end}`);
            bookingService.bookRoom(roomId, startDate, endDate, totalVisitors)
                .then((receipt) => {
                    if (receipt.status === CONSTANTS.WEB3.TRANSACTION.OK) {
                        response.json({message: 'Room has been booked successfully'});
                    } else {
                        const time = moment().unix();
                        logger.error(`${time} | Room ${roomId} couldn't be booked for ${totalVisitors} visitors from ${start} to ${end}.`);
                        response.status(400).json({code: `${time}`, message: 'Room couldn\'t be booked'});
                    }
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error booking room ${roomId} from ${start} to ${end}: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

    getBookings(request, response) {

        logger.debug(`Finding bookings`);
        bookingService.getBookings()
            .then((bookings) => {
                response.json(bookings.map(transformers.parseBooking));
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
                    response.json(bookings.map(transformers.parseBooking));
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