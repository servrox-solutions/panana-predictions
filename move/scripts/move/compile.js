require("dotenv").config();

const fs = require("node:fs");
const yaml = require("js-yaml");
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const profile = `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`;
const accountAddress = config["profiles"][profile]["account"];

async function compile() {
  console.log(profile);

  // const aptosConfig = new aptosSDK.AptosConfig({ network: process.env.NEXT_PUBLIC_APP_NETWORK })
  // const aptos = new aptosSDK.Aptos(aptosConfig)

  // // Make sure VITE_COLLECTION_CREATOR_ADDRESS exists
  // try {
  //   await aptos.getAccountInfo({ accountAddress: process.env.VITE_COLLECTION_CREATOR_ADDRESS });
  // } catch (error) {
  //   throw new Error(
  //     "Account does not exist. Make sure you have set up the correct address as the VITE_COLLECTION_CREATOR_ADDRESS in the .env file",
  //   );
  // }


  const move = new cli.Move();
  await move.compile({
    packageDirectoryPath: "move/contract",
    namedAddresses: {
      owner: accountAddress,
      panana: accountAddress,
    },
    extraArguments: [],
    profile,
    // namedAddresses: {
    //   // Publish module to account address
    //   launchpad_addr: accountAddress,
    //   // This is the address you want to use to create collection with, e.g. an address in Petra so you can create collection in UI using Petra
    //   initial_creator_addr: process.env.NEXT_PUBLIC_COLLECTION_CREATOR_ADDRESS,
    // },
  });
}
compile();
