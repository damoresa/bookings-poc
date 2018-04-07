const fs = require('fs');
const path = require('path');

const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'Hotels.sol');
const contractSourceCode = fs.readFileSync(contractPath, 'utf-8');

const compiledContract = solc.compile(contractSourceCode, 1).contracts[':Hotels'];
if (!compiledContract) throw new Error('Unable to compile contract');

module.exports = compiledContract;