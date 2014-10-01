A simple recast demo that tries to improve performance


Will transform `.filter().map()` into a plain old for-loop to improve performance without sacrificing readability.

Given:
```
var a = [1, 2, 3];
var b = a.filter(function(n) {
	return n > 1;
}).map(function(k) {
	return k * 2;
});

```

Should create:

```
var a = [1, 2, 3];
var b = [];
for (var i = 0; i < a.length; i++) {
	if (a[i] > 1) {
		b.push(a[i] * 2);
	}
}
```
