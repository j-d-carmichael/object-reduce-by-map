import { describe, it, test, expect } from 'vitest';
import reducer from '../src/reducer';

describe('Test passing null keys through', () => {
  const map = {
    id: Number,
    date: String,
    type: String,
    health: Number,
    wear: Number,
  };

  const mapWithNullValues = {
    id: null,
    date: null,
    type: null,
    health: null,
    wear: null,
  };

  const defaultOptions = { throwOnAlien: false, allowNullish: true, keepKeys: false, allowNullishKeys: false };

  it('does not alter default behaviour', () => {
    const testInput = {
      id: 10,
      date: '1970-01-01',
      type: 'test',
    };

    expect(reducer(testInput, map, defaultOptions)).toEqual(testInput);

    expect(reducer(testInput, map, { ...defaultOptions, keepKeys: true })).toEqual({
      id: 10,
      date: '1970-01-01',
      type: 'test',
      health: null,
      wear: null,
    });

    expect(reducer(testInput, map, { ...defaultOptions, keepKeys: true, allowNullishKeys: true })).toEqual({
      id: 10,
      date: '1970-01-01',
      type: 'test',
      health: null,
      wear: null,
    });

    expect(reducer(testInput, map, { ...defaultOptions, keepKeys: false, allowNullishKeys: true })).toEqual(testInput);
  });
});

describe('ensure the reducer reduces', () => {
  const input = [{
    a: 1,
    b: 2,
    c: 3,
  }, {
    a: 2,
    c: 4,
  }];
  const map = [{
    a: Number,
    b: Number,
  }];

  test('reduce and 1 key with missing values as null', () => {
    const expected = [{
      a: 1,
      b: 2,
    }, {
      a: 2,
      b: null,
    }];
    const result = reducer(input, map, { keepKeys: true });
    expect(result).toEqual(expected);
  });

  test('reduce and 1 key with missing keys removed', () => {
    const expected = [{
      a: 1,
      b: 2,
    }, {
      a: 2,
    }];
    const result = reducer(input, map);
    expect(result).toEqual(expected);
  });
});

describe('ensure the reducer reduces', () => {
  const input = [];
  const map = [{
    a: Number,
    b: Number,
  }];

  test('reduce empty array with nothing in return', () => {
    const result = reducer(input, map);
    const expected = [];
    expect(result).toEqual(expected);
  });

  test('reduce empty array with 1 object with keys', () => {
    const result = reducer(input, map, { keepKeys: true });
    const expected = [{
      a: null,
      b: null
    }];
    expect(result).toEqual(expected);
  });
});
