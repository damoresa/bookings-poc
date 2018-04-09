pragma solidity ^0.4.0;

contract Hotels {

    uint internal BOOKING_ID = 0;
    struct Booking {
        uint code;
        uint bookingDate;
        uint startDate;
        uint endDate;
    }

    uint internal HOTEL_ID = 0;
    struct Hotel {
        uint code;
        string name;
        string description;
        string location;
        uint visitors;
    }

    uint internal ROOM_ID = 0;
    struct Room {
        uint code;
        string name;
        string description;
        uint beds;
        uint bathrooms;
    }

    // TODO: Add events - hotel, room, booking creation
    // TODO: POC only supports a single user, use addresses for hotels / bookings on production
    // TODO: Split into smaller contracts as it's too big for the main network

    Booking[] internal bookings;
    mapping(uint => uint) internal bookingToRoom;
    mapping(uint => uint) internal roomBookingsCount;

    Hotel[] internal hotels;
    mapping(uint => uint) internal hotelRoomsCount;

    Room[] internal rooms;
    mapping(uint => uint) internal roomToHotel;

    function _generateRandomCode(string _str) private pure returns (uint) {
        uint rand = uint(keccak256(_str));
        return rand;
    }

    function _countAvailableRooms(uint startDate, uint endDate) private view returns (uint) {
        uint counter = 0;
        for (uint idx = 0; idx < rooms.length; idx++) {
            Room memory room = rooms[idx];
            if (_isRoomAvailable(room.code, startDate, endDate)) {
                counter++;
            }
        }
        return counter;
    }

    function _isInvalidRange(Booking booking, uint startDate, uint endDate) private pure returns (bool) {
        // Range is valid if either the start date is higher/equal than the booking end date
        // or if the end date is lower/equal than the booking start date
        return !(startDate >= booking.endDate || endDate <= booking.startDate);
    }

    function _isRoomAvailable(uint roomId, uint startDate, uint endDate) private view returns (bool) {
        bool available = true;
        uint idx = 0;

        // Iterate the bookings and validate those which belong to the given room
        while(available && idx < bookings.length) {
            Booking memory booking = bookings[idx];

            // Booking belongs to the given room AND the range is invalid
            if (bookingToRoom[booking.code] == roomId && _isInvalidRange(booking, startDate, endDate)) {
                available = false;
            }

            idx++;
        }

        return available;
    }

    function createBooking(uint roomCode, uint startDate, uint endDate) external returns (uint) {
        uint bookingCode = ++BOOKING_ID;
        Booking memory booking = Booking(bookingCode, now, startDate, endDate);
        bookings.push(booking);

        bookingToRoom[bookingCode] = roomCode;
        roomBookingsCount[roomCode]++;

        return bookingCode;
    }

    function bookingDetail(uint bookingId) external view returns (uint, uint, uint, uint) {
        uint pointer = 0;
        bool found = false;
        Booking memory booking;

        while (!found) {
            booking = bookings[pointer];
            if (booking.code == bookingId) {
                found = true;
            } else {
                pointer++;
            }
        }

        return (booking.code, booking.bookingDate, booking.startDate, booking.endDate);
    }

    function getBookings() external view returns (uint[]) {
        uint[] memory result = new uint[](bookings.length);
        for (uint idx = 0; idx < bookings.length; idx++) {
            result[idx] = bookings[idx].code;
        }
        return result;
    }

    function roomBookings(uint roomId) external view returns (uint[]) {
        uint[] memory result = new uint[](roomBookingsCount[roomId]);
        // Iterate the existing rooms and allocate those belonging to this hotel
        uint counter = 0;
        for (uint idx = 0; idx < bookings.length; idx++) {
            Booking memory booking = bookings[idx];
            if (bookingToRoom[booking.code] == roomId) {
                result[counter] = booking.code;
                counter++;
            }
        }
        return result;
    }

    function createRoom(uint hotelCode, string name, string description, uint beds, uint bathrooms) external returns (uint) {
        uint roomCode = ++ROOM_ID;
        Room memory room = Room(roomCode, name, description, beds, bathrooms);
        rooms.push(room);

        roomToHotel[roomCode] = hotelCode;
        roomBookingsCount[roomCode] = 0;
        hotelRoomsCount[hotelCode]++;

        return roomCode;
    }

    function roomDetail(uint roomId) external view returns (uint, string, string, uint, uint) {
        uint pointer = 0;
        bool found = false;
        Room memory room;

        while (!found) {
            room = rooms[pointer];
            if (room.code == roomId) {
                found = true;
            } else {
                pointer++;
            }
        }

        return (room.code, room.name, room.description, room.beds, room.bathrooms);
    }

    function availableRooms(uint startDate, uint endDate) external view returns (uint[]) {
        uint[] memory result = new uint[](_countAvailableRooms(startDate, endDate));
        uint counter = 0;
        for (uint idx = 0; idx < rooms.length; idx++) {
            Room memory room = rooms[idx];
            if (_isRoomAvailable(room.code, startDate, endDate)) {
                result[counter] = room.code;
                counter++;
            }
        }
        return result;
    }

    function hotelRooms(uint hotelId) external view returns (uint[]) {
        uint[] memory result = new uint[](hotelRoomsCount[hotelId]);
        // Iterate the existing rooms and allocate those belonging to this hotel
        uint counter = 0;
        for (uint idx = 0; idx < rooms.length; idx++) {
            Room memory room = rooms[idx];
            if (roomToHotel[room.code] == hotelId) {
                result[counter] = room.code;
                counter++;
            }
        }
        return result;
    }

    function createHotel(string name, string description, string location, uint visitors) external returns (uint) {
        uint hotelCode = ++HOTEL_ID;
        Hotel memory hotel = Hotel(hotelCode, name, description, location, visitors);
        hotels.push(hotel);

        hotelRoomsCount[hotelCode] = 0;

        return hotelCode;
    }

    function hotelDetail(uint hotelId) external view returns (uint, string, string, string, uint) {
        uint pointer = 0;
        bool found = false;
        Hotel memory hotel;

        while (!found) {
            hotel = hotels[pointer];
            if (hotel.code == hotelId) {
                found = true;
            } else {
                pointer++;
            }
        }

        return (hotel.code, hotel.name, hotel.description, hotel.location, hotel.visitors);
    }

    function allHotels() external view returns (uint[]) {
        uint[] memory result = new uint[](hotels.length);
        for (uint index = 0; index < hotels.length; index++) {
            result[index] = hotels[index].code;
        }
        return result;
    }
}
