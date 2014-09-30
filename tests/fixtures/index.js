var a = [1, 2, 3];
var b = a.filter(function(i) {
	return i > 1;
}).map(function(i) {
	return i * 2;
});
