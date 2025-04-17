// types/CustomError.mts

/**
 * Custom error class
 * @class
 * @property {string} message - The error message
 * @property {string} type - The error icon
 */
export default class CustomError {
    type: string;
    message: string;

    constructor(message: string, type: string) {
        this.type = type;
        this.message = message;
    }

    static fromError(error: { message: string; constructor: { name: string } }) {
        return new CustomError(error.message, error.constructor.name);
    }
}
