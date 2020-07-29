import { extname } from 'path'

const CSS_EXTNAMES = ['.css', '.less', '.sass', '.scss', '.stylus', '.styl']

function constructImportDeclaration(t) {
  return t.importDeclaration(
    [t.importDefaultSpecifier(t.identifier('classNames'))],
    t.stringLiteral('classnames/bind'),
  )
}

function constructVariableDeclaration(t) {
  return t.variableDeclaration('const', [
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
        }
      },

      CallExpression(path, state) {
        const { callee, arguments: args } = path.node
        if (callee.name === 'cx') {
          const programPath = path.findParent(p => {
            return p.isProgram()
          })
          if (programPath && !programPath.scope.hasBinding('cx')) {
            programPath.scope.push(state.var.declarations[0])
            const cxnode = programPath.scope.getBinding('cx').path.node
            path.replaceWith(t.callExpression(cxnode.init, args))
          }
        }
      },
    },
  }
}
