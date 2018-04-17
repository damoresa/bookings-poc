const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const {interface, bytecode} = require('./../compile');

let accounts;
let contract;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    contract = await new web3.eth.Contract(JSON.parse(interface));
    contract.deploy({
        data: bytecode
    }).send({
        from: accounts[0],
        gas: 10000000000,
        gasPrice: 1,
    });
    contract.setProvider(provider);
});

// FIXME: Contract is not getting deployed because of gastLimit

describe('Hotels Contract', () => {
    it('Deploys the contract', () => {
        assert.ok(contract.options.address);
    });
});