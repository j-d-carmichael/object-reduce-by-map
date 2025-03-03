import { describe, it, expect } from 'vitest';
import reducer from '../src/reducer';

describe('Reducer with empty map behavior', () => {
  const map = {};
  const input = {
    name: 'bob',
    age: 537
  };

  it('should return the object unaffected with a map of no keys', () => {
    expect(reducer(input, map, { permitEmptyMap: true })).toEqual(input);
  });

  it('should return the object empty when the option is not passed', () => {
    expect(reducer(input, map, {})).toEqual({});
  });

  it('should return the object unaffected with a map of undefined', () => {
    expect(reducer(input, undefined, { permitUndefinedMap: true })).toEqual(input);
  });

  it('should throw an error for undefined without express permission for undefined map', () => {
    expect(() => reducer(input, undefined, {})).toThrow();
  });
});
