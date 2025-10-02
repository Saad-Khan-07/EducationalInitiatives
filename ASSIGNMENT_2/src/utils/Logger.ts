/**
 * src/utils/Logger.ts
 * Implements the required Logging Mechanism (Gold Standard).
 * Uses a simplified console/file logger wrapper.
 */

// Import the Node.js built-in file system module
import * as fs from 'fs';
import * as path from 'path';

// Define the directory where logs will be stored (relative to the project root)
const LOG_DIR = path.join(process.cwd(), 'logs');

/**
 * Helper function to get the log file name for the current day.
 * Format: YYYY-MM-DD_logs.log
 */
const getDailyLogFilePath = (): string => {
    const date = new Date();
    // Gets YYYY-MM-DD
    const dateString = date.toISOString().split('T')[0]; 
    // NEW FORMAT: [date]_logs.log
    return path.join(LOG_DIR, `${dateString}_logs.log`); 
};

/**
 * Simple function to simulate structured logging and handle file output.
 */
const mockLog = (level: string, message: string, meta?: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    
    // Convert meta object to a string for display/file storage
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    
    const logEntry = `[${level.toUpperCase()}] ${timestamp} - ${message}${metaString}\n`;
    
    // 1. Log to console (REMOVED: Informational logging is now file-only.)
    // console.log(logEntry.trim());

    // 2. Log to file
    try {
        // Ensure the logs directory exists
        if (!fs.existsSync(LOG_DIR)) {
            fs.mkdirSync(LOG_DIR, { recursive: true });
        }

        const logFilePath = getDailyLogFilePath();
        
        // Append the log entry to the daily log file. 
        // { flag: 'a' } ensures that if the file exists, the new log is added to the end.
        fs.writeFileSync(logFilePath, logEntry, { flag: 'a' });

    } catch (err) {
        // Fallback: If file logging fails, log the error to the console (CRITICAL LOGGING ERROR ONLY)
        console.error(`[CRITICAL LOGGING ERROR] Could not write to log file: ${err instanceof Error ? err.message : String(err)}`);
    }
};

/**
 * LoggerService provides static logging methods for the application.
 * It acts as a wrapper (Facade) to allow easy centralized logging and swapping of libraries.
 */
class LoggerService {
    
    /**
     * Logs informational messages (e.g., successful operations, startup).
     */
    public info(message: string, meta?: Record<string, unknown>): void {
        mockLog('INFO', message, meta);
    }

    /**
     * Logs warning messages (e.g., non-fatal issues like schedule conflicts).
     */
    public warn(message: string, meta?: Record<string, unknown>): void {
        mockLog('WARN', message, meta);
    }

    /**
     * Logs error messages (e.g., exceptions, failed operations).
     * Includes stack trace if an Error object is provided.
     */
    public error(message: string, error?: Error, meta?: Record<string, unknown>): void {
        let errorDetails = '';
        if (error) {
            errorDetails = `\n  Error: ${error.name} - ${error.message}`;
            // NOTE: We log the full stack trace to the file for thorough debugging
            if (error.stack) {
                // Ensure stack formatting is correct for the log file
                errorDetails += `\n  Stack: ${error.stack.split('\n').join('\n  ')}`; 
            }
        }
        mockLog('ERROR', message + errorDetails, meta);
    }

    /**
     * Logs detailed debugging messages (usually disabled in production).
     */
    public debug(message: string, meta?: Record<string, unknown>): void {
        mockLog('DEBUG', message, meta);
    }

    /**
     * Helper method to log standard task operations.
     * @param operation - The type of operation (e.g., 'ADD', 'REMOVE').
     * @param taskDescription - The description of the task being operated on.
     */
    public logTaskOperation(operation: string, taskDescription: string): void {
        this.info(`${operation} operation successful for task: "${taskDescription}".`);
    }

    /**
     * Generates a user-friendly message indicating the log file path.
     * This is intended to be printed directly to the console by the CLI handler.
     */
    public getLogFileMessage(): string {
        const dateString = new Date().toISOString().split('T')[0];
        const logFileName = `${dateString}_logs.log`;
        return `To view the system logs, please look into today's log file: /logs/${logFileName}`;
    }
}

/**
 * Export a single, globally accessible instance of the LoggerService (Singleton pattern).
 * This is the central logging endpoint used throughout the application.
 */
export const Logger = new LoggerService();
