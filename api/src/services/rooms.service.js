const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');
const utils = require('./../utils/utils');

class RoomsService {
    constructor() {
        this.createRoom.bind(this);
        this.getRoomsForHotel.bind(this);
        this.getAvailableRooms.bind(this);
        this._getRoomsDetails.bind(this);
    }

    createRoom(hotelId, name, description, beds, bathrooms, visitors) {
        logger.debug(`Creating new room for hotel ${hotelId}`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.createRoom(hotelId, name, description, beds, bathrooms, visitors).send({
                from: smartContract.caller,
                gas: smartContract.gasLimit
            })
                .on('receipt', resolve)
                .on('error', (error) => utils.handleErrors(error, reject))
                .catch((error) => utils.handleErrors(error, reject));
        });
    }

    getRoomsForHotel(hotelId) {
        logger.debug(`Finding rooms for hotel ${hotelId}`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.hotelRooms(hotelId).call({ from: smartContract.caller })
                .then((roomIds) => {
                    this._getRoomsDetails(roomIds)
                        .then(resolve)
                        .catch((error) => utils.handleErrors(error, reject));
                })
                .catch((error) => utils.handleErrors(error, reject));
        });
    }

    getRoomDetails(roomId) {
        logger.debug(`Finding defailts for room ${roomId}`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.roomDetail(roomId).call({ from: smartContract.caller })
                .then(resolve)
                .catch((error) => utils.handleErrors(error, reject));
        });
    }

    getAvailableRooms(location, start, end, visitors) {
        logger.debug(`Finding available rooms on ${location} and ${visitors} visitors from ${start} to ${end}`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.availableRooms(location, start, end, visitors).call({ from: smartContract.caller })
                .then((roomIds) => {
                    this._getRoomsDetails(roomIds)
                        .then(resolve)
                        .catch((error) => utils.handleErrors(error, reject));
                })
                .catch(reject);
        });
    }

    _getRoomsDetails(roomIds) {
        logger.debug('Finding rooms details');
        return new Promise((resolve, reject) => {
            const promises = [];
            roomIds.forEach((roomId) => {
                promises.push(smartContract.contract.methods.roomDetail(roomId).call({ from: smartContract.caller }));
            });
            Promise.all(promises).then(resolve).catch((error) => utils.handleErrors(error, reject));
        });
    }
}

module.exports = new RoomsService();