import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { SecurePeakData, SecurePeakData__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("SecurePeakData")) as SecurePeakData__factory;
  const securePeakDataContract = (await factory.deploy()) as SecurePeakData;
  const securePeakDataContractAddress = await securePeakDataContract.getAddress();

  return { securePeakDataContract, securePeakDataContractAddress };
}

describe("SecurePeakData", function () {
  let signers: Signers;
  let securePeakDataContract: SecurePeakData;
  let securePeakDataContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ securePeakDataContract, securePeakDataContractAddress } = await deployFixture());
  });

  it("should have zero records after deployment", async function () {
    const recordCount = await securePeakDataContract.getRecordCount();
    expect(recordCount).to.eq(0);
  });

  it("should create a new encrypted record", async function () {
    // Encrypt consumption value (e.g., 920 kWh)
    const clearConsumption = 920;
    const encryptedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearConsumption)
      .encrypt();

    // Encrypt isPeak value (1 = true)
    const clearIsPeak = 1;
    const encryptedIsPeak = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearIsPeak)
      .encrypt();

    // Create record
    const tx = await securePeakDataContract
      .connect(signers.alice)
      .createRecord(
        encryptedConsumption.handles[0],
        encryptedConsumption.inputProof,
        encryptedIsPeak.handles[0],
        encryptedIsPeak.inputProof
      );
    await tx.wait();

    // Verify record count increased
    const recordCount = await securePeakDataContract.getRecordCount();
    expect(recordCount).to.eq(1);

    // Verify record metadata
    const [timestamp, submitter, exists] = await securePeakDataContract.getRecordMetadata(0);
    expect(exists).to.be.true;
    expect(submitter).to.eq(signers.alice.address);
    expect(timestamp).to.be.gt(0);

    // Verify user records
    const userRecords = await securePeakDataContract.getUserRecordIds(signers.alice.address);
    expect(userRecords.length).to.eq(1);
    expect(userRecords[0]).to.eq(0);
  });

  it("should decrypt consumption value after creation", async function () {
    // Create a record first
    const clearConsumption = 1100;
    const encryptedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearConsumption)
      .encrypt();

    const clearIsPeak = 1;
    const encryptedIsPeak = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearIsPeak)
      .encrypt();

    const tx = await securePeakDataContract
      .connect(signers.alice)
      .createRecord(
        encryptedConsumption.handles[0],
        encryptedConsumption.inputProof,
        encryptedIsPeak.handles[0],
        encryptedIsPeak.inputProof
      );
    await tx.wait();

    // Get encrypted consumption handle
    const encryptedConsumptionHandle = await securePeakDataContract.getRecordConsumption(0);

    // Decrypt the consumption value
    const decryptedConsumption = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedConsumptionHandle,
      securePeakDataContractAddress,
      signers.alice
    );

    expect(decryptedConsumption).to.eq(clearConsumption);
  });

  it("should decrypt isPeak value after creation", async function () {
    // Create a record with isPeak = true
    const clearConsumption = 850;
    const encryptedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearConsumption)
      .encrypt();

    const clearIsPeak = 1; // true
    const encryptedIsPeak = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearIsPeak)
      .encrypt();

    const tx = await securePeakDataContract
      .connect(signers.alice)
      .createRecord(
        encryptedConsumption.handles[0],
        encryptedConsumption.inputProof,
        encryptedIsPeak.handles[0],
        encryptedIsPeak.inputProof
      );
    await tx.wait();

    // Get encrypted isPeak handle
    const encryptedIsPeakHandle = await securePeakDataContract.getRecordIsPeak(0);

    // Decrypt the isPeak value
    const decryptedIsPeak = await fhevm.userDecryptEbool(
      encryptedIsPeakHandle,
      securePeakDataContractAddress,
      signers.alice
    );

    expect(decryptedIsPeak).to.be.true;
  });

  it("should update consumption value", async function () {
    // Create initial record
    const initialConsumption = 500;
    const encryptedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(initialConsumption)
      .encrypt();

    const clearIsPeak = 0;
    const encryptedIsPeak = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearIsPeak)
      .encrypt();

    let tx = await securePeakDataContract
      .connect(signers.alice)
      .createRecord(
        encryptedConsumption.handles[0],
        encryptedConsumption.inputProof,
        encryptedIsPeak.handles[0],
        encryptedIsPeak.inputProof
      );
    await tx.wait();

    // Update consumption
    const updatedConsumption = 750;
    const encryptedUpdatedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(updatedConsumption)
      .encrypt();

    tx = await securePeakDataContract
      .connect(signers.alice)
      .updateConsumption(
        0,
        encryptedUpdatedConsumption.handles[0],
        encryptedUpdatedConsumption.inputProof
      );
    await tx.wait();

    // Verify updated value
    const encryptedConsumptionHandle = await securePeakDataContract.getRecordConsumption(0);
    const decryptedConsumption = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedConsumptionHandle,
      securePeakDataContractAddress,
      signers.alice
    );

    expect(decryptedConsumption).to.eq(updatedConsumption);
  });

  it("should not allow non-submitter to update record", async function () {
    // Alice creates a record
    const clearConsumption = 600;
    const encryptedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearConsumption)
      .encrypt();

    const clearIsPeak = 0;
    const encryptedIsPeak = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(clearIsPeak)
      .encrypt();

    const tx = await securePeakDataContract
      .connect(signers.alice)
      .createRecord(
        encryptedConsumption.handles[0],
        encryptedConsumption.inputProof,
        encryptedIsPeak.handles[0],
        encryptedIsPeak.inputProof
      );
    await tx.wait();

    // Bob tries to update Alice's record
    const updatedConsumption = 999;
    const encryptedUpdatedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.bob.address)
      .add32(updatedConsumption)
      .encrypt();

    await expect(
      securePeakDataContract
        .connect(signers.bob)
        .updateConsumption(
          0,
          encryptedUpdatedConsumption.handles[0],
          encryptedUpdatedConsumption.inputProof
        )
    ).to.be.revertedWith("Only submitter can update");
  });

  it("should create multiple records for same user", async function () {
    // Create first record
    let encryptedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(400)
      .encrypt();

    let encryptedIsPeak = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(0)
      .encrypt();

    let tx = await securePeakDataContract
      .connect(signers.alice)
      .createRecord(
        encryptedConsumption.handles[0],
        encryptedConsumption.inputProof,
        encryptedIsPeak.handles[0],
        encryptedIsPeak.inputProof
      );
    await tx.wait();

    // Create second record
    encryptedConsumption = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(1200)
      .encrypt();

    encryptedIsPeak = await fhevm
      .createEncryptedInput(securePeakDataContractAddress, signers.alice.address)
      .add32(1)
      .encrypt();

    tx = await securePeakDataContract
      .connect(signers.alice)
      .createRecord(
        encryptedConsumption.handles[0],
        encryptedConsumption.inputProof,
        encryptedIsPeak.handles[0],
        encryptedIsPeak.inputProof
      );
    await tx.wait();

    // Verify record count
    const recordCount = await securePeakDataContract.getRecordCount();
    expect(recordCount).to.eq(2);

    // Verify user records
    const userRecords = await securePeakDataContract.getUserRecordIds(signers.alice.address);
    expect(userRecords.length).to.eq(2);
    expect(userRecords[0]).to.eq(0);
    expect(userRecords[1]).to.eq(1);
  });
});
