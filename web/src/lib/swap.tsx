import { prepareUserOperationForErc20Paymaster } from "permissionless/experimental/pimlico";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { Chain, createPublicClient, Hex, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient, type SmartAccountClient } from "permissionless";
import { 
  Implementation, 
  toMetaMaskSmartAccount, 
} from "@metamask/smart-accounts-kit"

export async function buildSmartAccount(chain: Chain): Promise<SmartAccountClient | null> {
  // TODO si falla es es el chain Id
  console.log("Building smart account for chain", chain.id);
  const pimlicoUrl = `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${import.meta.env.VITE_PIMLICO_API_KEY}`

  const publicClient = createPublicClient({
    chain: chain,
    transport: http("https://1rpc.io/eth"),
  });

  const paymasterClient = createPimlicoClient({
    chain: chain,
    transport: http(pimlicoUrl),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const delegatorAccount = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY as Hex);

  const delegatorSmartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [delegatorAccount.address, [], [], []],
    deploySalt: "0x",
    signer: { account: delegatorAccount },
  })

  console.log("Smart account built for chain", chain.id, delegatorSmartAccount?.address);

  const smartAccountClient = createSmartAccountClient({
    account: delegatorSmartAccount,
    chain,
    paymaster: paymasterClient,
    bundlerTransport: http(
      pimlicoUrl,
    ),
    userOperation: {
      estimateFeesPerGas: async () =>
        (await paymasterClient.getUserOperationGasPrice()).fast,
      // prepareUserOperation: prepareUserOperationForErc20Paymaster(paymasterClient, {
      //   chain,
      //   token: ETH_TOKEN,
      // }),
    },
  });

  return smartAccountClient;
}

import { Token, ChainId, Ether } from '@uniswap/sdk-core'

export const ETH_NATIVE = Ether.onChain(ChainId.MAINNET)

export const ETH_TOKEN = new Token(
  ChainId.MAINNET,
  '0x0000000000000000000000000000000000000000',
  18,
  'ETH',
  'Ether'
)

export const USDC_TOKEN = new Token(
  ChainId.MAINNET,
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  6,
  'USDC',
  'USDC'
)

// uniswapV4SingleHop.ts
import { SwapExactInSingle, Actions, V4Planner } from '@uniswap/v4-sdk'
import { CommandType, RoutePlanner } from '@uniswap/universal-router-sdk'
import { Address, parseUnits, encodeFunctionData } from 'viem'

export type TokenConfig = {
  address: Address
  decimals: number
}

// Minimal config your app provides
export type SingleHopSwapConfig = {
  tokenIn: Token          // what user is selling
  tokenOut: Token         // what user is buying
  fee: number                   // e.g. 500
  tickSpacing: number           // e.g. 10
  hooks?: Address               // zero address if no hooks
  amountIn: string              // human-readable, e.g. "1.0"
  amountOutMin: bigint          // already computed from quote + slippage
  useNativeForIn?: boolean      // if true, you’ll send `value` in ETH
  // Optional: override deadline
  deadlineSecondsFromNow?: number
}

// Universal Router interface
export const UNIVERSAL_ROUTER_ABI = [
  {
    type: 'function',
    name: 'execute',
    stateMutability: 'payable',
    inputs: [
      { name: 'commands', type: 'bytes', internalType: 'bytes' },
      { name: 'inputs', type: 'bytes[]', internalType: 'bytes[]' },
      { name: 'deadline', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
  },
] as const

// Set chain (Linea, mainnet, etc.)
export const UNIVERSAL_ROUTER_ADDRESS = '0x66a9893cc07d91d95644aedd05d03f95e1dba8af' as Address

export function buildV4SingleHopSwap(config: SingleHopSwapConfig): {
  routerAddress: Address
  routerCalldataArgs: [Hex, Hex[], bigint] // (commands, inputs, deadline)
  value: bigint                             // (0n or amountIn)
} {
  const {
    tokenIn,
    tokenOut,
    fee,
    tickSpacing,
    hooks,
    amountIn,
    amountOutMin,
    useNativeForIn,
    deadlineSecondsFromNow = 60 * 10, // 10 min
  } = config

  console.log("# Build v4 single swap #")

  console.log("TOKEN IN", tokenIn)
  console.log("TOKEN OUT", tokenOut)
  console.log("FEE", fee)
  console.log("TICK SPACING", tickSpacing)
  console.log("HOOKS", hooks)
  console.log("AMOUNT IN", amountIn)
  console.log("AMOUNT OUT MIN", amountOutMin)
  console.log("USE NATIVE FOR IN", useNativeForIn)
  console.log("DEADLINE SECONDS FROM NOW", deadlineSecondsFromNow)

  // v4 poolKey follows the doc: currency0 < currency1 by address lexicographically.
  // BUT: docs’ example just hardcodes ETH as currency0; for a generic helper
  // you may want to sort addresses yourself. Here I assume *you* pass them in the right order
  // because your quoting uses the same poolKey.
  const poolKey: SwapExactInSingle['poolKey'] = {
    currency0: tokenIn.address,
    currency1: tokenOut.address,
    fee,
    tickSpacing,
    hooks: hooks ?? '0x0000000000000000000000000000000000000000',
  }

  const amountInWei = parseUnits(amountIn, tokenIn.decimals)

  const currentConfig: SwapExactInSingle = {
    poolKey,
    zeroForOne: true, // tokenIn → tokenOut (direction aligned with poolKey)
    amountIn: amountInWei.toString(),
    amountOutMinimum: amountOutMin.toString(),
    hookData: '0x00',
  }

  const deadline = BigInt(
    Math.floor(Date.now() / 1000) + deadlineSecondsFromNow,
  )

  const v4Planner = new V4Planner()
  const routePlanner = new RoutePlanner()

  v4Planner.addAction(Actions.SWAP_EXACT_IN_SINGLE, [currentConfig])

  v4Planner.addAction(Actions.SETTLE_ALL, [
    currentConfig.poolKey.currency0,
    currentConfig.amountIn,
  ])

  v4Planner.addAction(Actions.TAKE_ALL, [
    currentConfig.poolKey.currency1,
    currentConfig.amountOutMinimum,
  ])

  const encodedActions = v4Planner.finalize()

  routePlanner.addCommand(CommandType.V4_SWAP, [
    v4Planner.actions,
    v4Planner.params,
  ])

  const commands = routePlanner.commands as Hex
  const inputs = [encodedActions as Hex]

  const value = useNativeForIn ? amountInWei : 0n

  return {
    routerAddress: UNIVERSAL_ROUTER_ADDRESS, // To call
    routerCalldataArgs: [commands, inputs, deadline], // Call args
    value,
  }
}

export async function buildGaslessUniswapCall(tokenIn: Token, tokenOut: Token, amountIn: string) {
  const {
    routerAddress,
    routerCalldataArgs,
    value,
  } = buildV4SingleHopSwap({
    tokenIn,
    tokenOut,
    fee: 100,
    tickSpacing: 10,
    hooks: undefined,            // or your hook address
    amountIn: amountIn,               // 1 tokenIn
    amountOutMin: 0n,       // from quote w/ slippage
    useNativeForIn: true,        // send value from smart account
  })

  const data = encodeFunctionData({
    abi: UNIVERSAL_ROUTER_ABI,
    functionName: 'execute',
    args: routerCalldataArgs,
  })

  return {
    to: routerAddress,
    data,
    value,
  }
}
