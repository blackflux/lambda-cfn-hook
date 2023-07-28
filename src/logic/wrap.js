import get from 'lodash.get';
import axios from '@blackflux/axios';
import Joi from 'joi-strict';
import { wrap } from 'lambda-async';
import { logger, abbrev } from 'lambda-monitor-logger';

const submit = async ({
  event, context, success, silent
}) => {
  const missingKeys = [
    'RequestType', 'ServiceToken', 'ResponseURL', 'StackId', 'RequestId',
    'LogicalResourceId', 'ResourceType', 'ResourceProperties'
  ].filter((k) => event[k] === undefined);
  if (missingKeys.length !== 0) {
    if (silent === true) {
      return;
    }
    logger.error(`Invalid Event\n${abbrev(event)}`);
    throw new Error('Invalid custom resource event received');
  }

  const requestBody = JSON.stringify({
    Status: success ? 'SUCCESS' : 'FAILED',
    Reason: `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: {}
  });

  const ax = axios.create({});
  ax.defaults.headers = {};
  try {
    await ax({
      method: 'PUT',
      url: event.ResponseURL,
      data: requestBody,
      headers: {
        'content-type': '',
        'content-length': requestBody.length,
        'user-agent': null
      }
    });
  } catch (err) {
    logger.error(`send(..) failed executing https.request(..)\n${err?.config?.data}`);
    throw new Error('send(..) failed executing https.request(..)');
  }
};

export default (fn, opts = {}) => wrap(async (event, context) => {
  Joi.assert(opts, Joi.object().keys({
    silent: Joi.boolean().optional()
  }));
  const silent = get(opts, 'silent', false);
  try {
    await fn(event, context);
  } catch (err) {
    logger.error(`Failure in custom code run inside of lambda-cfn-hook: ${err}`);
    await submit({
      event,
      context,
      success: false,
      silent
    });
    throw err;
  }
  await submit({
    event,
    context,
    success: true,
    silent
  });
});
