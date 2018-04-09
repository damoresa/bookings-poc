const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');
const utils = require('./../utils/utils');

class HotelsService {
    constructor() {
        this.getHotels.bind(this);
        this._getHotelsDetails.bind(this);
    }

    getHotels() {
        logger.debug('Finding hotels');
        return new Promise((resolve, reject) => {
            smartContract.contract.methods.allHotels().call({from: smartContract.caller})
                .then((hotelIds) => {
                    this._getHotelsDetails(hotelIds)
                        .then(resolve)
                        .catch((error) => utils.handleErrors(error, reject));
                })
                .catch((error) => utils.handleErrors(error, reject));
        });
    }

    _getHotelsDetails(hotelIds) {
        logger.debug('Finding hotels details');
        return new Promise((resolve, reject) => {
            const promises = [];
            hotelIds.forEach((hotelId) => {
                promises.push(smartContract.contract.methods.hotelDetail(hotelId).call({ from: smartContract.caller }));
            });
            Promise.all(promises).then(resolve).catch((error) => utils.handleErrors(error, reject));
        });
    }
}

module.exports = new HotelsService();