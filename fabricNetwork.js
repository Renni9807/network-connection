// fabricNetwork.js
const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function connectToNetwork() {
  // load the connection profile
  const ccpPath = path.resolve(__dirname, "connection.json");
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

  // load wallet
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // verify AppUser
  const identity = await wallet.get("AppUser");
  if (!identity) {
    console.log("Cannot find the wallet, register first");
    return;
  }

  // Gateway connection
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "AppUser",
    discovery: { enabled: true, asLocalhost: true },
  });

  // network and contract access
  const network = await gateway.getNetwork("mychannel");
  const contract = network.getContract("mychaincode");

  return { contract, gateway };
}

module.exports = { connectToNetwork };
