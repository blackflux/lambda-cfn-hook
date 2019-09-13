const expect = require('chai').expect;
const index = require('../src/index');

describe('Testing Package', () => {
  it('Testing Exports', () => {
    expect(Object.keys(index)).to.deep.equal([
      'wrap'
    ]);
  });
});
