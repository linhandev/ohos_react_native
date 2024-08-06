import {RNAbility} from 'rnoh';

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }

  getRNOHWorkerScriptUrl() {
    return "entry/ets/workers/RNOHWorker.ts"
  }
}
