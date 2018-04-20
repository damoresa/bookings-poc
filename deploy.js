const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8501'));

const jsonInterface = JSON.parse(interface);
const code = `0x${bytecode}`;

web3.eth.getCoinbase()
    .then((user) => {
        const password = '123456';

        try {
            console.log(`Unlocking ${user}`);
            web3.eth.personal.unlockAccount(user, password);

            const contract = new web3.eth.Contract(jsonInterface);
            contract.deploy({
                data: code
            }).send({
                from: user,
                gas: 1000000000000000,
                gasPrice: 1,
            }).then((contract) => {
                console.log(`Contract deployed ${contract.options.address}`);
            }).catch((error) => {
                console.error(error);
            });
        } catch (error) {
            throw new Error(error);
        }
    })
    .catch((error) => {
        console.error(error);
        throw new Error(error);
    });