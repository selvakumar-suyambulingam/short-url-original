import { Body, Controller, Get, Param, Post, Redirect } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UrlUsageDto } from './dto/url-usage.dto';
//import { Cat } from './entities/cat.entity';

@ApiBearerAuth()
@ApiTags('urls')
@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/shorten')
  @ApiOperation({ summary: 'Shorten URL' })
  //@ApiResponse({ status: 403, description: 'Forbidden.' })
  async createShortUrl(@Body() createUrlDto: CreateUrlDto) {
    const shortUrl = this.urlService.create(createUrlDto.url);
    return { shortUrl };
  }

  @Get(':id')
  @Redirect()
  async redirectToUrl(@Param('id') id: string) {
    const url = await this.urlService.findOne(id);
    console.log('url==', url);

    if (url) {
      return { url: url.originalUrl, statusCode: 302 };
      /*return {
        url: 'https://github.com/nestjs/typescript-starter',
        statusCode: 302,
      };*/
    } else {
      return { url: 'http://localhost:3000/', statusCode: 404 };
    }
  }
}
