/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { DexService } from './dex.service';
import axios from 'axios';
@Controller('dex')
export class DexController {
    constructor(private readonly dexService: DexService) {}

  @Get()
  getDex(): string {
    return this.dexService.getDex();
  }

  @Get("/quotation")
  async getQuotation(@Query("from") from: string, @Query("chainFrom") chainFrom: string, @Query("chainTo") chainTo: string, @Query("amount") amount: string): Promise<any> {
   // return this.dexService.getQuotation(from, chainFrom, chainTo, amount);
   console.log("GET QUOTATION", from, chainFrom, chainTo, amount);

   const url = "https://api.1inch.com/swap/v6.1/1/approve/transaction";

   const config = {
     headers: {
       Authorization: "Bearer jc4MkIPPVtH4nt86d0b8hT3z1yX9YEhL",
     },
     params: {
       tokenAddress: "0x111111111117dc0aa78b770fa6a738034120c302",
       amount: "100000000000",
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

   return "Quotation retrieved";
  }
}
