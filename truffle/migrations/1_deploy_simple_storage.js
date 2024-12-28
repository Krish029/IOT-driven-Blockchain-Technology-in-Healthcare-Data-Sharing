const HealthDataSharing = artifacts.require("HealthDataSharing");

module.exports = function (deployer) {
  deployer.deploy(HealthDataSharing);
};
