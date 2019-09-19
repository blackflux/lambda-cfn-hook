const expect = require('chai').expect;
const { describe } = require('node-tdd');
const wrap = require('../../src/logic/wrap');

describe('Testing wrap', { useNock: true, record: console }, () => {
  let executor;
  beforeEach(({ fixture }) => {
    executor = async ({
      fn = () => 'ok',
      event = fixture('event'),
      context = fixture('context'),
      opts = undefined
    } = {}) => new Promise((resolve) => wrap(fn, opts)(
      event,
      context,
      (...args) => resolve(args)
    ));
  });

  it('Testing custom:ok hook:ok', async ({ recorder }) => {
    const r = await executor();
    expect(r).to.deep.equal([null, undefined]);
    expect(recorder.get()).to.deep.equal([]);
  });

  it('Testing custom:ok hook:fail', async ({ recorder }) => {
    const r = await executor();
    expect(r.length).to.equal(1);
    expect(r[0].message).to.equal('send(..) failed executing https.request(..)');
    expect(recorder.get()).to.deep.equal([
      'ERROR: send(..) failed executing https.request(..): StatusCodeError: 500 - ""'
    ]);
  });

  it('Testing custom:fail hook:fail', async ({ recorder }) => {
    const r = await executor({
      fn: () => {
        throw new Error();
      }
    });
    expect(r.length).to.equal(1);
    expect(r[0].message).to.equal('send(..) failed executing https.request(..)');
    expect(recorder.get()).to.deep.equal([
      'ERROR: Failure in custom code run inside of lambda-cfn-hook: Error',
      'ERROR: send(..) failed executing https.request(..): StatusCodeError: 500 - ""'
    ]);
  });

  it('Testing custom:fail hook:ok', async ({ recorder }) => {
    const err = new Error();
    const r = await executor({
      fn: () => {
        throw err;
      }
    });
    expect(r).to.deep.equal([err]);
    expect(recorder.get()).to.deep.equal([
      'ERROR: Failure in custom code run inside of lambda-cfn-hook: Error'
    ]);
  });

  it('Testing bad event', async ({ recorder }) => {
    const r = await executor({ event: {} });
    expect(r.length).to.equal(1);
    expect(r[0].message).to.equal('Invalid custom resource event received');
    expect(recorder.get()).to.deep.equal([
      'ERROR: Invalid Event\n{}'
    ]);
  });

  it('Testing bad event silent', async ({ recorder }) => {
    const r = await executor({
      event: {},
      opts: { silent: true }
    });
    expect(r.length).to.equal(2);
    expect(r).to.deep.equal([null, undefined]);
    expect(recorder.get()).to.deep.equal([]);
  });
});
