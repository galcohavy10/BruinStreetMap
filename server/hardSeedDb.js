const hardSetUp = require("./hardSetupDb");
const setup = require("./seedDb");

(async () => (await hardSetUp()) == true)()
  ? (async () => (await setup()) == true)()
  : null;
