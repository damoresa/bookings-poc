const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');
const utils = require('./../utils/utils');

class BookingsService {
    constructor() {
        this.bookRoom.bind(this);
        this.getBookings.bind(this);
        this.getBookingsForRoom.bind(this);
        this._getBookingsDetails.bind(this);
    }

    bookRoom(roomId, start, end, visitors) {
        logger.debug(`Booking room ${roomId} for ${visitors} visitors from ${start} to ${end}`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.createBooking(roomId, start, end, visitors).send({
                from: smartContract.caller,
                gas: smartContract.gasLimit
            })
                .on('receipt', resolve)
                .on('error', (error) => utils.handleErrors(error, reject))
                .catch((error) => utils.handleErrors(error, reject));
        });
    }

    getBookings() {
        logger.debug(`Finding bookings`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.getBookings().call({ from: smartContract.caller })
                .then((bookingIds) => {
                    this._getBookingsDetails(bookingIds)
                        .then(resolve)
                        .catch((error) => utils.handleErrors(error, reject));
                })
                .catch((error) => utils.handleErrors(error, reject));
        });
    }

    getBookingsForRoom(roomId) {
        logger.debug(`Finding bookings for room ${roomId}`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.roomBookings(roomId).call({ from: smartContract.caller })
                .then((bookingIds) => {
                    this._getBookingsDetails(bookingIds)
                        .then(resolve)
                        .catch((error) => utils.handleErrors(error, reject));
                })
                .catch((error) => utils.handleErrors(error, reject));
        });
    }

    _getBookingsDetails(bookingIds) {
        logger.debug('Finding bookings details');
        return new Promise((resolve, reject) => {
            const promises = [];
            bookingIds.forEach((bookingId) => {
                promises.push(smartContract.contract.methods.bookingDetail(bookingId).call({ from: smartContract.caller }));
            });
            Promise.all(promises).then(resolve).catch((error) => utils.handleErrors(error, reject));
        });
    }
}

module.exports = new BookingsService();