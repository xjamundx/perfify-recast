var perfify = require('../');
var recast = require('recast');
var fs = require('fs');
var assert = require('assert');

// first test: basic perfifying
var code = fs.readFileSync('./fixtures/index.js', 'utf-8');
var expected = fs.readFileSync('./fixtures/index.expected.js', 'utf-8');
var ast = recast.parse(code);
var faster = perfify(ast);
var output = recast.print(faster).code;
console.log(output);
assert.equal(output, expected);