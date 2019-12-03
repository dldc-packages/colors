import InterpolatedColor from '../src';

const range = (size: number) => new Array(size).fill(null).map((_, i) => i);

it('create a linear curve', () => {
  const curve = InterpolatedColor([
    [0, '#000000'],
    [1, '#ffffff'],
  ]);
  expect(
    range(10)
      .map(v => v / 10)
      .map(v => curve(v))
  ).toEqual([
    '#000000',
    '#191919',
    '#333333',
    '#4C4C4C',
    '#666666',
    '#808080',
    '#999999',
    '#B2B2B2',
    '#CCCCCC',
    '#E5E5E5',
  ]);
});

it('create a curve', () => {
  const curve = InterpolatedColor([
    [0, '#000000'],
    [50, '#ffffff'],
    [100, '#000000'],
  ]);
  expect(
    range(10)
      .map(v => 10 * v)
      .map(v => curve(v))
  ).toEqual([
    '#000000',
    '#3A3A3A',
    '#747474',
    '#ABABAB',
    '#DEDEDE',
    '#FFFFFF',
    '#DEDEDE',
    '#ABABAB',
    '#747474',
    '#3A3A3A',
  ]);
});

test('Gist', () => {
  const gradient = InterpolatedColor([
    [0, 'red'],
    [30, 'blue'],
    [100, 'green'],
  ]);
  expect(gradient(0)).toEqual('#00FF00');
  expect(gradient(30)).toEqual('#0000FF');
  expect(gradient(100)).toEqual('#008000');
  expect(gradient(55)).toEqual('#0081D4');
  expect(gradient(55.5)).toEqual('#0084D3');
});
