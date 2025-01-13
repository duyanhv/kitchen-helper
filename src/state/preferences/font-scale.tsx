import React from 'react'

import * as persisted from '@/state/persisted'

type StateContext = number
type SetContext = (v: number) => void

const stateContext = React.createContext<StateContext>(
  Number(persisted.defaults.fontScale),
)
const setContext = React.createContext<SetContext>((_: number) => {})

export function Provider({children}: {children: React.ReactNode}) {
  const [state, setState] = React.useState(
    Number(persisted.get('fontScale')),
  )

  const setStateWrapped = React.useCallback(
    (fontScale: persisted.Schema['fontScale']) => {
      setState(Number(fontScale))
      persisted.write('fontScale', fontScale)
    },
    [setState],
  )

  React.useEffect(() => {
    return persisted.onUpdate('fontScale', nextFontScale => {
      setState(Number(nextFontScale))
    })
  }, [setStateWrapped])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export const useFontScale = () => React.useContext(stateContext)
export const useSetFontScale = () => React.useContext(setContext)
