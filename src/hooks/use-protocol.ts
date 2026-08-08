"use client";

import { useQuery } from "@tanstack/react-query";
import { protocolQueryKey, readProtocolBootstrap } from "@/lib/genlayer";

export function useProtocol() {
  return useQuery({
    queryKey: protocolQueryKey,
    queryFn: readProtocolBootstrap,
    refetchInterval: 30_000,
  });
}
