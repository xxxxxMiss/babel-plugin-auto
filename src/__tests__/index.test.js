import * as babel from '@babel/core'
import plugin from '../'

const str = `
import styles from 'index.less'

const x = {
  o: cx('name')
}
cx('hello-world')
const y = cx('test')
`

test('should works', () => {
  const { code } = babel.transform(str, {
    plugins: [plugin],
    parserOpts: {
      plugins: ['jsx'],
    },
  })
  expect(code).toMatchSnapshot()
})
