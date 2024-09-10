require("dotenv").config();

const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

async function test() {
  const move = new cli.Move();

  await move.test({
    packageDirectoryPath: "move/contract",
    namedAddresses: {
      panana: "0x100",
    },
  });
}
test();
