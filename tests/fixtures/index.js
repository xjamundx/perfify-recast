var a = [1, 2, 3];
var b = a.filter(function(n) {
	return n > 1;
}).map(function(k) {
	return k * 2;
});
