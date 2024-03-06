import { Injectable, Logger } from '@nestjs/common';
import { Url } from './entities/url.entity';
import { UrlUsage } from './entities/url-usage.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateShortId } from '../utils/string.utils';
import { UrlDto } from './dto/url.dto';

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);

  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @InjectRepository(UrlUsage)
    private readonly urlUsageRepository: Repository<UrlUsage>,
  ) {}

  /**
   * Creates a new URL record in the database.
   *
   * This method accepts a DTO (Data Transfer Object) containing the long URL and an optional alias.
   * If an alias is provided, it will be used as the short identifier for the URL. If no alias is provided,
   * a short identifier will be generated automatically. The new URL, along with its alias (or generated
   * short identifier), is then saved to the database.
   *
   * @param {UrlDto} urlDto - The URL DTO containing the long URL and an optional alias.
   * @returns {Promise<Url>} A promise that resolves with the newly created URL entity.
   */
  async create(urlDto: UrlDto): Promise<Url> {
    const { url: longUrl, alias } = urlDto;

    this.logger.log('create: Input', { urlDto });

    const newUrl = await this.urlRepository.save({
      alias: alias || generateShortId(),
      longUrl,
    });
    this.logger.log('create: Success', { newUrl });

    return newUrl;
  }

  /**
   * Finds a URL entity by its short identifier.
   *
   * If a URL with the given short identifier exists, it is returned; otherwise, undefined is returned.
   *
   * @param {string} shortId - The short identifier of the URL to find.
   * @returns {Promise<Url | undefined>} The URL entity if found; otherwise, undefined.
   */
  async findOneByAlias(alias: string): Promise<Url | undefined> {
    return this.urlRepository.findOne({ where: { alias, deletedAt: null } });
  }

  /**
   * Retrieves a single URL entity by its ID.
   *
   * This method queries the database for a URL entity with the specified ID. It's designed to
   * return a single URL entity or undefined if no entity with such ID exists. The method uses
   * the `findOneBy` function provided by TypeORM, which simplifies fetching records by column-value
   * pairs.
   *
   * @param {number} id - The unique identifier of the URL entity to be retrieved.
   * @returns {Promise<Url | undefined>} A promise that resolves with the URL entity if found,
   * or undefined if no entity with the provided ID exists. This allows for straightforward
   * handling of both found and not found cases by the caller.
   */
  async findOneById(id: number): Promise<Url | undefined> {
    return this.urlRepository.findOneBy({ id });
  }

  /**
   * Increments the hit count for a specific URL by 1.
   *
   * This method directly updates the 'hitCount' column in the database for the URL
   * identified by the given URL ID. It uses the repository's `increment` method to
   * efficiently update the value without needing to load the entire entity into memory.
   *
   * @param {number} urlId - The ID of the URL entity whose hit count is to be incremented.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   * @throws {QueryFailedError} Throws an error if the update operation fails.
   */
  async incrementHitCount(urlId: number): Promise<void> {
    this.logger.log('incrementHitCount: Input', { urlId });
    await this.urlRepository.increment({ id: urlId }, 'hitCount', 1);
  }

  async deleteShortUrl(id: number): Promise<void> {
    this.logger.log('deleteShortUrl: Input', { id });
    await this.urlRepository.softDelete(id);
  }

  /**
   * Records an access event for a specific URL.
   *
   * This method creates and saves a new `UrlAccess` entity to the database each time a URL is accessed.
   * It captures the time of access, the IP address of the client, and optionally the client's User-Agent.
   *
   * @param {number} urlId - The ID of the URL that was accessed. This should correspond to an existing
   *                         `Url` entity in the database.
   * @param {string} ip - The IP address of the client that accessed the URL. This information can be used
   *                      for analytics or security purposes.
   * @param {string} [userAgent] - Optional. The User-Agent string provided by the client's browser or
   *                               HTTP client. This string can give insights into the type of device,
   *                               operating system, and browser that made the request.
   * @returns {Promise<void>} A promise that resolves once the access record has been successfully saved
   *                          to the database. The promise resolves with no value.
   */
  async recordUrlUsage(
    urlId: number,
    ip: string,
    userAgent?: string,
  ): Promise<void> {
    this.logger.log('recordUrlUsage: Input', { urlId, ip, userAgent });
    await this.urlUsageRepository.save({
      urlId,
      ip,
      userAgent,
    });
  }

  /**
   * Retrieves statistical data for each URL, including the total access count and the
   * access count per User-Agent. This method performs two main operations:
   *
   * 1. Fetches the total number of accesses for each URL.
   * 2. Fetches the number of accesses per User-Agent for each URL.
   *
   * After gathering this data, it combines the results into a single dataset where
   * each URL's statistics include both the total access count and a breakdown of
   * accesses by User-Agent.
   *
   * @returns {Promise<Array>} A promise that resolves with an array of objects, each
   * object containing the following properties:
   *  - id: The ID of the URL.
   *  - longUrl: The original long URL.
   *  - totalAccessCount: The total number of times the URL has been accessed.
   *  - userAgentCounts: An array of objects detailing accesses by User-Agent, with each
   *    object containing:
   *      - userAgent: The User-Agent string.
   *      - count: The number of accesses from this User-Agent.
   */
  async findUrlStatistics() {
    // First, get the total access count for each URL.
    const totalAccessCounts = await this.urlRepository
      .createQueryBuilder('url')
      .leftJoin('url.usages', 'usage')
      .select('url.id', 'id')
      .addSelect('url.longUrl', 'longUrl')
      .addSelect('COUNT(usage.id)', 'totalAccessCount')
      .groupBy('url.id')
      .getRawMany();

    // Next, get the access count per User-Agent for each URL.
    const userAgentCounts = await this.urlRepository
      .createQueryBuilder('url')
      .leftJoin('url.usages', 'usage')
      .select('url.id', 'id')
      .addSelect('usage.userAgent', 'userAgent')
      .addSelect('COUNT(usage.userAgent)', 'countPerUserAgent')
      .groupBy('url.id')
      .addGroupBy('usage.userAgent')
      .getRawMany();

    const combinedStatistics = totalAccessCounts.map((urlStat) => {
      const userAgentDetails = userAgentCounts
        .filter((uaCount) => uaCount.id === urlStat.id)
        .map((uaCount) => ({
          userAgent: uaCount.userAgent,
          count: uaCount.countPerUserAgent,
        }));

      return {
        ...urlStat,
        userAgentCounts: userAgentDetails,
      };
    });

    return combinedStatistics;
  }
}
