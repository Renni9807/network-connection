// fabricNetwork.js
const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function connectToNetwork() {
  // 연결 프로파일 로드
  const ccpPath = path.resolve(__dirname, "connection.json");
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

  // 지갑 로드
  const walletPath = path.join(process.cwd(), "wallet");
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // 사용자 확인
  const identity = await wallet.get("AppUser");
  if (!identity) {
    console.log("Cannot find the wallet, register first");
    return;
  }

  // 게이트웨이 연결
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: "AppUser",
    discovery: { enabled: true, asLocalhost: true },
  });

  // 네트워크 및 스마트 컨트랙트 접근
  const network = await gateway.getNetwork("mychannel");
  const contract = network.getContract("mychaincode");

  return { contract, gateway };
}

module.exports = { connectToNetwork };
