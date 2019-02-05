import { util } from 'config';

// tslint:disable-next-line
let appConf = require(`${process.cwd()}/config/${process.env.NODE_ENV}.json`);
appConf = util.loadFileConfigs('');

export { appConf };
