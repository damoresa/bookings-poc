const express = require('express');
const moment = require('moment');

const CONSTANTS = require('./../constants/constants');
const roomService = require('./../services/rooms.service');
const logger = require('./../services/logger.service');

const parseRoom = (room) => {
    return {
        code: room['0'],
        description: room['2'],
        beds: Number(room['3']),
        bathroom: Number(room['4']),
    };
};

class RoomsController {

    get router() {
        return this._router;
    }

    constructor() {
        this.init();
    }

    init() {
        this._router = express.Router();
        this._router.get('/all', this.getRooms.bind(this));
        this._router.get('/', this.getAvailableRooms.bind(this));
    }

    getRooms(request, response) {

        // TODO: This endpoint belongs to the Hotel controller, but since it's not used we won't refactor it yet
        const hotelId = request.query.hotelId;

        if (!hotelId) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to find rooms for hotel (${hotelId})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            logger.debug('Finding rooms');
            roomService.getRooms(hotelId)
                .then((rooms) => {
                    response.json(rooms.map(parseRoom));
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error finding rooms: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

    getAvailableRooms(request, response) {

        const start = request.query.bookingStart;
        const end = request.query.bookingEnd;

        if (!start || !end) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to find available rooms (${start}, ${end})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            const formattedStart = moment(start, CONSTANTS.DATE_FORMAT).unix();
            const formattedEnd = moment(end, CONSTANTS.DATE_FORMAT).unix();

            logger.debug(`Finding available rooms between ${start} and ${end}`);
            roomService.getAvailableRooms(formattedStart, formattedEnd)
                .then((rooms) => {
                    response.json(rooms.map(parseRoom));
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error finding available rooms: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

}

module.exports = new RoomsController();