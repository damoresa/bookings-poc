const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');

class RoomsService {
    constructor() {
        this.createRoom.bind(this);
        this.getRoomsForHotel.bind(this);
        this.getAvailableRooms.bind(this);
        this._getRoomsDetails.bind(this);
    }

    createRoom(hotelId, name, description, beds, bathrooms, visitors) {
        logger.debug(`Creating new room for hotel ${hotelId}`);
        return smartContract.contract.methods.createRoom(hotelId, name, description, beds, bathrooms, visitors).send({
            from: smartContract.caller,
            gas: smartContract.gasLimit
        }).on('receipt', (receipt) => { return receipt; });
    }

    getRoomsForHotel(hotelId) {
        logger.debug(`Finding rooms for hotel ${hotelId}`);
        return smartContract.contract.methods.hotelRooms(hotelId).call({ from: smartContract.caller })
            .then((roomIds) => { return this._getRoomsDetails(roomIds); });
    }

    getRoomDetails(roomId) {
        logger.debug(`Finding defailts for room ${roomId}`);
        return smartContract.contract.methods.roomDetail(roomId).call({ from: smartContract.caller })
            .then((data) => { return data; });
    }

    getAvailableRooms(location, start, end, visitors) {
        logger.debug(`Finding available rooms on ${location} and ${visitors} visitors from ${start} to ${end}`);
        return smartContract.contract.methods.availableRooms(location, start, end, visitors).call({ from: smartContract.caller })
            .then((roomIds) => { return this._getRoomsDetails(roomIds); });
    }

    _getRoomsDetails(roomIds) {
        logger.debug('Finding rooms details');
        const promises = [];
        roomIds.forEach((roomId) => {
            promises.push(smartContract.contract.methods.roomDetail(roomId).call({ from: smartContract.caller }));
        });
        return Promise.all(promises).then((data) => { return data; });
    }
}

module.exports = new RoomsService();