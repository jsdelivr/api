function APIError(message, code) {
    this.name = 'APIError';
    this.message = message;
    this.code = code;
    this.stack = (new Error()).stack;
}
APIError.prototype = new Error;

module.exports = APIError;