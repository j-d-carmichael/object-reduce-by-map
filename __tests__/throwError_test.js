import { describe, it, expect } from 'vitest';
import reducer from '../src/reducer';

describe('Reducer handling null values', () => {
  const map = {
    starts: Number,
    wins: Number,
    secondPlaces: Number,
    thirdPlaces: Number,
    topFives: Number,
    topFiveRatio: Number,
    mostRecentRank: {
      event: {
        locations: [{ country: String, city: String, timezone: String }],
      },
      rank: Number
    },
    bestRank: Number
  };

  const input = {
    thisShouldNotBeInTheOutput: null,
    starts: 0,
    wins: 0,
    secondPlaces: 0,
    thirdPlaces: 0,
    topFives: 0,
    topFiveRatio: null,
    mostRecentRank: {
      event: {
        locations: [{
          country: null
        }]
      }
    },
    bestRank: null
  };

  it('Should handle null leaf values ie remove them', () => {
    expect(reducer(input, map)).toEqual({
      starts: 0,
      wins: 0,
      secondPlaces: 0,
      thirdPlaces: 0,
      topFives: 0,
      mostRecentRank: {
        event: {
          locations: [{}]
        }
      },
    });
  });

  it('Should handle null leaf values but keep them in the output as null', () => {
    expect(reducer(input, map, { keepKeys: true })).toEqual({
      starts: 0,
      wins: 0,
      secondPlaces: 0,
      thirdPlaces: 0,
      topFives: 0,
      topFiveRatio: null,
      mostRecentRank: {
        event: {
          locations: [{
            city: null,
            country: null,
            timezone: null
          }]
        },
        rank: null
      },
      bestRank: null
    });
  });

  it('should not error when undefined passed with allow nullish', () => {
    expect(() => reducer(undefined, map, { allowNullish: true })).not.toThrow();
  });

  it('should not error when null passed with allow nullish', () => {
    expect(() => reducer(null, map, { allowNullish: true })).not.toThrow();
  });

  it('should throw an error when null is passed without allow nullish', () => {
    expect(() => reducer(null, map)).toThrow();
  });

  it('should throw an error when undefined is passed without allow nullish', () => {
    expect(() => reducer(undefined, map)).toThrow();
  });
});

describe('Test error throw', () => {
  const input = {
    a: 1,
    b: 2,
    c: 3,
  };
  const map = {
    a: Number,
    b: String,
  };

  it('Should throw an error', () => {
    expect(() => reducer(input, map, { throwErrorOnAlien: true })).toThrow();
  });

  it('Should not throw an error', () => {
    expect(() => reducer(input, map, { throwErrorOnAlien: false })).not.toThrow();
  });
});
