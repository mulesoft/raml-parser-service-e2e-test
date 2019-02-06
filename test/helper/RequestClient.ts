import * as CoreServiceClient from '@mulesoft/access-management-api-client';
import * as APIPlatformClient from '@mulesoft/api-platform-repository-client';

export class RequestClient {
  private _options: any = {};
  private _apiManagerAutorization: string;
  private _coreServiceAutorization: string;

  set options(value: any) {
    this._options = value;
  }

  set apiManagerAutorization(value: string) {
    this._apiManagerAutorization = value;
  }

  set coreServiceAutorization(value: string) {
    this._coreServiceAutorization = value;
  }

  public build(uri: string, headers?: any): any {
    return {
      baseUri: uri,
      headers,
      options: this._options
    };
  }

  public createAPIPlatform(uri: string): any {
    const headers: any = {
      'Authorization': this._apiManagerAutorization,
      'Content-Type': 'application/json'
    };
    const apiPlatformOptions: any = this.build(uri, headers);
    const apiPlatformClient = new APIPlatformClient(apiPlatformOptions);

    return apiPlatformClient;
  }

  public createCoreservice(uri: string): any {
    const headers: any = {
      'Authorization': this._coreServiceAutorization,
      'Content-Type': 'application/json'
    };
    const coreServiceOptions: any = this.build(uri, headers);
    const coreServiceClient = new CoreServiceClient(coreServiceOptions);

    return coreServiceClient;
  }
}
