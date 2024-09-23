const FabricCAServices = require("fabric-ca-client");
const { Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

async function main() {
  try {
    // Load connection profile
    const ccpPath = path.resolve(__dirname, "connection.json");
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Load wallet
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if the user already exists
    const userIdentity = await wallet.get("AppUser");
    if (userIdentity) {
      console.log("AppUser already registered");
      return;
    }

    // Check for the admin identity
    const adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      console.log(
        "Admin identity not found in the wallet. Please register the admin first."
      );
      return;
    }

    // Create a new CA client for interacting with the CA
    const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(
      caInfo.url,
      { trustedRoots: caTLSCACerts, verify: false },
      caInfo.caName
    );

    // Create the admin user context
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    // Register the user and enroll the certificate
    const secret = await ca.register(
      {
        affiliation: "org1.department1",
        enrollmentID: "AppUser",
        role: "client",
      },
      adminUser
    );
    const enrollment = await ca.enroll({
      enrollmentID: "AppUser",
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org1MSP",
      type: "X.509",
    };
    await wallet.put("AppUser", x509Identity);
    console.log(
      "AppUser has been successfully registered and enrolled in the wallet."
    );
  } catch (error) {
    console.error(`Failed to register user "AppUser": ${error}`);
    process.exit(1);
  }
}

main();
