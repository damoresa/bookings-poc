const assert = require('assert');

const Web3 = require('web3');
const ganache = require('ganache-cli');
const provider = ganache.provider();

const web3 = new Web3(provider);

// TODO: TBI