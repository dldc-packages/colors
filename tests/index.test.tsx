import { expect, test } from 'vitest';
import { InterpolatedColor } from '../src/mod';

const range = (size: number) => new Array(size).fill(null).map((_, i) => i);

test('create a linear curve', () => {
  const curve = InterpolatedColor([
    [0, '#000000'],
    [1, '#ffffff'],
  ]);
  expect(
    range(10)
      .map((v) => v / 10)
      .map((v) => curve(v)),
  ).toEqual([
    '#000000',
    '#1A1A1A',
    '#333333',
    '#4D4D4D',
    '#666666',
    '#808080',
    '#999999',
    '#B3B3B3',
    '#CCCCCC',
    '#E6E6E6',
  ]);
});

test('create a curve', () => {
  const curve = InterpolatedColor([
    [0, '#000000'],
    [50, '#ffffff'],
    [100, '#000000'],
  ]);
  expect(
    range(10)
      .map((v) => 10 * v)
      .map((v) => curve(v)),
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
  expect(gradient(0)).toEqual('#FF0000');
  expect(gradient(30)).toEqual('#0000FF');
  expect(gradient(100)).toEqual('#008000');
  expect(gradient(55)).toEqual('#00A0D4');
  expect(gradient(55.5)).toEqual('#00A2D3');
});

test('Material Blue', () => {
  const color = InterpolatedColor([
    [0, '#ffffff'],
    [50, '#E3F2FD'],
    [100, '#BBDEFB'],
    [200, '#90CAF9'],
    [300, '#64B5F6'],
    [400, '#42A5F5'],
    [500, '#2196F3'],
    [600, '#1E88E5'],
    [700, '#1976D2'],
    [800, '#1565C0'],
    [900, '#0D47A1'],
    [1000, '#000000'],
  ]);
  expect(color(500)).toEqual('#2196F3');
});
