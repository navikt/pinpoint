import fetch, {RequestInit} from "node-fetch";
import Log from './logging';

interface CacheEntry {
    data: any;
    expiration: number;
}

interface Cache {
    [url: string]: CacheEntry
}

function cleanUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
}

function createCacheKey(url: string, options: RequestInit): string {
    return `${options.method || 'GET'}-${url}`;
}

class FetchCache {
    public static TTL: number = 10 * 60 * 1000;
    private cache: Cache = {};

    constructor() {
        setInterval(this.cleanup.bind(this), FetchCache.TTL);
    }

    public getFetch() {
        return (url: string, options: RequestInit): Promise<string> => {
            const cleanedUrl = cleanUrl(url);
            const key = createCacheKey(cleanedUrl, options);
            const now = Date.now();
            const cacheHit = this.cache[key];

            if (cacheHit) {
                if (now < cacheHit.expiration) {
                    Log.info('CacheHit ' + key);
                    return cacheHit.data;
                } else {
                    Log.info('CacheExpiration ' + key);
                    delete this.cache[key];
                }
            } else {
                Log.info('CacheMiss ' + key);
            }

            const data = fetch(cleanedUrl, options).then(resp => resp.text());
            const expiration = now + FetchCache.TTL;

            Log.info(`CachePut ${key} OriginalUrl: ${url}`);
            this.cache[key] = {
                data,
                expiration
            };

            return data;
        };
    }

    private cleanup() {
        const now = Date.now();
        Object.keys(this.cache)
            .filter((key) => {
                const expiration = this.cache[key].expiration;
                return now < expiration;
            })
            .forEach((key) => {
                Log.info('CacheClean ' + key);
                delete this.cache[key];
            });
    }
}

export default FetchCache;
