/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { DexService } from './dex.service';
@Controller('dex')
export class DexController {
    constructor(private readonly dexService: DexService) {}

  @Get()
  getDex(): string {
    return this.dexService.getDex();
  }

  @Get("/quotation")
  async getQuotation(@Query("from") from: string, @Query("chainFrom") chainFrom: string, @Query("chainTo") chainTo: string, @Query("amount") amount: string): Promise<any> {
    return this.dexService.getQuotation(from, chainFrom, chainTo, amount);
  }
}
