const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');

class HotelsService {
    constructor() {
        this.createHotel.bind(this);
        this.getHotels.bind(this);
        this._getHotelsDetails.bind(this);
    }

    createHotel(name, description, location) {
        logger.debug('Creating hotel');
        return smartContract.contract.methods.createHotel(name, description, location).send({
            from: smartContract.caller,
            gas: smartContract.gasLimit
        }).on('receipt', (receipt) => { return receipt; });
    }

    getHotels() {
        logger.debug('Finding hotels');
        return smartContract.contract.methods.allHotels().call({from: smartContract.caller})
            .then((hotelIds) => { return this._getHotelsDetails(hotelIds); });
    }

    _getHotelsDetails(hotelIds) {
        logger.debug('Finding hotels details');
        const promises = [];
        hotelIds.forEach((hotelId) => {
            promises.push(smartContract.contract.methods.hotelDetail(hotelId).call({ from: smartContract.caller }));
        });
        return Promise.all(promises).then((data) => { return data; });
    }
}

module.exports = new HotelsService();