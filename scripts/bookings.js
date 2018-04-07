const creation = (contract, caller, roomId, booking) => {
    return new Promise((resolve, reject) => {
        contract.methods.createBooking(roomId, booking.start, booking.end).send({
            from: caller,
            gas: 1000000
        })
        // .on('transactionHash', (hash) => {
        //     console.log(`Transaction hash: ${hash}`);
        // })
        // This is fired once per confirmation : WHOS CONFIRMING THIS
        // .on('confirmation', (confirmationNo, receipt) => {
        //     console.log(`Transaction confirmation: ${confirmationNo}`);
        //     console.log(`Transaction receipt: ${JSON.stringify(receipt)}`);
        // })
            .on('receipt', resolve)
            .on('error', reject)
            .catch(reject);
    });
};

const search = (contract, caller, roomId) => {
    return new Promise((resolve, reject) => {
        contract.methods.roomBookings(roomId).call({ from: caller })
            .then((bookingIds) => {
                const promises = [];
                bookingIds.forEach((bookingId) => {
                    promises.push(contract.methods.bookingDetail(bookingId).call({ from: caller }));
                });
                Promise.all(promises).then(resolve).catch(reject);
            })
            .catch(reject);
    });
};

module.exports = {
    creation,
    search
};