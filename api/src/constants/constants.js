const path = require('path');

const CONSTANTS = {
    'DATE_FORMAT': 'DD/MM/YYYY',
    'SMART_CONTRACT': {
        'CALLER': process.env.CONTRACT_CALLER || '0x2a8d318530f3795db1de230098d654531b8a52e3',
        'GAS_LIMIT': process.env.CONTRACT_GASLIMIT || 1000000,
        'HASH': process.env.CONTRACT_HASH || '0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba',
        'PATH': path.resolve(__dirname, '..', 'contracts', 'Hotels.abi'),
    },
    'WEB3': {
        'PROVIDER': process.env.CONTRACT_HOST || 'http://localhost:8501',
        'TRANSACTION': {
            'ERROR': '0x0',
            'OK': '0x1',
        },
    },
};

module.exports = CONSTANTS;