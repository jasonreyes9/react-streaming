export { useAsync }

import { useId } from 'react'
import { StreamUtils, useStream } from './useStream'
import { assert } from './utils'
import { stringify } from '@brillout/json-serializer/stringify'
import { InitData, initDataHtmlClass } from '../shared/initData'
import { useSuspense } from '../shared/useSuspense'
import { assertKey, stringifyKey } from '../shared/key'
import { useSuspenseData } from './useAsync/useSuspenseData'

function useAsync<T>(keyValue: unknown, asyncFn: () => Promise<T>): T {
  assertKey(keyValue)
  const key = stringifyKey(keyValue)
  const elementId = useId()

  const streamUtils = useStream()
  assert(streamUtils)

  const resolver = async () => {
    const value = await asyncFn()
    provideInitData(streamUtils, { key, value, elementId })
    return value
  }

  const suspenses = useSuspenseData()
  assert(suspenses)

  return useSuspense({ suspenses, resolver, key, elementId })
}

// See consumer `getInitData()`
function provideInitData(streamUtils: StreamUtils, initData: InitData) {
  const initDataSerialized = stringify(initData)
  const initDataInjection = `<script class="${initDataHtmlClass}" type="application/json">${initDataSerialized}</script>`
  streamUtils.injectToStream(initDataInjection)
}
