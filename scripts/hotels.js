const creation = (contract, caller, hotel) => {
    return new Promise((resolve, reject) => {
        contract.methods.createHotel(hotel.name, hotel.description, hotel.location, hotel.visitors).send({
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

const search = (contract, caller) => {
    return new Promise((resolve, reject) => {
        contract.methods.allHotels().call({ from: caller })
            .then((hotelIds) => {
                const promises = [];
                hotelIds.forEach((hotelId) => {
                    promises.push(contract.methods.hotelDetail(hotelId).call({ from: caller }));
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