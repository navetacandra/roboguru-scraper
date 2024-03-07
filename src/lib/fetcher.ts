import https from "https";
import http from "http";
import { UrlObject } from "url";
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const httpAgent = new http.Agent();

type Encode = 'text' | 'json' | 'buffer';

type RequestOptions = {
  method?: http.RequestOptions["method"], 
  headers?: http.OutgoingHttpHeaders | https.RequestOptions['headers'], 
  body?: string|object,
  encode?: Encode
};

export function request(
  url: string, 
  options: RequestOptions
  ): Promise<Buffer|object|string> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl: UrlObject = new URL(url);
      const reqOptions: http.RequestOptions = {
        method: options.method ?? "GET",
        hostname: parsedUrl.hostname ?? "",
        port: parsedUrl.port 
          ? parsedUrl.port
          : parsedUrl.protocol == 'https:' 
            ? 443 
            : 80,
        path: parsedUrl.pathname ?? "/",
        agent: parsedUrl.protocol === 'https:' ? httpsAgent : httpAgent,
        headers: options.headers ?? {}
      };
      const response: Buffer[]= [];
      const req = (parsedUrl.protocol === 'https:' ? https : http).request(reqOptions, (res) => {
        if(res.statusCode == 302) {
          resolve(request(res.headers.location ?? "", options));
          req.end();
        }
        res.on('data', d => response.push(Buffer.from(d)));
        res.on('error', err => reject(err));
        res.on('end', () => {
          const data = Buffer.concat(response);
          if(options.encode === 'text') {
            resolve(data.toString());
          } else if(options.encode === 'json') {
            resolve(JSON.parse(data.toString()));
          } else {
            resolve(data);
          }
        });
      });
      req.on('error', err => reject(err));
      if(options.method !== 'GET' && options.body) {
        req.write(JSON.stringify(options.body));
      }
      req.end();
    } catch(err) {
      reject(err);
    }
  })
}
