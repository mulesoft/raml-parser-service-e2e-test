import * as readlineSync from 'readline-sync';

// tslint:disable-next-line
const envConf = require(`./${process.env.NODE_ENV}`).envConf;
process.env.DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD ||
  readlineSync.question('Enter Default User Password: ', { hideEchoBack: true });

export const appConf = Object.freeze({
  accounts: {
    crowd: {
      master: {
        key: 'crowd.master',
        name: 'Mulesoft',
        users: {
          owner: {
            username: 'automation_ap_api'
          }
        }
      }
    }
  },
  options: {
    simple: false
  },
  uris: {
    apiPlatform: `${envConf.baseUrl}/apiplatform/repository/v2`,
    coreService: `${envConf.baseUrl}/accounts`,
    platformSession: `${envConf.baseUrl}/apiplatform/session`
  }
});
