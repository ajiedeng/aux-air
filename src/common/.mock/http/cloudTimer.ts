import { queryMockTimer, upsertMockTimer, deleteMockTimer, batchesUpdateMockTimer } from "./timerLogic";
import { type } from "os";
import fetchMock from 'fetch-mock';
import { isEmpty } from '../dna/taskV2';

fetchMock
  .mock(
    {
      url: 'https://app-service-deu-a00df8b5.ibroadlink.com/appfront/v1/timertask/manage',
      method: 'POST',
    },
    (url, opts) => {
      console.log('fetchMock---opts', opts);
      const { body } = opts;
      const req = JSON.parse(body as string);
      let res: any;
      switch (req.command) {
        case 'query':
          res = queryMockTimer(req);
          break;
        case 'upsert':
          res = upsertMockTimer(req);
          break;
        case 'delete':
          res = deleteMockTimer(req);
          break;
        case 'updateattribute':
          res = batchesUpdateMockTimer(req);
          break;

        default:
          break;
      }
      console.log('fetchMock---opts--req', req)
      // let resp = JSON.parse(window.localStorage.taskV2Cloud);
      // console.log('localStorage.taskV2Cloud', resp);
      return res
    }, { delay: 0 })
