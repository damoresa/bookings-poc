const express = require('express');
const moment = require('moment');

const hotelService = require('./../services/hotels.service');
const logger = require('./../services/logger.service');

const parseHotel = (hotel) => {
    return {
        code: hotel['0'],
        name: hotel['1'],
        description: hotel['2'],
        location: hotel['3'],
        visitors: Number(hotel['4']),
    };
};

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
    }

    getHotels(request, response) {

        logger.debug('Finding hotels');
        hotelService.getHotels()
            .then((hotels) => {
                response.json(hotels.map(parseHotel));
            })
            .catch((error) => {
                const time = moment().unix();
                logger.error(`${time} | Error finding hotels: ${error}`);
                response.status(500).json({code: `${time}`, message: error});
            });

    }

}

module.exports = new HotelsController();