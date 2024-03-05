import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Url } from './entities/url.entity';
import { UrlUsage } from './entities/url-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url, UrlUsage])],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [TypeOrmModule],
})
export class UrlModule {}
