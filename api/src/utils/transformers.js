const moment = require('moment');

const CONSTANTS = require('./../constants/constants');
const logger = require('./../services/logger.service');

const parseBooking = (booking) => {
    return {
        code: booking['code'],
        date: moment.unix(Number(booking['date'])).format(CONSTANTS.DATE_FORMAT),
        startDate: moment.unix(Number(booking['start'])).format(CONSTANTS.DATE_FORMAT),
        endDate: moment.unix(Number(booking['end'])).format(CONSTANTS.DATE_FORMAT),
        visitors: Number(booking['visitors']),
        roomId: Number(booking['roomCode']),
    };
};

const parseBookingHistoric = (event) => {
    const booking = parseBooking(event.returnValues);
    booking['transaction'] = event.transactionHash;
    return booking;
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
        code: hotel['code'],
        name: hotel['name'],
        description: hotel['description'],
        location: hotel['location'],
    };
};

const parseHotelHistoric = (event) => {
    const hotel = parseHotel(event.returnValues);
    hotel['transaction'] = event.transactionHash;
    return hotel;
};

const parseRoom = (room) => {
    return {
        code: room['code'],
        description: room['description'],
        beds: Number(room['beds']),
        bathrooms: Number(room['bathrooms']),
        visitors: Number(room['visitors']),
        price: Number(room['price']),
        hotelId: Number(room['hotelCode']),
    };
};

const parseRoomHistoric = (event) => {
    const room = parseRoom(event.returnValues);
    room['transaction'] = event.transactionHash;
    return room;
};

module.exports = {
    parseBooking,
    parseBookingHistoric,
    parseError,
    parseHotel,
    parseHotelHistoric,
    parseRoom,
    parseRoomHistoric
};