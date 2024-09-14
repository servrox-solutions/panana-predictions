require("dotenv").config();

const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");

async function test() {
  const move = new cli.Move();

  await move.test({
    packageDirectoryPath: "move/contract",
    namedAddresses: {
      owner: "0x100",
      panana: "0x123"
    },
    extraArguments: ['--compiler-version=2', '--language-version=2', '--coverage']
  });
}
test();
