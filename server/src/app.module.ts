import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DexController } from './dex.controller';
import { DexService } from './dex.service';

@Module({
  imports: [],
  controllers: [AppController, DexController],
  providers: [AppService, DexService],
})
export class AppModule {}
