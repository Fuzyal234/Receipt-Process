declare module 'serverless-http' {
  import { Application } from 'express';
  
  interface ServerlessHttpOptions {
    binary?: boolean | string[];
    request?: (request: any, event: any, context: any) => any;
    response?: (response: any) => any;
  }
  
  function serverless(app: Application, options?: ServerlessHttpOptions): (event: any, context: any) => Promise<any>;
  export = serverless;
}
