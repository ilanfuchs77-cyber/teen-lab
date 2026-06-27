const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

// Tell the server module not to auto-start; we start it ourselves below.
process.env.ELECTRON_APP = 'true'

// Where the built React frontend lives (vite build output). The server will
// serve these static files plus the /api routes on a single local port.
if (!process.env.CLIENT_DIR) {
  process.env.CLIENT_DIR = path.join(__dirname, '..', 'dist')
}

// The bundled Express server (built by `npm run build:server`).
const { startServer } = require(path.join(__dirname, '..', 'build', 'server.cjs'))

let mainWindow = null

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#020617',
    title: 'Teen Lab',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.loadURL(`http://localhost:${port}/`)

  // Open external links (http/https) in the user's real browser, not in-app.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost')) return { action: 'allow' }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    const port = await startServer()
    createWindow(port)
  } catch (err) {
    console.error('Failed to start Teen Lab server:', err)
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && mainWindow === null) {
      // macOS: re-create a window when the dock icon is clicked.
      startServer().then(createWindow)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
