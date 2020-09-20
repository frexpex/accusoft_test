const express = require('express');
const router = express.Router();
const joinPath = require('path').join;
const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);
const pas = require('../pas/pasRequest');
const { htmlValidator } = require('./../validators');

const renderIndexDoc = function(res, viewingSessionId, documentError) {
  res.render('index', {
    title: 'Hello PrizmDoc Viewer!',
    viewingSessionId,
    documentError,
  });
};

const uploadDocument = async function(res, displayName, body) {
  // 1. Create a new viewing session
  const prizmdocRes = await pas.post('/ViewingSession', {
    json: {
      source: {
        type: 'upload',
        displayName,
      }
    }
  });
  const { viewingSessionId } = prizmdocRes.body;

  // 2. Send the viewingSessionId and viewer assets to the browser right away so the viewer UI can start loading.
  renderIndexDoc(res, viewingSessionId, '');

  // 3. Upload the source document to PrizmDoc so that it can start being converted to SVG.
  //    The viewer will request this content and receive it automatically once it is ready.
  await pas.put(`/ViewingSession/u${viewingSessionId}/SourceFile`, {
    body,
  });
};

router.get('/', async (req, res /*, next*/) => {
  // No files uploaded, returning index page without viewing session id.
  renderIndexDoc(res, '', '');
});

router.post('/', async (req, res /*, next*/) => {
  if (!!req.files && !!req.files.fileToUpload) {
    const { fileToUpload } = req.files;

    if (req.files.fileToUpload.name.endsWith('.html')) {
      const documentError = htmlValidator(fileToUpload.data);

      if (documentError) {
        renderIndexDoc(res, '', documentError);
      } else {
        await uploadDocument(res, fileToUpload.name, fileToUpload.data);
      }
    } else {
      await uploadDocument(res, fileToUpload.name, fileToUpload.data);
    }
  } else {
    renderIndexDoc(res, '', '');
  }
});

module.exports = router;
