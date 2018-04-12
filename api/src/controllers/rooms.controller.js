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
        this._router.post('/', this.createRoom.bind(this));
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
                    response.status(500).json({code: `${time}`, message: error.toString()});
                });
        }

    }

    createRoom(request, response) {

        const hotelId = request.body.hotelId;
        const name = request.body.name;
        const description = request.body.description;
        const beds = request.body.beds;
        const bathrooms = request.body.bathrooms;
        const visitors = request.body.visitors;

        if (!hotelId || !name || !description || !beds || !bathrooms || !visitors) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to find available rooms (${hotelId}, ${name}, ${description}, ${beds}, ${bathrooms}, ${visitors})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            logger.debug(`Creating a new room on hotel ${hotelId}`);
            roomService.createRoom(hotelId, name, description, Number(beds), Number(bathrooms), Number(visitors))
                .then((receipt) => {
                    if (receipt.status === CONSTANTS.WEB3.TRANSACTION.OK) {
                        response.json({message: 'Room has been created successfully'});
                    } else {
                        const time = moment().unix();
                        logger.error(`${time} | Unable to create room for hotel ${hotelId}.`);
                        response.status(400).json({code: `${time}`, message: 'Room couldn\'t be created'});
                    }
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error creating room for hotel ${hotelId}: ${error}`);
                    response.status(500).json({code: `${time}`, message: error.toString()});
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
                    response.status(500).json({code: `${time}`, message: error.toString()});
                });
        }

    }

}

module.exports = new RoomsController();