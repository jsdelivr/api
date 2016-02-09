function ApiError (message, code) {
	this.name = 'APIError';
	this.message = message;
	this.code = code;
	this.stack = (new Error()).stack;
}

ApiError.prototype = new Error();

export default ApiError;
