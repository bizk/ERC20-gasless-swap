export interface Token {
  symbol: string;
  name: string;
  icon: string;
  address: string;
  decimals: number;
  price: number;
}

export const tokens: Token[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    decimals: 18,
    price: 2245.50,
  },
  // {
  //   symbol: "USDC",
  //   name: "USD Coin",
  //   icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg",
  //   address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  //   decimals: 6,
  //   price: 1.00,
  // },
  // {
  //   symbol: "USDT",
  //   name: "Tether",
  //   icon: "https://cryptologos.cc/logos/tether-usdt-logo.svg",
  //   address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  //   decimals: 6,
  //   price: 1.00,
  // },
  // {
  //   symbol: "WBTC",
  //   name: "Wrapped Bitcoin",
  //   icon: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg",
  //   address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  //   decimals: 8,
  //   price: 43250.00,
  // },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    icon: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    price: 1.00,
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    icon: "https://cryptologos.cc/logos/chainlink-link-logo.svg",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    decimals: 18,
    price: 14.85,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    icon: "https://cryptologos.cc/logos/uniswap-uni-logo.svg",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: 18,
    price: 6.42,
  },
  {
    symbol: "AAVE",
    name: "Aave",
    icon: "https://cryptologos.cc/logos/aave-aave-logo.svg",
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    decimals: 18,
    price: 92.30,
  },
];
