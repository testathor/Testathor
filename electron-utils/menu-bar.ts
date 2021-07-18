import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from 'electron';

// Edited version of a template menu-bar provided by the electron API,
// refer to https://electronjs.org/docs/api/menu for more information.
const fileMenu: MenuItemConstructorOptions = {
  label: 'File',
  submenu: [
    {
      label: 'Quit CATcher', accelerator: 'CmdOrCtrl+Q', click() { app.quit(); }
    }
  ]
};

const editMenu: MenuItemConstructorOptions = {
  label: 'Edit',
  submenu: [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'selectAll' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { role: 'delete' },
  ]
};

const viewMenu: MenuItemConstructorOptions = {
  label: 'View',
  submenu: [
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' }
  ]
};

export function createMenuOptions(isDevMode: boolean): MenuItemConstructorOptions[] {
  const mainMenuTemplate: MenuItemConstructorOptions[] = [fileMenu, editMenu, viewMenu];

  if (isDevMode) {
    let viewSubMenu: MenuItemConstructorOptions[];
    viewSubMenu = mainMenuTemplate[2].submenu as MenuItemConstructorOptions[];
    viewSubMenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools'}
    );
  }
  return mainMenuTemplate;
}

function createInspectElementMenuItem(contextMenuCoords: {x, y}): MenuItem {
   return new MenuItem({
    label: 'Inspect Element',
    click:  (menuItem, window, event) => {
      window.webContents.inspectElement(contextMenuCoords.x, contextMenuCoords.y);
    }
  });
}

/**
 * Creates a menu that is displayed when the context-menu event fires on the
 * given BrowserWindow (i.e. usually when user right-clicks on the window).
 * This menu will contain an 'Inspect Element' MenuItem.
 */
export function createContextMenu(win: BrowserWindow): void {
  const contextMenuCoords = {x: null, y: null};
  const contextMenu = new Menu();
  contextMenu.append(createInspectElementMenuItem(contextMenuCoords));

  win.webContents.on('context-menu',  (event, contextMenuParams) => {
    // record the mouse position, when context-menu event is fired
    contextMenuCoords.x = contextMenuParams.x;
    contextMenuCoords.y = contextMenuParams.y;
    contextMenu.popup({window: win});
  });
}
