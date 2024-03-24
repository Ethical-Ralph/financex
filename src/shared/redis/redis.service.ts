import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private redis: Redis) {}

  async acquireLock(key: string, value: string, ttl = 30 * 60 * 1000) {
    const result = await this.redis.set(key, value, 'PX', ttl, 'NX');

    return result === 'OK';
  }

  async releaseLock(key: string, value: string) {
    const script = `
                if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                else
                    return 0
                end
            `;

    const result = await this.redis.eval(script, 1, key, value);

    return result === 1;
  }
}
