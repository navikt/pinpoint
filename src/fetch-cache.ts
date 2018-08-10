import fetch, {RequestInit} from "node-fetch";

interface CacheEntry {
    data: any;
    expiration: number;
}

interface Cache {
    [url: string]: CacheEntry
}

function createCacheKey(url: string, options: RequestInit): string {
    return `${options.method || 'GET'}-${url}`;
}

class FetchCache {
    static TTL: number = 10 * 60 * 1000;
    cache: Cache = {};
    timer: number;


    constructor() {
        this.timer = setInterval(this.cleanup.bind(this), FetchCache.TTL);
    }

    public getFetch() {
        return (url: string, options: RequestInit): Promise<string> => {
            const key = createCacheKey(url, options);
            const now = Date.now();
            const cacheHit = this.cache[key];

            if (cacheHit) {
                console.log('CacheHit', key);
                if (cacheHit.expiration < now) {
                    return cacheHit.data;
                } else {
                    console.log('CacheExpiration', key);
                    delete this.cache[key];
                }
            } else {
                console.log('CacheMiss', key);
            }

            const data = fetch(url, options).then(resp => resp.text());
            const expiration = now + FetchCache.TTL;

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
                delete this.cache[key];
            });
    }

}

export default FetchCache;
