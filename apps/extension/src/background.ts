import { PENDING_KEY } from './selection'

const MENU_ID = 'quiverkit-open'

/*
 * The whole extension talks to pages through exactly one channel: the selection
 * text Chrome hands us on a context-menu click. No content script, no activeTab,
 * no host permissions — so the store listing carries no "can read your data on
 * the sites you visit" warning, and the privacy claim on the site stays true
 * word for word in the extension.
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Open in QuiverKit',
    contexts: ['selection'],
  })

  // Makes the toolbar icon open the panel by itself, with no round trip through
  // this worker — it still works when the worker has been shut down.
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return

  const selection = info.selectionText?.trim() ?? ''

  /*
   * Opening the panel has to happen in the same task as the user gesture, so it
   * goes first and the (awaited) storage write follows. Reversing these two
   * makes Chrome reject the open with "requires a user gesture".
   */
  if (tab?.windowId !== undefined) {
    void chrome.sidePanel.open({ windowId: tab.windowId })
  }

  if (selection !== '') {
    // Session storage: held in memory, never written to disk, gone when the
    // browser closes.
    void chrome.storage.session.set({ [PENDING_KEY]: selection })
  }
})
