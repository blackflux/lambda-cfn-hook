import { expect } from 'chai';
import { describe } from 'node-tdd';
import wrap from '../../src/logic/wrap.js';

describe('Testing wrap', { useNock: true, record: console }, () => {
  let executor;

  beforeEach(({ fixture }) => {
    executor = async ({
      fn = () => 'ok',
      event = fixture('event'),
      context = fixture('context'),
      opts = undefined
    } = {}) => wrap(fn, opts)(
      event,
      context
    );
  });

  it('Testing custom:ok hook:ok', async ({ recorder }) => {
    const r = await executor();
    expect(r).to.deep.equal(undefined);
    expect(recorder.get()).to.deep.equal([]);
  });

  it('Testing custom:ok hook:fail', async ({ capture, recorder }) => {
    const err = await capture(() => executor());
    expect(err.message).to.equal('send(..) failed executing https.request(..)');
    expect(recorder.get()).to.deep.equal([
      // eslint-disable-next-line max-len
      'ERROR: send(..) failed executing https.request(..)\n{"Status":"SUCCESS","Reason":"See the details in CloudWatch Log Stream: log","PhysicalResourceId":"log","StackId":"arn:aws:cloudformation:us-west-2:...","RequestId":"d373acbe-b7fd-46f1-a645-95b3002ec39b","LogicalResourceId":"TriggerPostDeployLambdaResource","Data":{}}'
    ]);
  });

  it('Testing custom:fail hook:fail', async ({ capture, recorder }) => {
    const err = await capture(() => executor({
      fn: () => {
        throw new Error();
      }
    }));
    expect(err.message).to.equal('send(..) failed executing https.request(..)');
    expect(recorder.get()).to.deep.equal([
      'ERROR: Failure in custom code run inside of lambda-cfn-hook: Error',
      // eslint-disable-next-line max-len
      'ERROR: send(..) failed executing https.request(..)\n{"Status":"FAILED","Reason":"See the details in CloudWatch Log Stream: log","PhysicalResourceId":"log","StackId":"arn:aws:cloudformation:us-west-2:...","RequestId":"d373acbe-b7fd-46f1-a645-95b3002ec39b","LogicalResourceId":"TriggerPostDeployLambdaResource","Data":{}}'
    ]);
  });

  it('Testing custom:fail hook:ok', async ({ capture, recorder }) => {
    const myError = new Error();
    const err = await capture(() => executor({
      fn: () => {
        throw myError;
      }
    }));
    expect(err).to.equal(myError);
    expect(recorder.get()).to.deep.equal([
      'ERROR: Failure in custom code run inside of lambda-cfn-hook: Error'
    ]);
  });

  it('Testing bad event', async ({ capture, recorder }) => {
    const err = await capture(() => executor({ event: {} }));
    expect(err.message).to.equal('Invalid custom resource event received');
    expect(recorder.get()).to.deep.equal([
      'ERROR: Invalid Event\n{}'
    ]);
  });

  it('Testing bad event silent', async ({ capture, recorder }) => {
    const r = await executor({
      event: {},
      opts: { silent: true }
    });
    expect(r).to.deep.equal(undefined);
    expect(recorder.get()).to.deep.equal([]);
  });
});
