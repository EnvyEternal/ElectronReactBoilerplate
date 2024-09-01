import { app, BrowserWindow, ipcMain, BrowserView } from 'electron';
import path from 'path';
import fs from 'fs';
import { Highlight } from './types';

const highlightsFilePath = path.join(__dirname, '../highlights.json');

const loadHighlightsFromFile = (): Highlight[] => {
  try {
    return JSON.parse(fs.readFileSync(highlightsFilePath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const browserView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.addBrowserView(browserView);

  const setBrowserViewBounds = () => {
    mainWindow.webContents.executeJavaScript(`
      try {
        const rect = document.getElementById('webview-container').getBoundingClientRect();
        ({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
      } catch (error) {
        console.error('Error in setBrowserViewBounds:', error);
        throw error;
      }
    `).then((rect: { x: number, y: number, width: number, height: number }) => {
      browserView.setBounds({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width) - 2,
        height: Math.round(rect.height) - 2,
      });
    });
  };

  mainWindow.loadFile(path.join(__dirname, '../build/index.html'));

  setBrowserViewBounds();
  mainWindow.on('resize', setBrowserViewBounds);

  ipcMain.handle('load-highlights', () => loadHighlightsFromFile());

  ipcMain.on('save-highlight-from-page', (event, highlight) => {
    fs.writeFileSync(highlightsFilePath, JSON.stringify([...loadHighlightsFromFile(), highlight], null, 2));
    mainWindow.webContents.send('highlight-saved', highlight);
  });

  ipcMain.on('load-url', (event, url) => {
    browserView.webContents.loadURL(url).then(() => {

      browserView.webContents.executeJavaScript(`
        (function() {
          const saveButton = document.createElement('button');
          saveButton.innerText = 'Save Highlight';
          saveButton.style.position = 'fixed';
          saveButton.style.bottom = '10px';
          saveButton.style.right = '10px';
          saveButton.style.padding = '10px 20px';
          saveButton.style.backgroundColor = '#007bff';
          saveButton.style.color = 'white';
          saveButton.style.border = 'none';
          saveButton.style.borderRadius = '5px';
          saveButton.style.cursor = 'pointer';
          saveButton.style.display = 'none';
          document.body.appendChild(saveButton);

          document.addEventListener('selectionchange', () => {
            const selectedText = window.getSelection().toString();
            if (selectedText.trim()) {
              saveButton.style.display = 'block';
            } else {
              saveButton.style.display = 'none';
            }
          });

          saveButton.addEventListener('click', () => {
            const selectedText = window.getSelection().toString();
            if (selectedText.trim()) {
              const highlight = {
                text: selectedText,
                title: document.title,
                url: window.location.href
              };
               window.getSelection().removeAllRanges();
              window.electronAPI.sendEventToElectron('save-highlight-from-page', highlight);
            }
          });
        })();
      `);

      setBrowserViewBounds();
    });
  });
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => app.quit());

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
