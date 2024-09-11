require("dotenv").config();
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

const profileName = `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`;

async function publish() {

  const moduleAddress = process.env.AUTOMATED_SET_MODULE_ADDRESS;
  // Check VITE_MODULE_ADDRESS is set
  if (!moduleAddress) {
    throw new Error(
      "AUTOMATED_SET_MODULE_ADDRESS variable is not set, make sure you have published the module before upgrading it",
    );
  }

  // const aptosConfig = new aptosSDK.AptosConfig({ network: process.env.NEXT_PUBLIC_APP_NETWORK })
  // const aptos = new aptosSDK.Aptos(aptosConfig)

  // // Make sure VITE_COLLECTION_CREATOR_ADDRESS is set
  // if (!process.env.VITE_COLLECTION_CREATOR_ADDRESS) {
  //   throw new Error("VITE_COLLECTION_CREATOR_ADDRESS variable is not set, make sure you set it on the .env file");
  // }

  // // Make sure VITE_COLLECTION_CREATOR_ADDRESS exists
  // try {
  //   await aptos.getAccountInfo({ accountAddress: process.env.VITE_COLLECTION_CREATOR_ADDRESS });
  // } catch (error) {
  //   throw new Error(
  //     "Account does not exist. Make sure you have set up the correct address as the VITE_COLLECTION_CREATOR_ADDRESS in the .env file",
  //   );
  // }

  const move = new cli.Move();

  move.upgradeObjectPackage({
    packageDirectoryPath: "move/contract",
    objectAddress: moduleAddress,
    namedAddresses: {
      panana: moduleAddress,
    },
    profile: profileName,
  });
}
publish();
