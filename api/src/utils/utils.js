const logger = require('./../services/logger.service');

const handleErrors = (error, reject) => {
    logger.error(error);
    reject(error);
};

module.exports = {
    handleErrors
};