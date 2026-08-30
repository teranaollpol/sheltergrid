"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";
import { appConfig } from "@/lib/config";
import { contractAddress } from "@/lib/deployment";
import type { ShelterBootstrap, TxState } from "@/lib/types";

export const protocolQueryKey = [appConfig.projectId, "bootstrap"] as const;
const readClient = createClient({ chain: studionet });

export class DeploymentPendingError extends Error {
  constructor() {
    super(`${appConfig.name} is awaiting its Studionet deployment.`);
    this.name = "DeploymentPendingError";
  }
}

export async function readProtocolBootstrap(): Promise<ShelterBootstrap> {
  if (!contractAddress) throw new DeploymentPendingError();
  const result = await readClient.readContract({
    address: contractAddress,
    functionName: "get_frontend_bootstrap",
    args: [],
    jsonSafeReturn: true,
  });
  return result as unknown as ShelterBootstrap;
}

type EthereumRequest = {
  method: string;
  params?: readonly unknown[] | object;
};

export function useProtocolTransaction() {
  const [state, setState] = useState<TxState>({ stage: "idle", action: "" });
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();
  const reset = useCallback(() => {
    setState({ stage: "idle", action: "" });
  }, []);

  const write = useCallback(
    async (action: string, functionName: string, args: unknown[]) => {
      if (!contractAddress) {
        const error = "Studionet deployment is pending.";
        setState({ stage: "failed", action, error });
        throw new DeploymentPendingError();
      }
      if (!address || !walletClient) {
        const error = "Connect a wallet before sending this action.";
        setState({ stage: "failed", action, error });
        throw new Error(error);
      }
      try {
        if (chainId !== 61999) {
          setState({ stage: "wallet", action });
          await switchChainAsync({ chainId: 61999 });
        }
        const provider = {
          request: ({ method, params }: EthereumRequest) =>
            walletClient.request({
              method: method as never,
              params: params as never,
            }),
        };
        const writeClient = createClient({
          chain: studionet,
          account: address,
          provider: provider as never,
        });
        setState({ stage: "wallet", action });
        const hash = await writeClient.writeContract({
          address: contractAddress,
          functionName,
          args: args as never[],
          value: BigInt(0),
        });
        setState({ stage: "submitted", action, hash });
        setState({ stage: "finalizing", action, hash });
        const receipt = await readClient.waitForTransactionReceipt({
          hash,
          status: TransactionStatus.FINALIZED,
          interval: 3000,
          retries: 200,
        });
        const resultName =
          receipt.resultName ??
          (receipt as unknown as { result_name?: string }).result_name;
        if (resultName !== "MAJORITY_AGREE") {
          throw new Error(
            `Transaction finalized without state approval (${resultName || "unknown"}).`,
          );
        }
        setState({ stage: "finalized", action, hash });
        await queryClient.invalidateQueries({ queryKey: protocolQueryKey });
        return hash;
      } catch (cause) {
        const error =
          cause instanceof Error ? cause.message : "Transaction did not complete.";
        setState((current) => ({
          stage: "failed",
          action,
          hash: current.hash,
          error,
        }));
        throw cause;
      }
    },
    [address, chainId, queryClient, switchChainAsync, walletClient],
  );
  return { state, write, reset, ready: Boolean(contractAddress) };
}

export { useProtocolTransaction as useContractWrite };
