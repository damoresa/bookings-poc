const express = require('express');
const moment = require('moment');

const CONSTANTS = require('./../constants/constants');
const roomService = require('./../services/rooms.service');
const logger = require('./../services/logger.service');
const transformers = require('./../utils/transformers');

class RoomsController {

    get router() {
        return this._router;
    }

    constructor() {
        this.init();
    }

    init() {
        this._router = express.Router();
        this._router.get('/', this.getAvailableRooms.bind(this));
        this._router.get('/:roomId', this.getRoomDetail.bind(this));
    }

    getAvailableRooms(request, response) {

        const start = request.query.bookingStart;
        const end = request.query.bookingEnd;
        const location = request.query.location;
        const visitors = Number(request.query.visitors);
        const children = Number(request.query.children) || 0;

        if (!start || !end || !location || !visitors || !children) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to find available rooms (${start}, ${end}, ${location}, ${visitors}, ${children})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            const formattedStart = moment(start, CONSTANTS.DATE_FORMAT).unix();
            const formattedEnd = moment(end, CONSTANTS.DATE_FORMAT).unix();
            const totalVisitors = visitors + children;

            logger.debug(`Finding available rooms on ${location} for ${totalVisitors} visitors between ${start} and ${end}`);
            roomService.getAvailableRooms(location, formattedStart, formattedEnd, totalVisitors)
                .then((rooms) => {
                    response.json(rooms.map(transformers.parseRoom));
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error finding available rooms: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

    getRoomDetail(request, response) {

        const roomId = request.params.roomId;

        if (!roomId) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to find available rooms (${roomId})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            logger.debug(`Finding room ${roomId} details`);
            roomService.getRoomDetails(roomId)
                .then((room) => {
                    response.json(transformers.parseRoom(room));
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error finding room details: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

}

module.exports = new RoomsController();