import * as babel from '@babel/core'
import plugin from '../'

const str = `
import styles from 'index.less'

const User = () => {
  return (
    <div className={cx('page-user')}>
      <span className={cx('user-logo')}></span>
    </div>
  )
}
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
