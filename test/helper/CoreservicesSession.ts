import { parameter } from '@mulesoft/parameters';
import * as requestPromise from 'request-promise';
import { RequestClient } from './RequestClient';

export class CoreservicesSession {
  private baseUrl: string;
  private coreServiceUri: string;
  private platformSessionUri: string;
  private options: any;
  private accounts: any;

  public constructor(appConf: any) {
    this.baseUrl = appConf.baseUrl;
    this.coreServiceUri = appConf.URIs.coreService;
    this.platformSessionUri = appConf.URIs.platformSession;
    this.options = appConf.options;
    this.accounts = appConf.accounts;
  }

  public async get(entity: any | string): Promise<any> {
    const key = typeof(entity) === 'string' ? entity : entity.key;

    if (!process.env[key]) {
      await this.setSession(key);
    }

    return JSON.parse(process.env[key]);
  }

  private async login(username: string): Promise<any> {
    // TODO input password from terminal
    // if (!parameter.get('defaultPassword')) {

    // }

    const body: any = {
      password: parameter.get('defaultPassword'),
      username
    };
    const requestClient: RequestClient = new RequestClient();
    requestClient.baseUrl = this.baseUrl;

    return requestClient.createCoreservice(this.coreServiceUri).login.post(body);
  }

  private getAPIManagerSession(coreServiceToken: string): any {
    const baseOptions: any = {
      body: {
        token: coreServiceToken
      },
      json: true,
      method: 'POST',
      resolveWithFullResponse: true,
      uri: `${this.baseUrl}${this.platformSessionUri}`
    };

    const options: any = Object.assign({}, baseOptions, this.options);

    return requestPromise(options);
  }

  private getEnvironments(autorization: string, organizationId: string): any {
    const requestClient: RequestClient = new RequestClient();
    requestClient.baseUrl = this.baseUrl;
    requestClient.coreServiceAutorization = autorization;

    return requestClient.createCoreservice(this.coreServiceUri).api
      .organizations.orgId({ orgId: organizationId })
      .environments
      .get();
  }

  private async setSession(username: string): Promise<any> {
    const loginResponse: any = await this.login(username);
    const coreServiceAuthorization: string = `${loginResponse.body.token_type} ${loginResponse.body.access_token}`;
    const accountFromConfig: any = this.getAccountByUser(username);

    const APIManagerSessionResponse: any = await this.getAPIManagerSession(loginResponse.body.access_token);
    const session: any = APIManagerSessionResponse.body || {};

    const user: any = {
      APIManagerAuthorization: `Bearer ${session.token}`,
      coreServiceAuthorization,
      email: session.profile.email,
      id: session.profile.id,
      username: session.profile.username
    };

    process.env[username] = JSON.stringify(user);

    await Object.keys(accountFromConfig).map(async (orgKey: string) => {
      const organizationFromCfg: any = accountFromConfig[orgKey];
      const matchedOrganization: any = session.profile.memberOfOrganizations.find((element: any) =>
        element.name === organizationFromCfg.name);
      const organization: any = {
        id: matchedOrganization.id,
        name: matchedOrganization.name
      };
      process.env[organizationFromCfg.key] = JSON.stringify(organization);

      const environmentsFromConfig: any = accountFromConfig[orgKey].environments || [];
      const environmentsResponse: any = await this.getEnvironments(coreServiceAuthorization, organization.id);
      const environments: any[] = environmentsResponse.status === 200 ? environmentsResponse.body.data : [];

      await Object.keys(environmentsFromConfig).map(async (EnvKey: string) => {
        const environmentFromCfg: any = environmentsFromConfig[EnvKey];
        const matchedEnvironment: any = environments.find((element: any) => element.name === environmentFromCfg.name);
        const environment: any = {
          id: matchedEnvironment.id,
          name: matchedEnvironment.name
        };

        process.env[environmentFromCfg.key] = JSON.stringify(environment);
      });
    });
  }

  private getAccountByUser(username: string): any {
    const accountKeys: string[] = Object.keys(this.accounts);
    let account: any;

    for (const accountKey of accountKeys) {
      const organizationKeys: string[] = Object.keys(this.accounts[accountKey]);

      for (const orgKey of organizationKeys) {
        const organization: any = this.accounts[accountKey][orgKey];
        const users: any [] = organization.users ? Object.keys(organization.users).map((key) =>
          organization.users[key]) : [];
        const user: any = users.find((element: any) => element.username === username);

        if (user) {
          account = this.accounts[accountKey];
          break;
        }
      }

      if (account) {
        break;
      }
    }

    return account;
  }
}
