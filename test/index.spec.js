import { expect } from 'chai';
import * as index from '../src/index.js';

describe('Testing Package', () => {
  it('Testing Exports', () => {
    expect(Object.keys(index)).to.deep.equal([
      'wrap'
    ]);
  });
});
