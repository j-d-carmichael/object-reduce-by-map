# object-reduce-by-map

Recursively reduce an object to match a given map, plus config options, 1 js file (with types)

https://www.npmjs.com/package/object-reduce-by-map

Supports CommonJS and ESM, see the instal and usage guide.

Full docs: [Docs: Object Reduce By Map](https://j-d-carmichael.github.io/object-reduce-by-map).


## Example:

A real world use case here is as a middleware in ExpressJS, the middleware would ensure the output does not contain data it should not output.

It can be considered an accidental safety net.

```typescript
// A map (typically auto generated from an OpenAPI scec):
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

// A payload generated from a database query or similar
const input = {
  This_Should_Not_Be_In_The_Output: 'the api should not deliver this content',
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

// The test case here is asserting that the "This_Should_Not_Be_In_The_Output" attribute in the object is stripped
// When used in an output transformer for an API this is a safety net preventing accidental data leakage 
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

```
