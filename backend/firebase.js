const admin = require('firebase-admin');
const serviceAccount = require('./Firebase-shiftEase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


module.exports = db;