import {useCallback} from 'react'

import {useDialogStateControlContext} from '@/state/dialogs'
import {useModalControls} from './modals'
import {useSetDrawerOpen} from './shell/drawer-open'

/**
 * returns true if something was closed
 * (used by the android hardware back btn)
 */
export function useCloseAnyActiveElement() {
  const {closeModal} = useModalControls()
  const {closeAllDialogs} = useDialogStateControlContext()
  const setDrawerOpen = useSetDrawerOpen()
  return useCallback(() => {
    if (closeModal()) {
      return true
    }
    if (closeAllDialogs()) {
      return true
    }
    setDrawerOpen(false)
    return false
  }, [closeModal, setDrawerOpen, closeAllDialogs])
}

/**
 * used to clear out any modals, eg for a navigation
 */
export function useCloseAllActiveElements() {
  const {closeAllModals} = useModalControls()
  const {closeAllDialogs: closeAlfDialogs} = useDialogStateControlContext()
  const setDrawerOpen = useSetDrawerOpen()
  return useCallback(() => {
    closeAllModals()
    closeAlfDialogs()
    setDrawerOpen(false)
  }, [
    closeAllModals,
    closeAlfDialogs,
    setDrawerOpen,
  ])
}
