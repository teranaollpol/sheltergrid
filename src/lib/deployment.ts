export const contractAddress =
  "0xA748CB9228f17549838E02E0Eb5ee9cFeDcA0938" as `0x${string}` | "";
export const explorerBaseUrl = "https://explorer-studio.genlayer.com";
export const contractExplorerUrl = contractAddress
  ? `${explorerBaseUrl}/address/${contractAddress}`
  : explorerBaseUrl;
