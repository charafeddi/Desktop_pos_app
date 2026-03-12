/**
 * Sanitize errors thrown from IPC handlers.
 *
 * In development the raw message is forwarded so developers can debug
 * quickly.  In production only a generic message is sent to the renderer
 * so internal schema / stack details are never exposed.
 */

const isDev = (process.env.NODE_ENV || 'development') === 'development';

/**
 * @param {unknown} error - The caught error
 * @param {string} [context] - Short label used in the server-side log (e.g. 'get-sales')
 * @returns {Error} - Safe error to throw out of the IPC handler
 */
function ipcError(error, context = 'IPC') {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${context}] Internal error:`, error);

  if (isDev) {
    return new Error(message);
  }
  return new Error('An internal error occurred. Please try again.');
}

module.exports = { ipcError };
