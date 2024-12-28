import { useState } from "react";
import { useEth } from "./contexts/EthContext";
import "./styles.css";

function MainComp() {
  const { state: { contract, accounts } } = useEth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [stakeholder, setStakeholder] = useState({ name: "", role: "" });
  const [device, setDevice] = useState({ id: "", ipfsHash: "" });
  const [data, setData] = useState({ hash: "", description: "" });
  const [entityAddress, setEntityAddress] = useState("");
  const [patientAddress, setPatientAddress] = useState("");
  const [authorizedEntities, setAuthorizedEntities] = useState([]);

  const handleAction = async (action) => {
    try {
      switch (action) {
        case "registerStakeholder":
          await contract.methods
            .registerStakeholder(stakeholder.name, stakeholder.role)
            .send({ from: accounts[0] });
          alert("Stakeholder registered successfully!");
          break;
        case "registerDevice":
          await contract.methods
            .registerDevice(device.id, device.ipfsHash)
            .send({ from: accounts[0] });
          alert("Device registered successfully!");
          break;
        case "uploadData":
          await contract.methods
            .uploadData(data.hash, data.description)
            .send({ from: accounts[0] });
          alert("Health data uploaded successfully!");
          break;
        case "grantAccess":
          await contract.methods.grantAccess(entityAddress).send({ from: accounts[0] });
          alert("Access granted successfully!");
          break;
        case "revokeAccess":
          await contract.methods.revokeAccess(entityAddress).send({ from: accounts[0] });
          alert("Access revoked successfully!");
          break;
        case "retrieveData":
          const records = await contract.methods.getHealthRecords(patientAddress).call({ from: accounts[0] });
          alert(`Health Records: ${JSON.stringify(records)}`);
          break;
        case "getAuthorizedEntities":
          const entities = await contract.methods.getAuthorizedEntities(patientAddress).call({ from: accounts[0] });
          setAuthorizedEntities(entities);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
    }
  };

  return (
    <div className="app-container">
      <div className="menu">
        {!selectedOption ? (
          <div className="menu-options">
            <h1>Welcome to Health Data Care</h1>
            <ul>
              <li onClick={() => setSelectedOption("registerStakeholder")}>Get yourself registered</li>
              <li onClick={() => setSelectedOption("registerDevice")}>Register Device</li>
              <li onClick={() => setSelectedOption("uploadData")}>Upload Health Data</li>
              <li onClick={() => setSelectedOption("grantAccess")}>Grant Access</li>
              <li onClick={() => setSelectedOption("revokeAccess")}>Revoke Access</li>
              <li onClick={() => setSelectedOption("retrieveData")}>Retrieve Health Records</li>
              <li onClick={() => setSelectedOption("getAuthorizedEntities")}>View Authorized Entities</li>
            </ul>
          </div>
        ) : (
          <div className="form-card">
            <button className="back-button" onClick={() => setSelectedOption(null)}>Back</button>
            {selectedOption === "registerStakeholder" && (
              <>
                <h2>Get yourself registered</h2>
                <input
                  type="text"
                  placeholder="Name"
                  onChange={(e) => setStakeholder({ ...stakeholder, name: e.target.value })}
                />
                <select onChange={(e) => setStakeholder({ ...stakeholder, role: e.target.value })}>
                  <option value="">Select Role</option>
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Pharma">Pharma</option>
                </select>
                <button onClick={() => handleAction("registerStakeholder")}>Register</button>
              </>
            )}
            {selectedOption === "registerDevice" && (
              <>
                <h2>Register Device</h2>
                <input
                  type="text"
                  placeholder="Device ID"
                  onChange={(e) => setDevice({ ...device, id: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="IPFS Hash"
                  onChange={(e) => setDevice({ ...device, ipfsHash: e.target.value })}
                />
                <button onClick={() => handleAction("registerDevice")}>Register</button>
              </>
            )}
            {selectedOption === "uploadData" && (
              <>
                <h2>Upload Health Data</h2>
                <input
                  type="text"
                  placeholder="Data Hash"
                  onChange={(e) => setData({ ...data, hash: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                ></textarea>
                <button onClick={() => handleAction("uploadData")}>Upload</button>
              </>
            )}
            {selectedOption === "grantAccess" && (
              <>
                <h2>Grant Access</h2>
                <input
                  type="text"
                  placeholder="Entity Address"
                  onChange={(e) => setEntityAddress(e.target.value)}
                />
                <button onClick={() => handleAction("grantAccess")}>Grant Access</button>
              </>
            )}
            {selectedOption === "revokeAccess" && (
              <>
                <h2>Revoke Access</h2>
                <input
                  type="text"
                  placeholder="Entity Address"
                  onChange={(e) => setEntityAddress(e.target.value)}
                />
                <button onClick={() => handleAction("revokeAccess")}>Revoke Access</button>
              </>
            )}
            {selectedOption === "retrieveData" && (
              <>
                <h2>Retrieve Health Records</h2>
                <input
                  type="text"
                  placeholder="Patient Address"
                  onChange={(e) => setPatientAddress(e.target.value)}
                />
                <button onClick={() => handleAction("retrieveData")}>Retrieve</button>
              </>
            )}
            {selectedOption === "getAuthorizedEntities" && (
              <>
                <h2>View Authorized Entities</h2>
                <input
                  type="text"
                  placeholder="Patient Address"
                  onChange={(e) => setPatientAddress(e.target.value)}
                />
                <button onClick={() => handleAction("getAuthorizedEntities")}>Get Entities</button>
                <ul>
                  {authorizedEntities.map((entity, index) => (
                    <li key={index}>{entity}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComp;
