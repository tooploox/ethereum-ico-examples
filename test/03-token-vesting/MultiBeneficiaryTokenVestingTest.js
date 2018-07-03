const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const { expect } = chai;

const MultiBeneficiaryTokenVesting = artifacts.require("MultiBeneficiaryTokenVesting");

contract("MultiBeneficiaryTokenVesting", (accounts) => {
  const [owner] = accounts;

  let tokenVesting;

  before(async () => {
    tokenVesting = await MultiBeneficiaryTokenVesting.deployed();
  });

  describe("implements Ownable", () => {
    it("sets owner on deploy", async () => {
      expect(await tokenVesting.owner()).to.equal(owner);
    });
  });
});
