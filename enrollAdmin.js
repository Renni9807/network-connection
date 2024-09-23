// enrollAdmin.js
const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function main() {
  try {
    // 연결 프로파일 로드
    const ccpPath = path.resolve(__dirname, "connection.json");
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // CA 클라이언트 생성
    const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // 지갑 로드
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // 관리자 존재 여부 확인
    const identity = await wallet.get("admin");
    if (identity) {
      console.log("이미 관리자가 등록되어 있습니다.");
      return;
    }

    // 관리자 등록
    const enrollment = await ca.enroll({
      enrollmentID: "admin",
      enrollmentSecret: "adminpw",
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org1MSP",
      type: "X.509",
    };
    await wallet.put("admin", x509Identity);
    console.log("Admin has been successfully registered in the wallet.");
  } catch (error) {
    console.error(`Failed to enroll admin user "admin": ${error}`);
    process.exit(1);
  }
}

main();
