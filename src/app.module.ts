import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlService } from './url/url.service';
import { UrlController } from './url/url.controller';

import { UrlModule } from './url/url.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Url } from './url/entities/url.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'host.docker.internal',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'test',
      entities: [Url],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UrlModule,
  ],
  controllers: [AppController, UrlController],
  providers: [AppService, UrlService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
