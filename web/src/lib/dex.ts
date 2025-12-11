import axios from "axios"
import { parseEther } from "viem"

export interface ApprovalData {
    to: string
    data: string
    value: string
}

export async function getApprovalData(toTokenAddress: string, amount: string): Promise<ApprovalData | null> {
    console.info("[getApprovalData] Getting approval data for token:", toTokenAddress, "amount:", amount)
    const url = `${import.meta.env.VITE_API_URL}/dex/approval?tokenAddress=${toTokenAddress}&amount=${Number(parseEther(amount, "gwei"))}`
    try {
        const response = await axios.get<ApprovalData>(url)
        console.info("[getApprovalData] Approval data response:", response.status)
        return response.data
    } catch (error) {
        console.error("[getApprovalData] Error getting approval data:", error)
        return null
    }
}

export interface SwapDataResponse {
    dstAmount: string
    tx: {
        to: string
        data: string
        from: string
        gas: string
        gasPrice: string
        value: string
    }
}

export async function getSwapData(fromAddress: string,tokenSrc: string, tokenDst: string, amount: string, permit?: string): Promise<SwapDataResponse | null> {
    console.info("[swap] Swapping from " + fromAddress + " from token:" + tokenSrc + " to token:" + tokenDst + " amount:" + amount)

    // from 0x1Db2876267D2AdC9CA7eA628D53006282e683d5d
    // amount
    const url = `${import.meta.env.VITE_API_URL}/dex/swap`
    try {
        const response = await axios.post<SwapDataResponse>(url, {
            "from": fromAddress,
            "tokenSrc": tokenSrc,
            "tokenDst": tokenDst,
            "amount": Number(parseEther(amount, "gwei")),
            "chainId": 1, // ETH mainnet
            "permit": permit || null,
        })
        console.info("[swap] Swap response:", response.status)
        return response.data
    }  catch (error) {
        console.error("[swap] Error swapping:", error)
        return null
    }
}