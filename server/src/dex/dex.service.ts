/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';  
import { SwapRequest } from './dex.controller';

const SLUG_TO_ADDRESS = {
  "eth": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  "op": "0x4200000000000000000000000000000000000042",
  "usdt": "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
  "usdc": "0x514910771AF9Ca656af840dff83E8264EcF986CA",
  "dai": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
}

@Injectable()
export class DexService {
  private readonly INCH_TOKEN: string;
  private readonly DEX_URL: string;

  constructor() {
    this.INCH_TOKEN = process.env.INCH_TOKEN ?? '';
    this.DEX_URL = "https://api.1inch.com/swap/v6.1";
  }
    getDex(): string {
        return 'dex!';
    }

    async getQuotation(from: string, chainFrom: string, chainTo: string, amount: string): Promise<any> {
        console.log("Getting quotation for", from, chainFrom, chainTo, amount);
        const url = "https://api.1inch.com/fusion-plus/quoter/v1.1/quote/receive";

        const config = {
            headers: {
            Authorization: `Bearer ${process.env.INCH_TOKEN}`,
            },
            params: {
            srcChain: "1", // Optimism
            dstChain: "10",
            srcTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            dstTokenAddress: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
            amount: "1000",
            walletAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            enableEstimate: "false",
            fee: "0",
            },
            paramsSerializer: {
            indexes: null,
            },
        };

        try {
            const response = await axios.get(url, config);
            console.log("Quotation response", response.data);
            return response.data;
        } catch (error) {
            console.error(error);
            return {
                error: (error as Error).message,
                status: 500,
            };
        }
    }

    async executeSwap(swapRequest: SwapRequest): Promise<any> {
        const { from, chainId, amount, tokenSrc, tokenDst } = swapRequest;
        console.log("SWAP REQUEST", from, chainId, amount, tokenSrc, tokenDst);

        if (!tokenSrc || !tokenDst) {
            throw new BadRequestException("Invalid token");
        }

        if (!from) {
            throw new BadRequestException("Invalid from address");
        }

        if (!chainId) {
            throw new BadRequestException("Invalid chain id");
        }

        // TODO CONVERT amount to wei
        const tokenAddressSrc = SLUG_TO_ADDRESS[tokenSrc.toLowerCase() as keyof typeof SLUG_TO_ADDRESS];
        const tokenAddressDst = SLUG_TO_ADDRESS[tokenDst.toLowerCase() as keyof typeof SLUG_TO_ADDRESS];
    
        const swapConfig = {
          headers: {
            Authorization: `Bearer ${process.env.INCH_TOKEN}`,
          },
          params: {
            src: tokenAddressSrc, 
            dst: tokenAddressDst, 
            amount,                      
            from,                        
            slippage: 1,                
          },
        };
    
        try {
          const swapUrl = `${this.DEX_URL}/${chainId}/swap`;
          console.log("SWAP URL", swapUrl);
          console.log("SWAP CONFIG", swapConfig);
          const response = await axios.get(swapUrl, swapConfig);
          console.log("SWAP RESPONSE", response.data);
          return response.data;
        } catch (error) {
          console.error(error?.message ?? "Unknown error");
          throw new InternalServerErrorException({
            error: (error as Error).message,
            status: 500,
          })
        }
    }
    
    async getApprovalData(tokenAddress: string, amount: string): Promise<any> {
      const options = {
        method: 'GET',
        url: 'https://api.1inch.com/swap/v6.1/1/approve/transaction',
        params: {tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', amount: '10'},
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer ' + process.env.INCH_TOKEN
        }
      };
      
      try {
        const response = await axios.request(options);
        return response.data;
      } catch (error) {
        console.error("Error getting approval data", error);
        return null;
      }
    }
}