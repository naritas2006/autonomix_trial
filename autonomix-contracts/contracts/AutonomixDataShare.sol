pragma solidity ^0.8.19;

contract AutonomixDataShare {
    struct Event {
        string vehicleId;
        string eventType;
        string ipfsHash;
        uint256 timestamp;
    }

    Event[] public events;

    event EventLogged(
        string vehicleId,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        string eventType,
        string ipfsHash,
        uint256 timestamp
    );

    // Log an event
    function logEvent(string memory _vehicleId, string memory _eventType, string memory _ipfsHash) public {
        Event memory newEvent = Event(_vehicleId, _eventType, _ipfsHash, block.timestamp);
        events.push(newEvent);
        emit EventLogged(_vehicleId, _eventType, _ipfsHash, block.timestamp);
    }

    // Failure scenario: try to fetch an invalid index
    function getEvent(uint index) public view returns (Event memory) {
        require(index < events.length, "Event does not exist");
        return events[index];
    }

    function totalEvents() public view returns (uint) {
        return events.length;
    }
}
