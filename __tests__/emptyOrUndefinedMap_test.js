const reducer = require('../src/reducer');

const map = {};

const input = {
  name: 'bob',
  age: 537
};

it('should return the object unaffected with a map of no keys', async () => {
  expect(reducer(input, map, { permitEmptyMap: true })).toEqual(input);
});

it('should return the object empty when the option is not passed', async () => {
  expect(reducer(input, map, {})).toEqual({});
});

it('should return the object unaffected with a map of undefined', async () => {
  expect(reducer(input, undefined, { permitUndefinedMap: true })).toEqual(input);
});

it('should throw an error for undefined without express permission for undefined map', async (done) => {
  try {
    expect(reducer(input, undefined, {})).toEqual({});
    done('Should have thrown an error')
  } catch (e) {
    done();
  }
});