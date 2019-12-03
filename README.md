# InterpolatedColors

> A tool to create dynamic colors by interpolating multiple colors

## Gist

```ts
import InterpolatedColor from 'interpolated-colors';

const gradient = InterpolatedColor([
  [0, 'red'],
  [30, 'blue'],
  [100, 'green'],
]);

console.log(gradient(0)); // '#00FF00' => red
console.log(gradient(30)); // '#0000FF' => blue
console.log(gradient(100)); // '#008000' => green
console.log(gradient(55)); // '#0081D4' => between blue & green
console.log(gradient(55.5)); // '#0084D3' => a bit more green
```
