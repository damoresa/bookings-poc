const moment = require('moment');

const DATE_FORMAT = 'DD/MM/YYYY';

const startTime = moment('19/04/2018', DATE_FORMAT);
const endTime = moment('20/04/2018', DATE_FORMAT);
console.log(startTime.unix());
console.log(endTime.unix());
console.log(endTime.unix() - startTime.unix());

console.log(moment.unix(startTime.unix()).format(DATE_FORMAT));
console.log(moment.unix(endTime.unix()).format(DATE_FORMAT));
