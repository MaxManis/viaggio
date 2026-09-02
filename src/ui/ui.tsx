import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type View = 'map' | 'list'
type UIState = {
  view: View
  setView: (v: View) => void
  isMobile: boolean
}

const MOBILE_QUERY = '(max-width: 720px)'
const UIContext = createContext<UIState>({ view: 'map', setView: () => {}, isMobile: false })

export const useUI = () => useContext(UIContext)

export function UIProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  const [view, setView] = useState<View>('map')

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return <UIContext.Provider value={{ view, setView, isMobile }}>{children}</UIContext.Provider>
}
