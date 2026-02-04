// Module 6: DOCUMENTS
// Generates KP, Presentation and sends to clients

export { documentsWorker, startDocumentsWorker, stopDocumentsWorker } from './worker';
export { generateKP } from './kp-generator';
export { generatePresentation } from './presentation-generator';
export { sendKPEmail, sendAdminNotification, sendEmail } from './email-sender';
