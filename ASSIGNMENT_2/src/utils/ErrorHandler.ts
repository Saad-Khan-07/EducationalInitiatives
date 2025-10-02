/**
 * src/utils/ErrorHandler.ts
 * Custom Error classes for controlled and graceful exception handling (Gold Standard).
 * Allows for specific error identification and separation of concerns.
 */

/**
 * Base abstract class for all custom application errors.
 * Ensures all custom errors inherit standard properties and behavior.
 */
export abstract class AppError extends Error {
    // isOperational flag: true for errors we expect and handle gracefully (e.g., validation failure)
    constructor(message: string, public isOperational = true) {
        super(message);
        this.name = this.constructor.name; // Set the name property to the class name
        // Set prototype explicitly for correct inheritance
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Error thrown when attempting to add a task that overlaps with an existing one.
 * Maps directly to Negative Case 1 and 4 in the problem description.
 */
export class TaskConflictError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'TaskConflictError';
    }
}

/**
 * Error thrown when a task or item to be removed or edited cannot be located.
 * Maps directly to Negative Case 2 in the problem description.
 */
export class TaskNotFoundError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'TaskNotFoundError';
    }
}

/**
 * Error thrown when a time string does not match the required HH:MM format.
 * Maps directly to Negative Case 3 in the problem description.
 */
export class InvalidTimeFormatError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTimeFormatError';
    }
}

/**
 * Error thrown when a time range is invalid (e.g., start time is after end time).
 */
export class InvalidTimeRangeError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTimeRangeError';
    }
}

/**
 * Error thrown when a task description is invalid (e.g., empty or null).
 */
export class InvalidTaskDescriptionError extends AppError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidTaskDescriptionError';
    }
}
