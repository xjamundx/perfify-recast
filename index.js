var _ = require('lodash');
var recast = require('recast');
var Visitor = recast.Visitor;
var b = recast.types.builders;
var util = require('util');

module.exports = function(ast) {
//	console.log(util.inspect(ast, {depth:null}));
	return new Thing(ast).visit(ast);
};


/**
 * Helper function to determine if a statement is a return;
 */
function isReturn(body) {
	return body.type === 'ReturnStatement';
}

var Thing = Visitor.extend({

	init: function(ast) {
		this.body = ast && ast.program && ast.program.body;
	},

	// call expression
	// says: I'm calling a function
	visitCallExpression: function(ast) {

		// try to understand some important properties of this tree
		var callback = ast.arguments[0];
		var isMemberExpression = ast.callee.type === 'MemberExpression';
		var isFilter = ast.callee.property.name ==='filter';
		var isMap = ast.callee.property.name ==='map';
		var condition, ifStatement;

		// this is the callback function (if any exist)
		var isFunctionExpression = callback && (callback.type === 'FunctionExpression');

		// we only care about .map() called on something else (with a function expression)
		if (!isMap || !isFunctionExpression || !isMemberExpression) return;

		// replace the map with a push (which save out) and then just make the map return itself
		callback.body.body.filter(isReturn).forEach(function(body) {
			var push = b.callExpression(b.memberExpression(b.identifier('b'), b.identifier('push'), false), [body.argument]); // b.push
			this.mapAsAPush = b.expressionStatement(push);
		}, this);
		this.filter = ast.callee.object;

		// replace map with filter
		ast.type = this.filter.type;
		ast.callee = this.filter.callee;
		condition = this.filter.arguments[0].body.body[0].argument;
		ifStatement = ast.arguments[0].body.body[0] = b.ifStatement(condition, b.blockStatement([this.mapAsAPush]));

		// replace this whole thing with the if statement
		ast.type = ifStatement.type;
		ast.test = ifStatement.test;
		ast.consequent = ifStatement.consequent;

		this.genericVisit(ast);
	},

	// var a = b;
	visitVariableDeclarator: function(ast) {

		// if we're calling a member as part of the right-hand side of the declaration
		if (ast.init.type === 'CallExpression' && ast.init.callee.type === 'MemberExpression') {
			var memberName = ast.init.callee.property.name; // map
			var a = b.identifier(ast.init.callee.object.callee.object.name); // a
			var length = b.identifier('length');

			// and we're doing a map or a filter
			if (memberName === 'map' || memberName === 'filter') {
				// set the object to an empty array
				// add the rest of the expressions to the main body as their own statements

				// the hardest for loop you'll ever make
				var i = b.identifier('i'); // i
				var iequals0 = b.variableDeclaration('var', [b.variableDeclarator(i, b.literal(0))]); // var i = 0;
				var iplusplus = b.updateExpression('++', i, false); // i++
				var lessThanLength = b.binaryExpression('<', i, b.memberExpression(a, length, false)); // i < a.length

				// create the proper for statement
				this.body.push(b.forStatement(iequals0, lessThanLength, iplusplus, b.blockStatement([b.expressionStatement(ast.init)])));

				// run the rest of the AST through the processor
				new Thing().visit(this.body[this.body.length - 1]);

				// over-write this sub-tree
				ast.init = b.arrayExpression([]); // var b = [];
			}
		}
		this.genericVisit(ast);
	}
});
