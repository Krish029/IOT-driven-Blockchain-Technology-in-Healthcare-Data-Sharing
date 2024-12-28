// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IoTHealthChain {
    struct Stakeholder {
        string name;
        string role; // Patient, Doctor, Hospital, Pathology, Pharma
        address[] authorizedEntities;
        mapping(address => bool) permissions;
    }

    struct Device {
        string deviceId;
        string ipfsHash;
        address owner;
    }

    struct HealthData {
        string dataHash;
        string description;
        address uploader;
        uint256 timestamp;
    }

    mapping(address => Stakeholder) public stakeholders;
    mapping(string => Device) public devices;
    mapping(address => HealthData[]) public healthRecords;

    event StakeholderRegistered(address indexed stakeholder, string name, string role);
    event DeviceRegistered(string deviceId, address indexed owner);
    event DataUploaded(address indexed uploader, string dataHash, string description);
    event AccessGranted(address indexed owner, address indexed entity);
    event AccessRevoked(address indexed owner, address indexed entity);

    modifier onlyOwner(address _owner) {
        require(msg.sender == _owner, "Not authorized");
        _;
    }

    modifier onlyRegistered() {
        require(bytes(stakeholders[msg.sender].name).length > 0, "Not registered");
        _;
    }

    /// @dev Register a stakeholder (Patient, Doctor, Hospital, etc.)
    function registerStakeholder(string memory _name, string memory _role) public {
        require(bytes(stakeholders[msg.sender].name).length == 0, "Already registered");
        stakeholders[msg.sender] = Stakeholder({
            name: _name,
            role: _role,
            authorizedEntities: new address     });
        emit StakeholderRegistered(msg.sender, _name, _role);
    }

    /// @dev Register an IoT device and associate it with an owner
    function registerDevice(string memory _deviceId, string memory _ipfsHash) public onlyRegistered {
        require(bytes(devices[_deviceId].deviceId).length == 0, "Device already registered");
        devices[_deviceId] = Device({
            deviceId: _deviceId,
            ipfsHash: _ipfsHash,
            owner: msg.sender
        });
        emit DeviceRegistered(_deviceId, msg.sender);
    }

    /// @dev Upload health data to IPFS and link it with the sender
    function uploadData(string memory _dataHash, string memory _description) public onlyRegistered {
        healthRecords[msg.sender].push(HealthData({
            dataHash: _dataHash,
            description: _description,
            uploader: msg.sender,
            timestamp: block.timestamp
        }));
        emit DataUploaded(msg.sender, _dataHash, _description);
    }

    /// @dev Grant access to another entity
    function grantAccess(address _entity) public onlyRegistered {
        Stakeholder storage owner = stakeholders[msg.sender];
        require(!owner.permissions[_entity], "Access already granted");
        owner.permissions[_entity] = true;
        owner.authorizedEntities.push(_entity);
        emit AccessGranted(msg.sender, _entity);
    }

    /// @dev Revoke access from an entity
    function revokeAccess(address _entity) public onlyRegistered {
        Stakeholder storage owner = stakeholders[msg.sender];
        require(owner.permissions[_entity], "Access not granted");
        owner.permissions[_entity] = false;

        for (uint256 i = 0; i < owner.authorizedEntities.length; i++) {
            if (owner.authorizedEntities[i] == _entity) {
                owner.authorizedEntities[i] = owner.authorizedEntities[owner.authorizedEntities.length - 1];
                owner.authorizedEntities.pop();
                break;
            }
        }
        emit AccessRevoked(msg.sender, _entity);
    }

    /// @dev Check if an entity has access to the data
    function hasAccess(address _owner, address _entity) public view returns (bool) {
        return stakeholders[_owner].permissions[_entity];
    }

    /// @dev Retrieve data hashes for an entity (if access is granted)
    function getHealthRecords(address _owner) public view returns (HealthData[] memory) {
        require(
            msg.sender == _owner || stakeholders[_owner].permissions[msg.sender],
            "Access denied"
        );
        return healthRecords[_owner];
    }

    /// @dev List authorized entities for a stakeholder
    function getAuthorizedEntities(address _owner) public view returns (address[] memory) {
        require(msg.sender == _owner, "Not authorized to view this information");
        return stakeholders[_owner].authorizedEntities;
    }
}
