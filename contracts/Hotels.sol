pragma solidity ^0.4.0;

contract Hotels {

    // TODO: POC only supports a single user, use addresses for hotels / bookings on production
    // TODO: Split into smaller contracts as it's too big for the main network
    //       One possible way of doing this is to keep a master contract which invokes all of these.

    struct Booking {
        uint bookingDate;
        uint startDate;
        uint endDate;
        uint visitors;
    }

    struct Hotel {
        string name;
        string description;
        string location;
        uint rating;
        uint reviews;
    }

    struct Room {
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
    Booking[] public bookings;
    mapping(uint => uint) internal bookingToRoom;
    mapping(uint => uint) internal roomBookingsCount;

    Hotel[] public hotels;
    mapping(uint => uint) internal hotelRoomsCount;

    Room[] public rooms;
    mapping(uint => uint) internal roomToHotel;

    function _countAvailableRooms(string location, uint startDate, uint endDate, uint visitors) private view returns (uint) {
        uint counter = 0;
        for (uint idx = 0; idx < rooms.length; idx++) {
            Hotel memory hotel = hotels[roomToHotel[idx]];
            if (keccak256(hotel.location) == keccak256(location) && _isRoomAvailable(idx, startDate, endDate, visitors)) {
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
        Room memory room = rooms[roomId];
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
                if (bookingToRoom[idx] == roomId && _isInvalidRange(booking, startDate, endDate)) {
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
        uint bookingCode = bookings.length;
        uint date = now;
        Booking memory booking = Booking(date, startDate, endDate, visitors);
        bookings.push(booking);

        bookingToRoom[bookingCode] = roomCode;
        roomBookingsCount[roomCode]++;

        emit BookingCreated(bookingCode, date, startDate, endDate, visitors, bookingToRoom[bookingCode]);

        return bookingCode;
    }

    function roomBookings(uint roomId) external view returns (uint[]) {
        uint[] memory result = new uint[](roomBookingsCount[roomId]);
        // Iterate the existing rooms and allocate those belonging to this hotel
        uint counter = 0;
        for (uint idx = 0; idx < bookings.length; idx++) {
            if (bookingToRoom[idx] == roomId) {
                result[counter] = idx;
                counter++;
            }
        }
        return result;
    }

    function createRoom(uint hotelCode, string name, string description, string cancellation, uint beds, uint bathrooms, uint visitors, uint price) external returns (uint) {
        uint roomCode = rooms.length;
        Room memory room = Room(name, description, cancellation, beds, bathrooms, visitors, price);
        rooms.push(room);

        roomToHotel[roomCode] = hotelCode;
        roomBookingsCount[roomCode] = 0;
        hotelRoomsCount[hotelCode]++;

        emit RoomCreated(roomCode, name, description, cancellation, beds, bathrooms, visitors, price, roomToHotel[roomCode]);

        return roomCode;
    }

    function availableRooms(string location, uint startDate, uint endDate, uint visitors) external view returns (uint[]) {
        uint[] memory result = new uint[](_countAvailableRooms(location, startDate, endDate, visitors));
        uint counter = 0;
        for (uint idx = 0; idx < rooms.length; idx++) {
            Hotel memory hotel = hotels[roomToHotel[idx]];
            // Selected location and available date
            if (keccak256(hotel.location) == keccak256(location) && _isRoomAvailable(idx, startDate, endDate, visitors)) {
                result[counter] = idx;
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
            if (roomToHotel[idx] == hotelId) {
                result[counter] = idx;
                counter++;
            }
        }
        return result;
    }

    function createHotel(string name, string description, string location, uint rating, uint reviews) external returns (uint) {
        uint hotelCode = hotels.length;
        Hotel memory hotel = Hotel(name, description, location, rating, reviews);
        hotels.push(hotel);

        hotelRoomsCount[hotelCode] = 0;

        emit HotelCreated(hotelCode, name, description, location, rating, reviews);

        return hotelCode;
    }
}
