const creation = (contract, caller, hotelId, room) => {
    return new Promise((resolve, reject) => {
        contract.methods.createRoom(hotelId, room.name, room.description, room.beds, room.bathrooms, room.visitors).send({
            from: caller,
            gas: 1000000
        })
            .on('receipt', resolve)
            .on('error', reject)
            .catch(reject);
    });
};

const search = (contract, caller, hotelId) => {
    return new Promise((resolve, reject) => {
        contract.methods.hotelRooms(hotelId).call({ from: caller })
            .then((roomIds) => {
                const promises = [];
                roomIds.forEach((roomId) => {
                    promises.push(contract.methods.roomDetail(roomId).call({ from: caller }));
                });
                Promise.all(promises).then(resolve).catch(reject);
            })
            .catch(reject);
    });
};

const searchAvailableRooms = (contract, caller, filter) => {
    return new Promise((resolve, reject) => {
        contract.methods.availableRooms(filter.location, filter.start, filter.end, filter.visitors).call({ from: caller })
            .then((roomIds) => {
                const promises = [];
                roomIds.forEach((roomId) => {
                    promises.push(contract.methods.roomDetail(roomId).call({ from: caller }));
                });
                Promise.all(promises).then(resolve).catch(reject);
            })
            .catch(reject);
    });
};

module.exports = {
    creation,
    search,
    searchAvailableRooms
};