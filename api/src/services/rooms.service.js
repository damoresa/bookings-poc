const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');
const utils = require('./../utils/utils');

class RoomsService {
    constructor() {
        this.getRooms.bind(this);
        this.getAvailableRooms.bind(this);
        this._getRoomsDetails.bind(this);
    }

    getRooms(hotelId) {
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

    getAvailableRooms(start, end) {
        logger.debug(`Finding available rooms for range ${start} to ${end}`);
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.availableRooms(start, end).call({ from: smartContract.caller })
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