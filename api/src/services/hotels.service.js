const logger = require('./logger.service');

const smartContract = require('./../utils/smart-contract');

class HotelsService {
    constructor() {
        this.createHotel.bind(this);
        this.getHotels.bind(this);
        this.pastEvents.bind(this);
        this._getHotelsDetails.bind(this);
    }

    async createHotel(name, description, location, rating, reviews) {
        logger.debug('Creating hotel');
        return await smartContract.contract.methods.createHotel(name, description, location, rating, reviews).send({
            from: smartContract.caller,
            gas: smartContract.gasLimit
        }).on('receipt', (receipt) => { return receipt; });
    }

    async getHotels() {
        logger.debug('Finding hotels');
        const hotelIds = await smartContract.contract.methods.allHotels().call({from: smartContract.caller});
        const hotels = await this._getHotelsDetails(hotelIds);
        return hotels;
    }

    async _getHotelsDetails(hotelIds) {
        logger.debug('Finding hotels details');
        const promises = [];
        hotelIds.forEach((hotelId) => {
            promises.push(smartContract.contract.methods.hotelDetail(hotelId).call({ from: smartContract.caller }));
        });
        return await Promise.all(promises);
    }

    pastEvents(initialBlock) {
        logger.debug('Retrieving hotel creation history');
        return smartContract.contract.getPastEvents("HotelCreated", { fromBlock: initialBlock || 0, toBlock: "latest" });
    }
}

module.exports = new HotelsService();