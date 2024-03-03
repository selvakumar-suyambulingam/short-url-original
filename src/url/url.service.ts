import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Url } from './entities/url.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async create(originalUrl: string): Promise<Url> {
    // Here you would generate your short URL code
    const shortUrlCode = '12345'; // Placeholder for the actual logic

    const newUrl = this.urlRepository.create({
      originalUrl,
      id: shortUrlCode,
    });

    await this.urlRepository.save({
      originalUrl,
      id: shortUrlCode,
    });

    return newUrl;
  }

  findOne(id: string): Promise<Url | null> {
    return this.urlRepository.findOneBy({ id });
  }
}
