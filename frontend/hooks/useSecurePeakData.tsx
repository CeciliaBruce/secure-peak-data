"use client";

import { ethers } from "ethers";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { ConsumptionRecord } from "@/components/DataGrid";
import { ConsumptionDataPoint } from "@/components/ConsumptionGraph";

// Import generated ABI and addresses
import { SecurePeakDataAddresses } from "@/abi/SecurePeakDataAddresses";
import { SecurePeakDataABI } from "@/abi/SecurePeakDataABI";

type SecurePeakDataInfoType = {
  abi: typeof SecurePeakDataABI.abi;
  address?: `0x${string}`;
  chainId?: number;
  chainName?: string;
};

/**
 * Resolves SecurePeakData contract metadata for the given EVM `chainId`.
 */
function getSecurePeakDataByChainId(
  chainId: number | undefined
): SecurePeakDataInfoType {
  if (!chainId) {
    return { abi: SecurePeakDataABI.abi };
  }

  const entry =
    SecurePeakDataAddresses[
      chainId.toString() as keyof typeof SecurePeakDataAddresses
    ];

  if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
    return { abi: SecurePeakDataABI.abi, chainId };
  }

  return {
    address: entry?.address as `0x${string}` | undefined,
    chainId: entry?.chainId ?? chainId,
    chainName: entry?.chainName,
    abi: SecurePeakDataABI.abi,
  };
}

export const useSecurePeakData = (parameters: {
  instance: FhevmInstance | undefined;
  fhevmDecryptionSignatureStorage: GenericStringStorage;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: RefObject<
    (ethersSigner: ethers.JsonRpcSigner | undefined) => boolean
  >;
}) => {
  const {
    instance,
    fhevmDecryptionSignatureStorage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  } = parameters;

  // State
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [graphData, setGraphData] = useState<ConsumptionDataPoint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [message, setMessage] = useState("");

  const contractRef = useRef<SecurePeakDataInfoType | undefined>(undefined);
  const isRefreshingRef = useRef(false);
  const isCreatingRef = useRef(false);
  const isDecryptingRef = useRef(false);

  // Contract info
  const contractInfo = useMemo(() => {
    const c = getSecurePeakDataByChainId(chainId);
    contractRef.current = c;

    if (!c.address) {
      setMessage(`SecurePeakData deployment not found for chainId=${chainId}.`);
    }

    return c;
  }, [chainId]);

  const isDeployed = useMemo(() => {
    if (!contractInfo) return undefined;
    return (
      Boolean(contractInfo.address) &&
      contractInfo.address !== ethers.ZeroAddress
    );
  }, [contractInfo]);

  // Refresh records from contract
  const refreshRecords = useCallback(async () => {
    if (isRefreshingRef.current) return;
    if (
      !contractRef.current?.address ||
      !contractRef.current?.chainId ||
      !ethersReadonlyProvider
    ) {
      setRecords([]);
      setGraphData([]);
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    const thisChainId = contractRef.current.chainId;
    const thisAddress = contractRef.current.address;

    try {
      const contract = new ethers.Contract(
        thisAddress,
        contractRef.current.abi,
        ethersReadonlyProvider
      );

      const recordCount = await contract.getRecordCount();
      const count = Number(recordCount);

      const newRecords: ConsumptionRecord[] = [];
      const newGraphData: ConsumptionDataPoint[] = [];

      for (let i = 0; i < count; i++) {
        const [timestamp, submitter, exists] =
          await contract.getRecordMetadata(i);

        if (exists && sameChain.current(thisChainId)) {
          const date = new Date(Number(timestamp) * 1000);
          const timeStr = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          const dateStr = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });

          newRecords.push({
            id: i,
            timestamp: dateStr,
            consumption: "******",
            peak: false,
            reason: "Encrypted data",
            encrypted: true,
            isDecrypted: false,
          });

          newGraphData.push({
            time: timeStr,
            consumption: 0,
            encrypted: true,
          });
        }
      }

      if (sameChain.current(thisChainId)) {
        setRecords(newRecords);
        setGraphData(newGraphData);
      }
    } catch (e) {
      setMessage("Failed to fetch records: " + e);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [ethersReadonlyProvider, sameChain]);

  // Auto refresh on mount and chain change
  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  // Create new record
  const createRecord = useCallback(
    async (consumption: number, isPeak: boolean) => {
      if (isCreatingRef.current) return;
      if (!contractInfo.address || !instance || !ethersSigner) {
        throw new Error("Contract or signer not available");
      }

      isCreatingRef.current = true;
      setIsCreating(true);
      setMessage("Creating encrypted record...");

      const thisChainId = chainId;
      const thisAddress = contractInfo.address;
      const thisEthersSigner = ethersSigner;

      try {
        // Let browser repaint
        await new Promise((resolve) => setTimeout(resolve, 100));

        const isStale = () =>
          thisAddress !== contractRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        // Encrypt consumption value
        const consumptionInput = instance.createEncryptedInput(
          thisAddress,
          thisEthersSigner.address
        );
        consumptionInput.add32(consumption);
        const encConsumption = await consumptionInput.encrypt();

        if (isStale()) {
          setMessage("Operation cancelled - context changed");
          return;
        }

        // Encrypt isPeak value (1 = true, 0 = false)
        const isPeakInput = instance.createEncryptedInput(
          thisAddress,
          thisEthersSigner.address
        );
        isPeakInput.add32(isPeak ? 1 : 0);
        const encIsPeak = await isPeakInput.encrypt();

        if (isStale()) {
          setMessage("Operation cancelled - context changed");
          return;
        }

        setMessage("Sending transaction...");

        const contract = new ethers.Contract(
          thisAddress,
          contractInfo.abi,
          thisEthersSigner
        );

        const tx = await contract.createRecord(
          encConsumption.handles[0],
          encConsumption.inputProof,
          encIsPeak.handles[0],
          encIsPeak.inputProof
        );

        setMessage(`Waiting for tx: ${tx.hash}...`);
        const receipt = await tx.wait();

        setMessage(`Record created! Status: ${receipt?.status}`);

        if (!isStale()) {
          await refreshRecords();
        }
      } catch (e) {
        setMessage("Failed to create record: " + e);
        throw e;
      } finally {
        isCreatingRef.current = false;
        setIsCreating(false);
      }
    },
    [
      contractInfo,
      instance,
      ethersSigner,
      chainId,
      sameChain,
      sameSigner,
      refreshRecords,
    ]
  );

  // Decrypt a record
  const decryptRecord = useCallback(
    async (recordId: number) => {
      if (isDecryptingRef.current) return;
      if (!contractInfo.address || !instance || !ethersSigner) {
        throw new Error("Contract or signer not available");
      }

      isDecryptingRef.current = true;
      setIsDecrypting(true);
      setMessage("Decrypting record...");

      const thisChainId = chainId;
      const thisAddress = contractInfo.address;
      const thisEthersSigner = ethersSigner;

      try {
        const isStale = () =>
          thisAddress !== contractRef.current?.address ||
          !sameChain.current(thisChainId) ||
          !sameSigner.current(thisEthersSigner);

        // Get decryption signature
        const sig = await FhevmDecryptionSignature.loadOrSign(
          instance,
          [thisAddress],
          ethersSigner,
          fhevmDecryptionSignatureStorage
        );

        if (!sig) {
          setMessage("Unable to build FHEVM decryption signature");
          return;
        }

        if (isStale()) {
          setMessage("Operation cancelled - context changed");
          return;
        }

        const contract = new ethers.Contract(
          thisAddress,
          contractInfo.abi,
          ethersReadonlyProvider
        );

        // Get encrypted handles
        const consumptionHandle = await contract.getRecordConsumption(recordId);
        const isPeakHandle = await contract.getRecordIsPeak(recordId);

        if (isStale()) {
          setMessage("Operation cancelled - context changed");
          return;
        }

        setMessage("Decrypting values...");

        // Decrypt consumption
        const decryptedValues = await instance.userDecrypt(
          [{ handle: consumptionHandle, contractAddress: thisAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const decryptedConsumption = decryptedValues[consumptionHandle];

        // Decrypt isPeak
        const decryptedPeakValues = await instance.userDecrypt(
          [{ handle: isPeakHandle, contractAddress: thisAddress }],
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        const decryptedIsPeak = decryptedPeakValues[isPeakHandle];

        if (isStale()) {
          setMessage("Operation cancelled - context changed");
          return;
        }

        // Update records with decrypted values
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId
              ? {
                  ...r,
                  consumption: Number(decryptedConsumption),
                  peak: Boolean(decryptedIsPeak),
                  reason: "Decrypted data",
                  isDecrypted: true,
                }
              : r
          )
        );

        // Update graph data
        setGraphData((prev) =>
          prev.map((g, idx) =>
            idx === recordId
              ? {
                  ...g,
                  consumption: Number(decryptedConsumption),
                }
              : g
          )
        );

        setMessage("Record decrypted successfully!");
      } catch (e) {
        setMessage("Failed to decrypt record: " + e);
        throw e;
      } finally {
        isDecryptingRef.current = false;
        setIsDecrypting(false);
      }
    },
    [
      contractInfo,
      instance,
      ethersSigner,
      ethersReadonlyProvider,
      chainId,
      sameChain,
      sameSigner,
      fhevmDecryptionSignatureStorage,
    ]
  );

  return {
    contractAddress: contractInfo.address,
    records,
    graphData,
    isDeployed,
    isRefreshing,
    isCreating,
    isDecrypting,
    message,
    refreshRecords,
    createRecord,
    decryptRecord,
  };
};
