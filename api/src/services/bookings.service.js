const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');

class BookingsService {
    constructor() {
        this.bookRoom.bind(this);
        this.getBookings.bind(this);
        this.getBookingsForRoom.bind(this);
        this.pastEvents.bind(this);
        this._getBookingsDetails.bind(this);
    }

    bookRoom(roomId, start, end, visitors) {
        logger.debug(`Booking room ${roomId} for ${visitors} visitors from ${start} to ${end}`);
        return smartContract.contract.methods.createBooking(roomId, start, end, visitors).send({
            from: smartContract.caller,
            gas: smartContract.gasLimit
        }).on('receipt', (receipt) => { return receipt; });
    }

    getBookings() {
        logger.debug(`Finding bookings`);
        return smartContract.contract.methods.getBookings().call({ from: smartContract.caller })
            .then((bookingIds) => { return this._getBookingsDetails(bookingIds); });
    }

    getBookingsForRoom(roomId) {
        logger.debug(`Finding bookings for room ${roomId}`);
        return smartContract.contract.methods.roomBookings(roomId).call({ from: smartContract.caller })
            .then((bookingIds) => {
                return this._getBookingsDetails(bookingIds);
            });
    }

    pastEvents(initialBlock) {
        logger.debug('Retrieving booking creation history');
        return smartContract.contract.getPastEvents("BookingCreated", { fromBlock: initialBlock || 0, toBlock: "latest" });
    }

    _getBookingsDetails(bookingIds) {
        logger.debug('Finding bookings details');
        const promises = [];
        bookingIds.forEach((bookingId) => {
            promises.push(smartContract.contract.methods.bookingDetail(bookingId).call({ from: smartContract.caller }));
        });
        return Promise.all(promises).then((data) => { return data; });
    }
}

module.exports = new BookingsService();