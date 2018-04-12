const express = require('express');
const moment = require('moment');

const hotelService = require('./../services/hotels.service');
const roomService = require('./../services/rooms.service');
const logger = require('./../services/logger.service');
const transformers = require('./../utils/transformers');

class HotelsController {

    get router() {
        return this._router;
    }

    constructor() {
        this.init();
    }

    init() {
        this._router = express.Router();
        this._router.get('/', this.getHotels.bind(this));
        this._router.post('/', this.createHotel.bind(this));
        this._router.get('/:hotelId/rooms', this.getHotelRooms.bind(this));
    }

    getHotels(request, response) {

        logger.debug('Finding hotels');
        hotelService.getHotels()
            .then((hotels) => {
                response.json(hotels.map(transformers.parseHotel));
            })
            .catch((error) => {
                const time = moment().unix();
                logger.error(`${time} | Error finding hotels: ${error}`);
                response.status(500).json({code: `${time}`, message: error});
            });

    }

    createHotel(request, response) {

        const name = request.body.name;
        const description = request.body.description;
        const location = request.body.location;

        if (!name || !description || !location) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to create hotel (${name}, ${description}, ${location})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            logger.debug('Creating hotel');
            hotelService.createHotel(name, description, location)
                .then((receipt) => {
                    if (receipt.status === CONSTANTS.WEB3.TRANSACTION.OK) {
                        response.json({message: 'Hotel has been created successfully'});
                    } else {
                        const time = moment().unix();
                        logger.error(`${time} | Unable to create hotel.`);
                        response.status(400).json({code: `${time}`, message: 'Hotel couldn\'t be created'});
                    }
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error creating hotel: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }


    }

    getHotelRooms(request, response) {

        const hotelId = request.params.hotelId;

        if (!hotelId) {
            const time = moment().unix();
            logger.error(`${time} | Missing parameters to find rooms for hotel (${hotelId})`);
            response.status(500).json({ code: time, message: 'Invalid call, missing parameters' });
        } else {
            logger.debug('Finding rooms');
            roomService.getRoomsForHotel(hotelId)
                .then((rooms) => {
                    response.json(rooms.map(transformers.parseRoom));
                })
                .catch((error) => {
                    const time = moment().unix();
                    logger.error(`${time} | Error finding rooms: ${error}`);
                    response.status(500).json({code: `${time}`, message: error});
                });
        }

    }

}

module.exports = new HotelsController();