import { expect } from 'chai';
import { OK } from 'http-status-codes';
import { appConf } from '../config';
import { CoreservicesSession } from './helper/CoreservicesSession';
import { RequestClient } from './helper/RequestClient';

describe('Given username and password of AnyPoint Application', () => {
  const RAML_PARSER_HAPPY_PATH_API_NAME: string = 'RAML-Parser-HAPPY-PATH';
  let user: any;
  let organization: any;
  let apiPlatformClient: any;

  before( async () => {
    const session: CoreservicesSession = new CoreservicesSession(appConf);
    const crowdMasterFromConfig: any = appConf.accounts.crowd.master;
    user = await session.get(crowdMasterFromConfig.users.owner.username);
    organization = await session.get(crowdMasterFromConfig);

    const requestClient: any = new RequestClient();
    requestClient.baseUrl = appConf.baseUrl;
    requestClient.options = appConf.options;
    requestClient.apiManagerAutorization = user.APIManagerAuthorization;
    apiPlatformClient = requestClient.createAPIPlatform(appConf.URIs.apiPlatform);
      // .organizationId({ organizationId: organization.id });
  });

  it('then the user and organization should exist', () => {
    expect(user.id).to.not.equal(undefined);
    expect(organization.id).to.not.equal(undefined);
  });

  describe('and it gets the created Mule Three API', () => {
    let api: any;

    before(async () => {
      const getAPIsResponse: any = await apiPlatformClient
        .organizations.organizationId({ organizationId: organization.id })
        .apis.get();

      const apis: any [] = getAPIsResponse.status === OK ? getAPIsResponse.body.apis : [];
      api = apis.find((element: any) => element.name === RAML_PARSER_HAPPY_PATH_API_NAME);
    });

    it(`then the ${RAML_PARSER_HAPPY_PATH_API_NAME} API should exist`, () => {
      expect(api).to.not.equal(undefined);
    });
  });
});
