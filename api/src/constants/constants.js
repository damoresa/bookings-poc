const path = require('path');

const CONSTANTS = {
    'DATE_FORMAT': 'DD/MM/YYYY',
    'SMART_CONTRACT': {
        'CALLER': process.env.CONTRACT_CALLER || '0x2a8d318530f3795db1de230098d654531b8a52e3',
        'GAS_LIMIT': process.env.CONTRACT_GASLIMIT || 1000000,
        'HASH': process.env.CONTRACT_HASH || '0x495bc51be37bB2AEca7219Ca4Eed5FAF240752d9',
        'PATH': path.resolve(__dirname, '..', 'contracts', 'Hotels.abi'),
    },
    'WEB3': {
        'PROVIDER': process.env.CONTRACT_HOST || 'http://localhost:8501'
    },
};

module.exports = CONSTANTS;