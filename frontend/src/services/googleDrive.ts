// Google Drive Upload Service

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let gapiInited = false;
let tokenClient: any = null;

// Initialize Google API
export const initGoogleDrive = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gapiInited) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      (window as any).gapi.load('client', async () => {
        try {
          await (window as any).gapi.client.init({
            apiKey: '', // Not needed for OAuth flow
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          });
          gapiInited = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Initialize Google Identity Services
export const initGoogleIdentity = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (tokenClient) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Set dynamically
      });
      resolve();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// Get or request access token
export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized'));
      return;
    }

    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(response);
        return;
      }
      resolve(response.access_token);
    };

    tokenClient.requestAccessToken({ prompt: '' });
  });
};

// Find or create folder
const findOrCreateFolder = async (
  parentId: string,
  folderName: string,
  accessToken: string
): Promise<string> => {
  const gapi = (window as any).gapi;

  // Search for existing folder
  const searchResponse = await gapi.client.drive.files.list({
    q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchResponse.result.files && searchResponse.result.files.length > 0) {
    return searchResponse.result.files[0].id;
  }

  // Create new folder
  const createResponse = await gapi.client.drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  return createResponse.result.id;
};

// Upload video to Google Drive with nested folder structure
export const uploadVideoToDrive = async (
  file: File,
  employeeName: string,
  date: string, // YYYY-MM-DD
  taskName: string,
  onProgress?: (progress: number) => void
): Promise<{ fileId: string; webViewLink: string; webContentLink: string }> => {
  try {
    // Initialize if needed
    await initGoogleDrive();
    await initGoogleIdentity();

    // Get access token
    const accessToken = await getAccessToken();
    (window as any).gapi.client.setToken({ access_token: accessToken });

    // Create folder structure: VietTeam > Employee > Date > Task
    const employeeFolderId = await findOrCreateFolder(FOLDER_ID, employeeName, accessToken);
    const dateFolderId = await findOrCreateFolder(employeeFolderId, date, accessToken);
    const taskFolderId = await findOrCreateFolder(dateFolderId, taskName, accessToken);

    // Upload file
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [taskFolderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const fileId = response.id;

          // Get shareable link
          const gapi = (window as any).gapi;
          const fileResponse = await gapi.client.drive.files.get({
            fileId: fileId,
            fields: 'webViewLink,webContentLink',
          });

          resolve({
            fileId,
            webViewLink: fileResponse.result.webViewLink,
            webContentLink: fileResponse.result.webContentLink,
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.send(form);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Delete video from Google Drive
export const deleteVideoFromDrive = async (fileId: string): Promise<void> => {
  try {
    await initGoogleDrive();
    await initGoogleIdentity();
    
    const accessToken = await getAccessToken();
    (window as any).gapi.client.setToken({ access_token: accessToken });

    const gapi = (window as any).gapi;
    await gapi.client.drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    console.error('Delete video error:', error);
    throw error;
  }
};

