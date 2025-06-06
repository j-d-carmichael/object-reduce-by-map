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

  it('should remove alien keys by default', () => {
    const result = reducer({
      validKey: 1,
      alienKey: 'alien'
    }, {
      validKey: Number
    });

    expect(result).toEqual({ validKey: 1 });
  });

  it('should throw an error for alien keys if throwErrorOnAlien is true', () => {
    expect(() =>
      reducer({
        validKey: 1,
        alienKey: 'alien'
      }, {
        validKey: Number
      }, { throwErrorOnAlien: true })
    ).toThrow('Alien entry found in object');
  });
});
