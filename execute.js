const moment = require('moment');
const Web3 = require('web3');
const {interface} = require('./compile');

const bookingScripts = require('./scripts/bookings');
const hotelScripts = require('./scripts/hotels');
const roomScripts = require('./scripts/rooms');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8501'));

// OLD HelloWorld: 0xb75ED07C6c11fBaf912B4390fE043d66738A4BC9
// HelloWorld with parameter: 0x8A4d9C5AF437BD54059CBa4A8b05D0f04dcd21fF
// Bookings V1: 0x495bc51be37bB2AEca7219Ca4Eed5FAF240752d9
// Bookings V2: 0xe143eE4d9b2425F1e02E59B55A04925b3b9c7FFB
// Bookings V3: 0x1660388837A62349092E80cD1FE46DA5fcC2F2B2
// Bookings V4: 0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba
// Bookings V5: 0x4d4159410D1192E3b26eAA70472a83258670A257
// Bookings V6: 0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba
// Bookings V7: 0xDfA3Af1339f396465487985b45d6d22c956DcAc6
// Bookings V8: 0x9e9be6E71Cff2b52b57B0d56788e3c616a3aea56
// Bookings V9: 0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba
// Bookings V10: 0x495bc51be37bB2AEca7219Ca4Eed5FAF240752d9
// Bookings V11: 0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba
// Bookings V12.A: 0x6939Cc119a7c1799FB0A546e9BB8B4325B540709
// Bookings V12.B: 0x74B5A730F913c3064c5Fb9FF594117353aC2477d
// Bookings V13: 0xEEf2e0a43F2E587116ae7315AF8928382ECCD65C
// Bookings V14: 0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba
// Bookings V15: 0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba
// Bookings V16: 0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba
// Bookings V17: 0xDC168403a67EE52f37A6D9c99913F189de874Ded
// Bookings V17(1): 0xDC168403a67EE52f37A6D9c99913F189de874Ded

const jsonInterface = JSON.parse(interface);
const contract = new web3.eth.Contract(jsonInterface, '0x420E55ffD79230b1F3b8112f7DB5aD570BAc23Ba');
const caller = '0x2a8d318530f3795db1de230098d654531b8a52e3';

const DATE_FORMAT = 'DD/MM/YYYY';

console.log(`Allocated contract`);

// Data definition
const hotels = [
    {
        name: 'First example hotel',
        description: 'A beautiful example hotel',
        location: 'Madrid, Spain',
        rating: 4,
        reviews: 1104
    },
    {
        name: 'Second example hotel',
        description: 'Another beautiful example hotel',
        location: 'Barcelona, Spain',
        rating: 3,
        reviews: 678
    },
    {
        name: 'Second example hotel',
        description: 'Another beautiful example hotel',
        location: 'Madera, Portugal',
        rating: 5,
        reviews: 892
    }
];

const rooms = [
    {
        name: 'Small room',
        description: 'Small sized room',
        cancellation: 'Free cancellation 3 days prior to arrival',
        beds: 2,
        bathrooms: 1,
        visitors: 2,
        price: 40
    },
    {
        name: 'Medium room',
        description: 'Medium sized room',
        cancellation: 'Free cancellation anytime',
        beds: 4,
        bathrooms: 1,
        visitors: 4,
        price: 60
    },
    {
        name: 'Minor suite',
        description: 'Smallest suite',
        cancellation: 'No cancellation',
        beds: 6,
        bathrooms: 2,
        visitors: 6,
        price: 120
    },
    {
        name: 'Major suite',
        description: 'Biggest suite',
        cancellation: 'No cancellation',
        beds: 8,
        bathrooms: 3,
        visitors: 8,
        price: 200
    }
];

const bookings = [
    {
        start: '19/04/2018',
        end: '25/04/2018',
        visitors: 2
    },
    {
        start: '25/04/2018',
        end: '30/04/2018',
        visitors: 2
    }
];

const filters = [
    {
        start: '18/04/2018',
        end: '21/04/2018',
        location: 'Madera, Portugal',
        visitors: 2,
    },
    {
        start: '21/04/2018',
        end: '26/04/2018',
        location: 'Madrid, Spain',
        visitors: 2,
    },
    {
        start: '18/04/2018',
        end: '26/04/2018',
        location: 'Madrid, Spain',
        visitors: 2,
    },
    {
        start: '17/04/2018',
        end: '19/04/2018',
        location: 'Barcelona, Spain',
        visitors: 2,
    },
    {
        start: '01/05/2018',
        end: '10/05/2018',
        location: 'Madera, Portugal',
        visitors: 2,
    }
];

const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

// Create the hotels
const initializeData = () => {
    return new Promise((resolve, reject) => {
        const creationPromises = [];
        hotels.forEach((hotel) => {
            creationPromises.push(hotelScripts.creation(contract, caller, hotel));
        });
        Promise.all(creationPromises).then((receipt) => {
            console.log('Created hotels');
            hotelScripts.search(contract, caller)
                .then((hotels) => {
                    const roomCreationPromises = [];
                    hotels.forEach((hotel) => {
                        const roomIdx = generateRandomNumber(0, rooms.length);
                        console.log(`Selected room ${roomIdx}`);
                        roomCreationPromises.push(roomScripts.creation(contract, caller, hotel['code'], rooms[roomIdx]));
                    });
                    Promise.all(roomCreationPromises).then((receipt) => {
                        console.log('Created rooms');
                        hotels.forEach((hotel) => {
                            roomScripts.search(contract, caller, hotel['code'])
                                .then((rooms) => {
                                    console.log(`Rooms for hotel ${hotel['code']}: ${JSON.stringify(rooms)}`);
                                    const roomIdx = generateRandomNumber(0, rooms.length);
                                    console.log(`Selected room ${rooms[roomIdx]['code']}`);
                                    const roomId = rooms[roomIdx]['code'];
                                    const bookingCreationPromises = [];
                                    bookings.map((booking) => {
                                        return {
                                            start: moment(booking.start, DATE_FORMAT).unix(),
                                            end: moment(booking.end, DATE_FORMAT).unix(),
                                            visitors: booking.visitors
                                        };
                                    }).forEach((booking) => {
                                        console.log(`Booking room ${roomId} on period ${booking.start} to ${booking.end} for ${booking.visitors}`);
                                        bookingCreationPromises.push(bookingScripts.creation(contract, caller, roomId, booking));
                                    });
                                    Promise.all(bookingCreationPromises).then((receipt) => {
                                        console.log(`Created bookings for room ${roomId}`);
                                        // bookingScripts.search(contract, caller, roomId).then(console.log).catch(reject);
                                        resolve();
                                    }).catch(reject);

                                })
                                .catch(reject);
                        })
                    });
                })
                .catch(reject);
        }).catch(reject);
    });
};

const validateBookings = () => {
    filters.map((filter) => {
        return {
            start: moment(filter.start, DATE_FORMAT).unix(),
            end: moment(filter.end, DATE_FORMAT).unix(),
            location: filter.location,
            visitors: filter.visitors
        };
    }).forEach((filter) => {
        roomScripts.searchAvailableRooms(contract, caller, filter)
            .then((roomsResult) => {
                console.log(`Range ${moment.unix(filter.start).format(DATE_FORMAT)} to ${moment.unix(filter.end).format(DATE_FORMAT)}: ${JSON.stringify(roomsResult)}`);
            }).catch(console.error);
    });
};

initializeData().then(validateBookings).catch(console.error);