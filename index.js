var _ = require('lodash');
var recast = require('recast');
var Visitor = recast.Visitor;
var b = recast.types.builders;
var util = require('util');

module.exports = function(ast) {
//	console.log(util.inspect(ast, {depth:null}));
	return new Thing().visit(ast);
};

var z = 0,
	thebody,
	thei,
	ifStatement,
	blocks;

var Thing = Visitor.extend({
	visitCallExpression: function(ast) {
		var arg = ast.arguments[0];

		if (ast.callee.property.name ==='filter' && arg.type === 'FunctionExpression') {
			console.log('filter');
			arg.body.body.forEach(function(body, i) {
				if (body.type === 'ReturnStatement') {
					arg.body.body[i] = b.ifStatement(body.argument, mapBody);
				}
			});
		}

		if (ast.callee.property.name ==='map' && arg.type === 'FunctionExpression') {
			arg.body.body.forEach(function(body) {
				if (body.type === 'ReturnStatement') {
					mapBody = body;
				}
			});

			// ast.body = b.emptyStatement();
		}

		this.genericVisit(ast);
	},
	"visitFunctionExpression": function(ast) {
			console.log(util.inspect(ast, {depth:null}));
	},
	visitMemberExpression: function(ast) {

		if (ast.property.name === 'map') {
			// console.log('MAP', ast);
			// console.log(ast);
//			ast.property.name = "soup";
			// return "lkjasjklds";
		} else if (ast.property.name === 'filter') {
			ast.property.name = "forEach";
		}
		this.genericVisit(ast);
	}
});
