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