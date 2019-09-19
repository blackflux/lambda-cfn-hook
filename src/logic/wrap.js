const get = require('lodash.get');
const request = require('request-promise');
const Joi = require('joi-strict');
const { wrap } = require('lambda-async');
const { logger, abbrev } = require('lambda-monitor-logger');

const submit = async (event, context, opts) => {
  const missingKeys = [
    'RequestType', 'ServiceToken', 'ResponseURL', 'StackId', 'RequestId',
    'LogicalResourceId', 'ResourceType', 'ResourceProperties'
  ].filter((k) => event[k] === undefined);
  if (missingKeys.length !== 0) {
    if (opts.errorOnInvalidEvent) {
      logger.error(`Invalid Event\n${abbrev(event)}`);
      throw new Error('Invalid custom resource event received');
    } else {
      return;
    }
  }

  const requestBody = JSON.stringify({
    Status: opts.success ? 'SUCCESS' : 'FAILED',
    Reason: `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: {}
  });

  try {
    await request({
      method: 'PUT',
      uri: event.ResponseURL,
      body: requestBody,
      headers: {
        'content-type': '',
        'content-length': requestBody.length
      },
      resolveWithFullResponse: true
    });
  } catch (err) {
    logger.error(`send(..) failed executing https.request(..): ${err}`);
    throw new Error('send(..) failed executing https.request(..)');
  }
};

module.exports = (fn, opts = {}) => wrap(async (event, context) => {
  Joi.assert(opts, Joi.object().keys({
    errorOnInvalidEvent: Joi.boolean().optional()
  }));
  const errorOnInvalidEvent = get(opts, 'errorOnInvalidEvent', true);
  try {
    await fn(event, context);
  } catch (err) {
    logger.error(`Failure in custom code run inside of lambda-cfn-hook: ${err}`);
    await submit(event, context, { success: false, errorOnInvalidEvent });
    throw err;
  }
  await submit(event, context, { success: true, errorOnInvalidEvent });
});
