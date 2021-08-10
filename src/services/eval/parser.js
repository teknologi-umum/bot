import * as esprima from 'esprima';
import { allowedBuiltInObjects, allowedProperties } from './constants.js';

export function isAllowed(ast, locals = []) {
  switch (ast.type) {
    case 'Program':
      if (ast.sourceType !== 'script') throw `Bukan program Javascript`;
      return ast.body.every((statement) => isAllowed(statement, locals));
    case 'ExpressionStatement':
      return isAllowed(ast.expression, locals);
    case 'NewExpression':
      if (ast.callee.type !== 'Identifier') throw `New expression hanya boleh menggunakan symbol yang jelas`;
      if (!allowedBuiltInObjects.has(ast.callee.name)) throw `Tidak boleh new ${ast.callee.name}`;
      return true;
    case 'BinaryExpression':
    case 'LogicalExpression':
      return isAllowed(ast.left, locals) && isAllowed(ast.right, locals);
    case 'UnaryExpression':
      return isAllowed(ast.argument, locals);
    case 'ConditionalExpression':
      return isAllowed(ast.test, locals) && isAllowed(ast.consequent, locals) && isAllowed(ast.alternate, locals);
    case 'ObjectExpression':
      return ast.properties.every((prop) => {
        if (prop.method) throw `Tidak boleh membuat method di dalam object`;
        if (prop.computed) throw `Tidak boleh membuat accessor di dalam object`;
        return isAllowed(prop.value);
      });
    case 'ArrayExpression':
      return ast.elements.every((element) => isAllowed(element, locals));
    case 'SpreadElement':
      return isAllowed(ast.argument, locals);
    case 'Literal':
      return true;
    case 'TemplateLiteral':
      return ast.expressions.every((expression) => isAllowed(expression, locals));
    case 'Identifier':
      if (allowedBuiltInObjects.has(ast.name) || locals.includes(ast.name)) {
        return true;
      } else {
        throw `Tidak boleh mengakses ${ast.name}`;
      }
    case 'CallExpression':
      if (ast.callee.type === 'MemberExpression') {
        switch (ast.callee.property.name) {
          // Allow arrow function expression only in higher order functions
          case 'every':
          case 'filter':
          case 'find':
          case 'findIndex':
          case 'flatMap':
          case 'forEach':
          case 'map':
          case 'reduce':
          case 'reduceRight':
          case 'some':
          case 'sort':
            return (
              isAllowed(ast.callee, locals) &&
              ast.arguments.every((arg) => {
                if (arg.type === 'ArrowFunctionExpression') {
                  return isAllowed(arg.body, [...locals, ...arg.params.map((param) => param.name)]);
                } else {
                  return isAllowed(arg, locals);
                }
              })
            );
        }
      }
      return isAllowed(ast.callee, locals) && ast.arguments.every((arg) => isAllowed(arg, locals));
    case 'MemberExpression':
      // No obfuscated code
      if (ast.computed) throw `Tidak boleh mengevaluasi ComputedMemberExpression`;
      if (ast.property.type !== 'Identifier') throw `Tidak boleh mengakses property dengan ${ast.property.type}`;

      // No meta programming
      switch (ast.property.name) {
        case 'constructor':
        case '__defineGetter__':
        case '__defineSetter__':
        case '__lookupGetter__':
        case '__lookupSetter__':
        case '__proto__':
          throw `Tidak boleh mengakses property ${ast.property.name}`;
      }

      if (ast.object.type === 'Identifier') {
        if (allowedBuiltInObjects.has(ast.object.name)) {
          if (allowedProperties.has(ast.property.name)) {
            return true;
          } else {
            throw `Tidak boleh mengakses ${ast.object.name}.${ast.property.name}`;
          }
        } else if (locals.includes(ast.object.name)) {
          return true;
        } else {
          throw `Tidak boleh mengakses ${ast.object.name}`;
        }
      } else {
        if (allowedProperties.has(ast.property.name)) {
          return isAllowed(ast.object, locals);
        } else {
          throw `Tidak boleh mengakses ${ast.property.name}`;
        }
      }
    default:
      throw `Tidak boleh mengevaluasi ${ast.type}`;
  }
}

export function safeEval(source) {
  let ast;
  try {
    ast = esprima.parse(source);
  } catch (err) {
    return `Error: ${err.description} at ${err.lineNumber}:${err.index}`;
  }
  try {
    if (isAllowed(ast)) {
      return JSON.stringify(eval(source), (name, val) =>
        typeof val === 'number' && (isNaN(val) || !isFinite(val)) ? val.toString() : val,
      );
    } else {
      return `Tidak bisa mengevaluasi code`;
    }
  } catch (err) {
    return err;
  }
}
