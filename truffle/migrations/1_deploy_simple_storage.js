const fileStorage = artifacts.require("./fileStorage.sol");

module.exports = function (deployer) {
  deployer.deploy(fileStorage);
};
