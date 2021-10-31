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