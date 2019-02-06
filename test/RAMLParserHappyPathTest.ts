import { expect } from 'chai';
import { OK } from 'http-status-codes';
import * as ramlParser from 'raml-1-parser';
import { appConf } from '../config';
import { CoreservicesSession } from './helper/CoreservicesSession';
import { RequestClient } from './helper/RequestClient';

describe('Given authenticated user in Pre Crowd Anypoint application', () => {
  const API_NAME: string = 'RAML-Parser-HAPPY-PATH';
  const VERSION_NAME = 'v1';
  const RAML_FILE: string = './test/resources/raml/RAML_PARSER_HAPPY_PATH.raml';
  let user: any;
  let organization: any;
  let apiPlatformClient: any;

  before( async () => {
    const session: CoreservicesSession = new CoreservicesSession(appConf);
    const crowdMasterFromConfig: any = appConf.accounts.crowd.master;
    user = await session.get(crowdMasterFromConfig.users.owner.username);
    organization = await session.get(crowdMasterFromConfig);

    const requestClient: any = new RequestClient();
    requestClient.options = appConf.options;
    requestClient.apiManagerAutorization = user.APIManagerAuthorization;
    apiPlatformClient = requestClient.createAPIPlatform(appConf.uris.apiPlatform);
  });

  it('then the user and organization should exist', () => {
    expect(user.id).to.not.equal(undefined);
    expect(organization.id).to.not.equal(undefined);
  });

  describe('and it gets a created Mule Three API with an associated RAML file', () => {
    let apiId: any;
    let apiVersionId: any;

    before(async () => {
      const getAPIsResponse: any = await apiPlatformClient
        .organizations.organizationId({ organizationId: organization.id })
        .apis.get({ query: API_NAME });

      const apis: any [] = getAPIsResponse.status === OK ? getAPIsResponse.body.apis : [];
      const api = apis.find((element: any) => element.name === API_NAME);
      const version = api.versions.find((element: any) => element.name === VERSION_NAME) || {};

      apiId = api.id;
      apiVersionId = version.id;
    });

    it(`then the ${API_NAME} API should exist`, () => {
      expect(apiId).to.not.equal(undefined);
    });

    describe('when it gets the RAML Definition', () => {
      let getDefinitionResponse: any;
      let definition: any;
      let definitionFromFile: any;

      before(async () => {
        getDefinitionResponse = await apiPlatformClient
          .organizations.organizationId({ organizationId: organization.id })
          .apis.apiId({ apiId }).versions.apiVersionId({ apiVersionId })
          .definition.get();
        definition = getDefinitionResponse.body;
        definitionFromFile = (await ramlParser.load(RAML_FILE)).specification;
      });

      it('the the RAML Header should matched with the RAML file', () => {
        expect(definition.title).to.equals(definitionFromFile.title);
        expect(definition.version).to.equals(definitionFromFile.version);
        expect(definition.baseUri).to.equals(definitionFromFile.baseUri);
      });

      it('and the resource should matched with the RAML file', async () => {
        expect(getDefinitionResponse.status).to.equal(OK);

        const resource: any = definition.resources.map((element: any) => {
          const endpoint: any = {
            absoluteUri: element.absoluteUri,
            displayName: element.displayName,
            relativeUri: element.relativeUri
          };
          return endpoint;
        });

        const expected: any = definitionFromFile.resources.map((element: any) => {
          const endpoint: any = {
            absoluteUri: element.absoluteUri,
            displayName: element.displayName,
            relativeUri: element.relativeUri
          };
          return endpoint;
        });
        expect(resource).deep.equal(expected);
      });
    });
  });
});
