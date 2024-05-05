# InterpolatedColors

> A tool to create dynamic colors by interpolating multiple colors

## Gist

```ts
import InterpolatedColor from "interpolated-colors";

const gradient = InterpolatedColor([
  [0, "red"],
  [30, "blue"],
  [100, "green"],
]);

console.log(gradient(0)); // #FF0000 => red
console.log(gradient(30)); // #0000FF => blue
console.log(gradient(100)); // #008000 => green
console.log(gradient(55)); // #00A0D4 => between blue and green
console.log(gradient(55.5)); // #00A2D3 => a bit more geen
```
