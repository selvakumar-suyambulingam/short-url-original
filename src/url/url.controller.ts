import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Ip,
  NotFoundException,
  Param,
  Post,
  Redirect,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ErrorMessages } from '../constants/error-messages.constants';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UrlService } from './url.service';
import { UrlDto } from './dto/url.dto';
import { ConfigService } from '@nestjs/config';

@ApiBearerAuth()
@ApiTags('urls')
@Controller('urls')
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private configService: ConfigService,
  ) {}

  @Post('/shorten')
  @ApiOperation({ summary: 'Shorten a long URL' })
  async createShortUrl(@Body() urlDto: UrlDto) {
    if (urlDto.alias) {
      const url = await this.urlService.findOneByAlias(urlDto.alias);
      if (url) {
        throw new UnprocessableEntityException(
          ErrorMessages.ALIAS_NOT_AVAILABLE,
        );
      }
    }
    const url = await this.urlService.create(urlDto);
    return {
      url: `${this.configService.get<string>('CLIENT_URL')}/urls/${url.alias}`,
    };
  }

  @Get('/statistics')
  @ApiOperation({ summary: 'Get URL Statistics' })
  async getStatistics() {
    const statistics = await this.urlService.findUrlStatistics();
    return { statistics };
  }

  @Get(':alias')
  @ApiOperation({ summary: 'Redirect to original Url' })
  @Redirect()
  async redirectToLongUrl(
    @Param('alias') alias: string,
    @Ip() ip,
    @Req() req: Request,
  ) {
    const url = await this.urlService.findOneByAlias(alias);

    if (url) {
      if (
        url.hitCount >=
        this.configService.get<number>('URL_RATE_LIMIT_THRESHOLD', 10)
      ) {
        throw new HttpException(
          ErrorMessages.TOO_MANY_REQUESTS,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      await this.urlService.incrementHitCount(url.id);
      await this.urlService.recordUrlUsage(
        url.id,
        ip,
        req.headers['user-agent'],
      );
      return { url: url.longUrl, statusCode: 302 };
    } else {
      return {
        url: this.configService.get<string>('CLIENT_URL'),
        statusCode: 404,
      };
    }
  }

  @Delete(':urlId')
  async softDeleteUrl(@Param('urlId') urlId: number) {
    const url = await this.urlService.findOneById(urlId);
    if (!url) {
      throw new NotFoundException();
    }

    await this.urlService.deleteShortUrl(urlId);

    return { url };
  }
}
