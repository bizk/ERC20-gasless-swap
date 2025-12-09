/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { DexService } from './dex.service';
import axios from 'axios';
@Controller('dex')
export class DexController {
    constructor(private readonly dexService: DexService) {

    }

  @Get()
  getDex(): string {
    return this.dexService.getDex();
  }

  @Get("/quotation")
  async getQuotation(
    @Query("from") from: string, 
    @Query("chain") chainId: string, 
    @Query("amount") amount: string,
    @Query("tokenAddress") tokenAddress: string
  ): Promise<any> {
   console.log("GET QUOTATION", from, chainId, amount);

   const url = "https://api.1inch.com/swap/v6.1/1/approve/transaction";

   const config = {
     headers: {
       Authorization: `Bearer ${process.env.INCH_TOKEN}`,
     },
     params: {
       tokenAddress: "0xa3C6530dfeAbC1dE3c97549E318054C871E5D0Bc",
       amount: "10000",
     },
     paramsSerializer: {
       indexes: null,
     },
   };
 
   try {
     const response = await axios.get(url, config);
     console.log(response.data);
     return response.data;
   } catch (error: any) {
     console.error(error);
     return {
      status: 500,
      message: "Error retrieving quotation",
      data: (error as Error).message,
     };
   }

  }

  @Post("/swap")
  async swap(
    @Body() swapRequest: SwapRequest
  ): Promise<any> {
    return this.dexService.executeSwap(swapRequest);
  }

  @Get("/approval")
  async getApprovalData(
    @Query("tokenAddress") tokenAddress: string,
    @Query("amount") amount: string
  ): Promise<any> {
    return this.dexService.getApprovalData(tokenAddress, amount);
  }
}
export interface SwapRequest {
  from: string;
  chainId: string;
  amount: string;
  tokenSrc: string;
  tokenDst: string;
}