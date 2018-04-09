const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

const CONSTANTS = require('./../constants/constants');
const logger = require('./../services/logger.service');

class SmartContract {
    constructor() {
        logger.debug(`Allocating Smart Contract`);
        const contractHash = CONSTANTS.SMART_CONTRACT.HASH;
        const contractPath = CONSTANTS.SMART_CONTRACT.PATH;
        const contractInterface = fs.readFileSync(contractPath, 'utf-8');

        const web3Provider = CONSTANTS.WEB3.PROVIDER;

        logger.debug('Smart Contract ready!');
        this._interface = JSON.parse(contractInterface);

        const web3 = new Web3();
        web3.setProvider(new web3.providers.HttpProvider(web3Provider));
        this._contract = new web3.eth.Contract(this._interface, contractHash);
        logger.debug(`Allocated contract ${contractHash}`);

        this._caller = CONSTANTS.SMART_CONTRACT.CALLER;
        logger.debug(`Allocated caller ${this._caller}`);

        this._gasLimit = CONSTANTS.SMART_CONTRACT.GAS_LIMIT;
        logger.debug(`Allocated gas limit of ${this._gasLimit}`);
    }

    get caller() {
        return this._caller;
    }

    get contract() {
        return this._contract;
    }

    get gasLimit() {
        return this._gasLimit;
    }

    get interface() {
        return this._interface;
    }
}

module.exports = new SmartContract();