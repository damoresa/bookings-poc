pragma solidity ^0.4.0;

contract Hotels {

    // TODO: POC only supports a single user, use addresses for hotels / bookings on production
    // TODO: Split into smaller contracts as it's too big for the main network
    //       One possible way of doing this is to keep a master contract which invokes all of these.

    uint internal BOOKING_ID = 0;
    struct Booking {
        uint code;
        uint bookingDate;
        uint startDate;
        uint endDate;
        uint visitors;
    }

    uint internal HOTEL_ID = 0;
    struct Hotel {
        uint code;
        string name;
        string description;
        string location;
        uint rating;
        uint reviews;
    }

    uint internal ROOM_ID = 0;
    struct Room {
        uint code;
        string name;
        string description;
        string cancellation;
        uint beds;
        uint bathrooms;
        uint visitors;
        uint price;
    }

    // Events for hotel, room, booking creation
    // Only static size types can be indexed:
    // https://ethereum.stackexchange.com/questions/6840/indexed-event-with-string-not-getting-logged/7170#7170
    event BookingCreated(uint indexed code, uint date, uint start, uint end, uint visitors, uint roomCode);
    event HotelCreated(uint indexed code, string name, string description, string location, uint rating, uint reviews);
    event RoomCreated(uint indexed code, string name, string description, string cancellation, uint beds, uint bathrooms, uint visitors, uint price, uint hotelCode);

    // Internal data stores
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

    function _countAvailableRooms(string location, uint startDate, uint endDate, uint visitors) private view returns (uint) {
        uint counter = 0;
        for (uint idx = 0; idx < rooms.length; idx++) {
            Room memory room = rooms[idx];
            Hotel memory hotel = _getHotel(roomToHotel[room.code]);
            if (keccak256(hotel.location) == keccak256(location) && _isRoomAvailable(room.code, startDate, endDate, visitors)) {
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

    function _canRoomFitVisitors(uint roomId, uint visitors) private view returns (bool) {
        bool found = false;
        uint counter = 0;
        Room memory room;
        while(!found) {
            room = rooms[counter];
            if (room.code == roomId) {
                found = true;
            } else {
                counter++;
            }
        }
        return room.visitors >= visitors;
    }

    function _isRoomAvailable(uint roomId, uint startDate, uint endDate, uint visitors) private view returns (bool) {
        bool available = true;
        uint idx = 0;

        // If the room isn't big enough, mark it as not available, check the room bookings otherwise
        if (!_canRoomFitVisitors(roomId, visitors)) {
            available = false;
        } else {
            // Iterate the bookings and validate those which belong to the given room
            while (available && idx < bookings.length) {
                Booking memory booking = bookings[idx];

                // Booking belongs to the given room AND the range is invalid
                if (bookingToRoom[booking.code] == roomId && _isInvalidRange(booking, startDate, endDate)) {
                    available = false;
                }

                idx++;
            }
        }

        return available;
    }

    modifier canBeBooked(uint roomId, uint startDate, uint endDate, uint visitors) {
        // Modifier function that masks _isRoomAvailable so we can easily attach it to function
        // headers as a modifier instead of performing validations on the function body
        require(_isRoomAvailable(roomId, startDate, endDate, visitors));
        _;
    }

    function createBooking(uint roomCode, uint startDate, uint endDate, uint visitors) external canBeBooked(roomCode, startDate, endDate, visitors) returns (uint) {
        uint bookingCode = ++BOOKING_ID;
        uint date = now;
        Booking memory booking = Booking(bookingCode, date, startDate, endDate, visitors);
        bookings.push(booking);

        bookingToRoom[bookingCode] = roomCode;
        roomBookingsCount[roomCode]++;

        emit BookingCreated(bookingCode, date, startDate, endDate, visitors, bookingToRoom[bookingCode]);

        return bookingCode;
    }

    function bookingDetail(uint bookingId) external view returns (uint code, uint date, uint start, uint end, uint visitors, uint roomCode) {
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

        return (booking.code, booking.bookingDate, booking.startDate, booking.endDate, booking.visitors, bookingToRoom[booking.code]);
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

    function createRoom(uint hotelCode, string name, string description, string cancellation, uint beds, uint bathrooms, uint visitors, uint price) external returns (uint) {
        uint roomCode = ++ROOM_ID;
        Room memory room = Room(roomCode, name, description, cancellation, beds, bathrooms, visitors, price);
        rooms.push(room);

        roomToHotel[roomCode] = hotelCode;
        roomBookingsCount[roomCode] = 0;
        hotelRoomsCount[hotelCode]++;

        emit RoomCreated(roomCode, name, description, cancellation, beds, bathrooms, visitors, price, roomToHotel[roomCode]);

        return roomCode;
    }

    function roomDetail(uint roomId) external view returns (uint code, string name, string description, string cancellation, uint beds, uint bathrooms, uint visitors, uint price, uint hotelCode) {
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

        return (room.code, room.name, room.description, room.cancellation, room.beds, room.bathrooms, room.visitors, room.price, roomToHotel[room.code]);
    }

    function availableRooms(string location, uint startDate, uint endDate, uint visitors) external view returns (uint[]) {
        uint[] memory result = new uint[](_countAvailableRooms(location, startDate, endDate, visitors));
        uint counter = 0;
        for (uint idx = 0; idx < rooms.length; idx++) {
            Room memory room = rooms[idx];
            Hotel memory hotel = _getHotel(roomToHotel[room.code]);
            // Selected location and available date
            if (keccak256(hotel.location) == keccak256(location) && _isRoomAvailable(room.code, startDate, endDate, visitors)) {
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

    function _getHotel(uint hotelId) private view returns (Hotel) {
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

        return hotel;
    }

    function createHotel(string name, string description, string location, uint rating, uint reviews) external returns (uint) {
        uint hotelCode = ++HOTEL_ID;
        Hotel memory hotel = Hotel(hotelCode, name, description, location, rating, reviews);
        hotels.push(hotel);

        hotelRoomsCount[hotelCode] = 0;

        emit HotelCreated(hotelCode, name, description, location, rating, reviews);

        return hotelCode;
    }

    function hotelDetail(uint hotelId) external view returns (uint code, string name, string description, string location, uint rating, uint reviews) {
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

        return (hotel.code, hotel.name, hotel.description, hotel.location, hotel.rating, hotel.reviews);
    }

    function allHotels() external view returns (uint[]) {
        uint[] memory result = new uint[](hotels.length);
        for (uint index = 0; index < hotels.length; index++) {
            result[index] = hotels[index].code;
        }
        return result;
    }
}
