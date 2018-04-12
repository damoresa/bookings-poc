const moment = require('moment');

const CONSTANTS = require('./../constants/constants');
const logger = require('./../services/logger.service');

const parseBooking = (booking) => {
    return {
        code: booking['0'],
        date: moment.unix(Number(booking['1'])).format(CONSTANTS.DATE_FORMAT),
        startDate: moment.unix(Number(booking['2'])).format(CONSTANTS.DATE_FORMAT),
        endDate: moment.unix(Number(booking['3'])).format(CONSTANTS.DATE_FORMAT),
        visitors: booking['4'],
        roomId: booking['5'],
    };
};

const parseError = (time, message, parameters) => {
    let parsedMessage = `${time} | ${message} `;
    if (parameters) {
        parsedMessage += '(';
        parameters.forEach((parameter) => {
            parsedMessage += `${parameter}, `;
        });
        parsedMessage = parsedMessage.trim();
        parsedMessage = parsedMessage.slice(0, parsedMessage.length - 1);
        parsedMessage += ')';
    }

    logger.error(parsedMessage);
};

const parseHotel = (hotel) => {
    return {
        code: hotel['0'],
        name: hotel['1'],
        description: hotel['2'],
        location: hotel['3'],
    };
};


const parseRoom = (room) => {
    return {
        code: room['0'],
        description: room['2'],
        beds: Number(room['3']),
        bathrooms: Number(room['4']),
        visitors: Number(room['5']),
        hotelId: Number(room['6']),
    };
};

module.exports = {
    parseBooking,
    parseError,
    parseHotel,
    parseRoom
};