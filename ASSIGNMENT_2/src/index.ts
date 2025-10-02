/**
 * index.ts
 * Main application entry point for the Astronaut Daily Schedule Organizer (Exercise 1).
 *
 * Responsibilities:
 * 1. Initialize the application's core components (Singleton, Observers, CLI).
 * 2. Handle critical system startup and uncaught exceptions (Gold Standard).
 * 3. Start the main user interface loop.
 */
import { ConsoleInterface } from './cli/ConsoleInterface';
import { Logger } from './utils/Logger';
import { AppError } from './utils/ErrorHandler';
import chalk from 'chalk';

/**
 * Main application function.
 */
async function main(): Promise<void> {
    
    // --- Gold Standard: Uncaught Exception Handler ---
    // This ensures that any unexpected error anywhere in the program's event loop
    // is caught, logged, and the application exits gracefully.
    process.on('unhandledRejection', (reason, promise) => {
        Logger.error('UNHANDLED REJECTION detected:', reason instanceof Error ? reason : new Error(String(reason)));
        // In a real application, you might restart or try to recover, but here we exit cleanly.
        console.error(chalk.red.bgRed.bold('\n!!! CRITICAL UNHANDLED REJECTION !!! Check logs for details.'));
        process.exit(1);
    });

    process.on('uncaughtException', (error) => {
        Logger.error('UNCAUGHT EXCEPTION detected:', error);
        console.error(chalk.red.bgRed.bold('\n!!! CRITICAL UNCAUGHT EXCEPTION !!! System shutdown imminent.'));
        // Exit is necessary as the application state is corrupted
        process.exit(1);
    });
    // --------------------------------------------------

    Logger.info('Application startup sequence initiated.');

    try {
        // 1. Initialize ConsoleInterface. 
        // Note: The ConsoleInterface constructor handles the initialization/linking of 
        // ScheduleManager (Singleton) and Observers internally, simplifying the bootstrap here.
        const app = new ConsoleInterface();
        
        // 2. Start the main user interface loop
        await app.start();
        
    } catch (error) {
        // Handle critical system initialization errors (e.g., failed to connect to mock logger)
        console.error(chalk.red.bold('\n!!! CRITICAL SYSTEM INITIALIZATION FAILURE !!!'));
        
        if (error instanceof AppError) {
            console.error(`Error: ${error.message}`);
            Logger.error('App failed during setup (operational error):', error);
        } else {
            const genericError = error as Error;
            console.error(`Unexpected Error: ${genericError.message}`);
            Logger.error('App failed during setup (unexpected system error).', genericError);
        }
        
        // Exit with a failure code
        process.exit(1); 
    }
}

// Start the application
main();
