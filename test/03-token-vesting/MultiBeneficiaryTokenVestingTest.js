const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const increaseTime = require("../support/time-travel");

const now = () => web3.eth.getBlock(web3.eth.blockNumber).timestamp;
const day = 24 * 60 * 60;

chai.use(chaiAsPromised);
const { expect } = chai;

const MultiBeneficiaryTokenVesting = artifacts.require("MultiBeneficiaryTokenVesting");
const SimpleToken = artifacts.require("SimpleToken");

const beneficiary1 = "0x7319879Eb04477e39c2dbaA846470FEb7b2966e1";
const beneficiary2 = "0x9e9Bf5E5D100f45a3527c7eacC84E0a185fc7E0D";
const beneficiary3 = "0xc63f73cdf9dd2d0aafc63d650d637a848f469a89";

contract("MultiBeneficiaryTokenVesting", (accounts) => {
  const [owner, other] = accounts;

  let token;
  let tokenVesting;
  let vestingSettings;
  let tokenSettings;

  async function balanceOf(address) {
    return Math.round(web3.fromWei(await token.balanceOf(address), "ether").toNumber());
  }

  beforeEach(async () => {
    vestingSettings = {
      start: now(),
      cliff: 30 * day,
      duration: 3 * 30 * day,
    };

    tokenSettings = {
      name: "Tooploox",
      symbol: "TPX",
      decimals: 18,
      amount: 900000,
    };

    await SimpleToken.new(
      tokenSettings.name,
      tokenSettings.symbol,
      tokenSettings.decimals,
      tokenSettings.amount,
    ).then((instance) => {
      token = instance;
    });

    await MultiBeneficiaryTokenVesting.new(
      token.address,
      vestingSettings.start,
      vestingSettings.cliff,
      vestingSettings.duration,
    ).then((instance) => {
      tokenVesting = instance;
    });

    await token.transfer(tokenVesting.address, await token.balanceOf(owner));
  });

  describe("Ownable implementation", () => {
    it("sets owner on deploy", async () => {
      expect(await tokenVesting.owner()).to.equal(owner);
    });
  });

  describe("releasing tokens", () => {
    it("allows a beneficiary to release tokens", async () => {
      expect(tokenVesting.releaseAllTokens).not.to.throw();
    });

    it("disallows others to release tokens", async () => {
      tokenVesting.releaseAllTokens({ from: other }).then(assert.fail).catch((error) => {
        if (error.toString().indexOf("transaction: revert") === -1) {
          assert(false, error.toString());
        }
      });
    });
  });

  describe("releasing tokens in time", () => {
    beforeEach(async () => {
      await tokenVesting.addBeneficiary(beneficiary1, 1);
    });

    it("doesn't release tokens before cliff", async () => {
      increaseTime(29 * day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(0);

      increaseTime(day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(300000);
    });

    it("releases all tokens after at the end", async () => {
      increaseTime(90 * day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(900000);

      increaseTime(300 * day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(900000);
    });

    it("releases tokens progressively", async () => {
      increaseTime(30 * day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(300000);

      increaseTime(10 * day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(400000);

      increaseTime(10 * day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(500000);

      increaseTime(10 * day);
      await tokenVesting.releaseAllTokens();
      expect((await balanceOf(beneficiary1))).to.equal(600000);
    });
  });

  describe("releasing tokens between beneficiaries", () => {
    describe("when ratio is 1/1", () => {
      it("releases tokens having regard shares ratio", async () => {
        await tokenVesting.addBeneficiary(beneficiary1, 1);
        await tokenVesting.addBeneficiary(beneficiary2, 1);

        increaseTime(90 * day);
        await tokenVesting.releaseAllTokens();
        expect((await balanceOf(beneficiary1))).to.equal(450000);
        expect((await balanceOf(beneficiary2))).to.equal(450000);
      });
    });

    describe("when ratio is 1/1/1", () => {
      it("releases tokens having regard shares ratio", async () => {
        await tokenVesting.addBeneficiary(beneficiary1, 1);
        await tokenVesting.addBeneficiary(beneficiary2, 1);
        await tokenVesting.addBeneficiary(beneficiary3, 1);

        increaseTime(90 * day);
        await tokenVesting.releaseAllTokens();
        expect((await balanceOf(beneficiary1))).to.equal(300000);
        expect((await balanceOf(beneficiary2))).to.equal(300000);
        expect((await balanceOf(beneficiary3))).to.equal(300000);
      });
    });

    describe("when ratio is 6/1/2", () => {
      it("releases tokens having regard shares ratio", async () => {
        await tokenVesting.addBeneficiary(beneficiary1, 6);
        await tokenVesting.addBeneficiary(beneficiary2, 1);
        await tokenVesting.addBeneficiary(beneficiary3, 2);

        increaseTime(90 * day);
        await tokenVesting.releaseAllTokens();
        expect((await balanceOf(beneficiary1))).to.equal(600000);
        expect((await balanceOf(beneficiary2))).to.equal(100000);
        expect((await balanceOf(beneficiary3))).to.equal(200000);
      });
    });

    describe("when ratio is 60/10/20", () => {
      it("releases tokens having regard shares ratio", async () => {
        await tokenVesting.addBeneficiary(beneficiary1, 60);
        await tokenVesting.addBeneficiary(beneficiary2, 10);
        await tokenVesting.addBeneficiary(beneficiary3, 20);

        increaseTime(90 * day);
        await tokenVesting.releaseAllTokens();
        expect((await balanceOf(beneficiary1))).to.equal(600000);
        expect((await balanceOf(beneficiary2))).to.equal(100000);
        expect((await balanceOf(beneficiary3))).to.equal(200000);
      });
    });

    describe("when a beneficiary is added during the vesting time", () => {
      it("releases tokens having regard shares ratio", async () => {
        await tokenVesting.addBeneficiary(beneficiary1, 1);
        await tokenVesting.addBeneficiary(beneficiary2, 1);

        increaseTime(30 * day);
        await tokenVesting.releaseAllTokens();
        expect((await balanceOf(beneficiary1))).to.equal(150000);
        expect((await balanceOf(beneficiary2))).to.equal(150000);

        await tokenVesting.addBeneficiary(beneficiary3, 1);
        increaseTime(60 * day);
        await tokenVesting.releaseAllTokens();
        expect((await balanceOf(beneficiary1))).to.equal(350000);
        expect((await balanceOf(beneficiary2))).to.equal(350000);
        expect((await balanceOf(beneficiary3))).to.equal(200000);
      });
    });
  });
});
