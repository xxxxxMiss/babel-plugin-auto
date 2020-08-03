import { extname } from 'path'

const CSS_EXTNAMES = ['.css', '.less', '.sass', '.scss', '.stylus', '.styl']

function constructImportDeclaration(t) {
  return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier('classNames'))],
    t.stringLiteral('classnames/bind'),
  )
}

function constructVariableDeclaration(t) {
  return t.variableDeclaration('var', [
    t.VariableDeclarator(
      t.identifier('cx'),
      t.callExpression(
        t.memberExpression(t.identifier('classNames'), t.identifier('bind')),
        [t.identifier('styles')],
      ),
    ),
  ])
}

export default function ({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const { specifiers, source } = path.node

        if (specifiers.length && CSS_EXTNAMES.includes(extname(source.value))) {
          path.insertAfter(constructImportDeclaration(t))
          const variable = constructVariableDeclaration(t)
          state.var = variable
          path.insertAfter(variable)
          const programPath = path.findParent(p => {
            return p.isProgram()
          })
          if (!programPath.scope.hasBinding('cx')) {
            programPath.scope.push(state.var.declarations[0])
            const node = programPath.scope.getBinding('cx').path.node
            state.node = node
          }
        }
      },

      CallExpression(path, state) {
        const { callee, arguments: args } = path.node
        if (callee.name === 'cx') {
          path.replaceWith(t.callExpression(state.node.init, args))
        }
      },

      ExpressionStatement(path, state) {
        const { expression } = path.node
        if (t.isCallExpression(expression) && expression.callee.name === 'cx') {
          path.replaceWith(
            t.ExpressionStatement(
              t.callExpression(state.node.init, expression.arguments),
            ),
          )
        }
      },

      VariableDeclaration(path, state) {
        const { declarations } = path.node
        const target = declarations[0]
        if (
          target &&
          target.init &&
          target.init.callee &&
          target.init.callee.name === 'cx'
        ) {
          target.init = t.callExpression(state.node.init, target.init.arguments)
        }
      },
    },
  }
}
