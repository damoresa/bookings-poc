const express = require('express');
const moment = require('moment');

const bookingService = require('./../services/bookings.service');
const hotelService = require('./../services/hotels.service');
const logger = require('./../services/logger.service');
const roomService = require('./../services/rooms.service');
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
        this._router.get('/bookings', this.getBookingsHistoric.bind(this));
        this._router.get('/hotels', this.getHotelsHistoric.bind(this));
        this._router.get('/rooms', this.getRoomsHistoric.bind(this));
    }

    async getBookingsHistoric(request, response) {

        logger.debug('Retrieving booking transactions history');
        try {
            const transactions = await bookingService.pastEvents();
            response.json({result: transactions.map(transformers.parseBookingHistoric)});
        } catch (error) {
            const time = moment().unix();
            logger.error(`${time} | Error retrieving booking transactions history: ${error}`);
            response.status(500).json({code: `${time}`, message: error.toString()});
        }
    }

    async getHotelsHistoric(request, response) {

        logger.debug('Retrieving hotel transactions history');
        try {
            const transactions = await hotelService.pastEvents();
            response.json({result: transactions.map(transformers.parseHotelHistoric)});
        } catch (error) {
            const time = moment().unix();
            logger.error(`${time} | Error retrieving hotel transactions history: ${error}`);
            response.status(500).json({code: `${time}`, message: error.toString()});
        }
    }

    async getRoomsHistoric(request, response) {

        logger.debug('Retrieving room transactions history');
        try {
            const transactions = await roomService.pastEvents();
            response.json({result: transactions.map(transformers.parseRoomHistoric)});
        } catch (error) {
            const time = moment().unix();
            logger.error(`${time} | Error retrieving room transactions history: ${error}`);
            response.status(500).json({code: `${time}`, message: error.toString()});
        }
    }

}

module.exports = new BookingsController();