const reducer = require('../src/reducer')

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
}

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
}

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
  })
})
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
  })
})

it('should not error when undefined passed with allow nullish', (done) => {
  reducer(undefined, map, {
    allowNullish: true
  })
  done()
})

it('should not error when null passed with allow nullish', (done) => {
  reducer(null, map, {
    allowNullish: true
  })
  done()
})

it('should not error when null passed with allow nullish', (done) => {
  try {
    reducer(null, map)
    done('Should have errored')
  } catch (e) {
    done()
  }
})
it('should not error when null passed with allow nullish', (done) => {
  try {
    reducer(undefined, map)
    done('Should have errored')
  } catch (e) {
    done()
  }
})