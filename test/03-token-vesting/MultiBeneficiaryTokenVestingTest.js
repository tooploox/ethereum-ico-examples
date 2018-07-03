const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const { expect } = chai;

const MultiBeneficiaryTokenVesting = artifacts.require("./03-token-vesting/MultiBeneficiaryTokenVesting.sol");

contract("MultiBeneficiaryTokenVesting", async (accounts) => {
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
