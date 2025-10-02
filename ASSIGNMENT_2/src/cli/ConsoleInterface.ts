/**
 * src/cli/ConsoleInterface.ts
 *
 * CLI Interface Handler (Non-functional Requirement: Console Application).
 * This class handles all user input/output and coordinates logic by interacting
 * primarily with the ScheduleManager (Singleton). It ensures the application
 * continues to run without hardcoded while(true) loops.
 */
import * as readline from 'readline/promises';
import chalk from 'chalk';
import { ScheduleManager } from '../patterns/singleton/ScheduleManager';
import { TaskFactory } from '../patterns/factory/TaskFactory';
import { ConflictNotifier } from '../patterns/observer/ConflictNotifier';
import { TaskLogger } from '../patterns/observer/TaskLogger';
import { Task } from '../models/Task';
import { TaskPriority, parseTaskPriority } from '../models/TaskPriority';
import { Logger } from '../utils/Logger';
import { AppError, TaskNotFoundError } from '../utils/ErrorHandler';
import { TimeUtils } from '../utils/TimeUtils';

// Global Readline Interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * ConsoleInterface - The main user interaction layer (CLI).
 */
export class ConsoleInterface {
    // Inject all key components (Dependencies)
    private scheduleManager: ScheduleManager;
    private conflictNotifier: ConflictNotifier;
    private taskLogger: TaskLogger;

    constructor() {
        // 1. Initialize or get the Singleton instance
        this.scheduleManager = ScheduleManager.getInstance();
        
        // 2. Initialize Observers
        this.conflictNotifier = new ConflictNotifier(true, true); // For console alerts/success
        this.taskLogger = new TaskLogger(); // For file logging
        
        // 3. Attach observers to the Subject (ScheduleManager)
        this.scheduleManager.attach(this.conflictNotifier);
        this.scheduleManager.attach(this.taskLogger);
        
        Logger.info('Console Interface initialized and Observers attached.');
    }
    
    /**
     * Public method to start the console application.
     */
    public async start(): Promise<void> {
        this.displayWelcomeBanner();
        // Display the log file information message
        console.log(chalk.gray(Logger.getLogFileMessage()));
        
        // Start the main recursive menu loop
        await this.mainMenu();
        rl.close();
        Logger.info('Application gracefully closed.');
    }

    /**
     * Private method to display the main menu and handle input routing.
     * Uses recursion instead of a hard while(true) loop.
     */
    private async mainMenu(): Promise<void> {
        console.log(chalk.bold.cyan('\n--- Main Schedule Menu ---'));
        console.log(chalk.yellow('1. Add New Task (M)'));
        console.log('2. Remove Task (M)');
        console.log('3. View All Tasks (Sorted) (M)');
        console.log(chalk.green('4. Edit Existing Task (O)'));
        console.log(chalk.green('5. Mark Task as Completed (O)'));
        console.log(chalk.green('6. View Tasks by Priority (O)'));
        console.log(chalk.bold.red('7. Exit'));
        
        const choice = await rl.question(chalk.bold('\nEnter your choice (1-7): '));
        
        switch (choice.trim()) {
            case '1': await this.handleAddTask(); break;
            case '2': await this.handleRemoveTask(); break;
            case '3': await this.handleViewTasks(); break;
            case '4': await this.handleEditTask(); break;
            case '5': await this.handleMarkComplete(); break;
            case '6': await this.handleViewByPriority(); break;
            case '7': return; // Exit loop
            default:
                console.log(chalk.red.bold('Invalid choice. Please enter a number from 1 to 7.'));
        }
        
        // Recursively call the menu to continue the application
        await this.mainMenu();
    }
    
    /**
     * Handles adding a new task (Mandatory Requirement 1 & 4).
     * Uses TaskFactory and handles conflicts/exceptions.
     */
    private async handleAddTask(): Promise<void> {
        console.log(chalk.yellow('\n--- Add New Task ---'));
        try {
            const description = await rl.question('Description: ');
            const startTime = await rl.question('Start Time (HH:MM e.g., 07:00): ');
            const endTime = await rl.question('End Time (HH:MM e.g., 08:00): ');
            const priorityStr = await rl.question('Priority (Low, Medium, High): ');
            
            // 1. Creation and Initial Validation (Factory Pattern)
            // TaskFactory handles time/priority parsing and initial validation.
            const newTask = TaskFactory.createTask(description.trim(), startTime.trim(), endTime.trim(), priorityStr.trim());
            
            // 2. Add to Schedule Manager (handles overlap check)
            this.scheduleManager.addTask(newTask);
            
            // Success notification is handled by the ConflictNotifier Observer
            
        } catch (error) {
            this.handleUserError(error, 'Task addition failed');
        }
    }
    
    /**
     * Handles removing an existing task (Mandatory Requirement 2).
     */
    private async handleRemoveTask(): Promise<void> {
        console.log(chalk.yellow('\n--- Remove Task ---'));
        try {
            const description = await rl.question('Enter description of the task to remove: ');
            
            this.scheduleManager.removeTask(description.trim());
            
            // Success notification is handled by the ConflictNotifier Observer
            
        } catch (error) {
            this.handleUserError(error, 'Task removal failed');
        }
    }
    
    /**
     * Handles viewing all tasks, sorted by start time (Mandatory Requirement 3).
     */
    private async handleViewTasks(): Promise<void> {
        console.log(chalk.yellow('\n--- Daily Schedule (Sorted by Time) ---'));
        try {
            const tasks = this.scheduleManager.getAllTasks();
            
            if (tasks.length === 0) {
                console.log(chalk.yellow('No tasks scheduled for the day. (Negative Case 5)'));
                return;
            }
            
            tasks.forEach((task, index) => {
                console.log(this.formatTask(task, index + 1));
            });
            
        } catch (error) {
            this.handleUserError(error, 'Error viewing schedule');
        }
    }

    /**
     * Handles editing an existing task (Optional Requirement 1).
     */
    private async handleEditTask(): Promise<void> {
        console.log(chalk.green('\n--- Edit Task ---'));
        try {
            const oldDescription = await rl.question('Enter description of the task to EDIT: ');
            const taskToEdit = this.scheduleManager.getTaskByDescription(oldDescription.trim());

            if (!taskToEdit) {
                throw new TaskNotFoundError(`Task with description "${oldDescription}" not found.`);
            }

            console.log(`\nEditing Task: ${chalk.cyan(taskToEdit.description)} (ID: ${taskToEdit.id})`);

            // Use current value as default if user just presses Enter
            const newDescription = (await rl.question(`New Description (Current: ${taskToEdit.description}, Enter to skip): `)).trim();
            const newStartTimeStr = (await rl.question(`New Start Time (Current: ${taskToEdit.startTime}, Enter to skip): `)).trim();
            const newEndTimeStr = (await rl.question(`New End Time (Current: ${taskToEdit.endTime}, Enter to skip): `)).trim();
            const newPriorityStr = (await rl.question(`New Priority (Current: ${taskToEdit.priority}, Enter to skip): `)).trim();

            const updatedTask: Partial<Task> = { };

            // Apply updates only if provided, performing necessary validation
            if (newDescription) updatedTask.description = newDescription;
            if (newStartTimeStr) {
                TimeUtils.validateTimeFormat(newStartTimeStr); // Validate format before using
                updatedTask.startTime = newStartTimeStr;
            }
            if (newEndTimeStr) {
                TimeUtils.validateTimeFormat(newEndTimeStr);
                updatedTask.endTime = newEndTimeStr;
            }
            if (newPriorityStr) {
                updatedTask.priority = parseTaskPriority(newPriorityStr);
            }
            
            // The ScheduleManager handles the actual update and conflict check
            this.scheduleManager.updateTask(taskToEdit.id, updatedTask);
            
        } catch (error) {
            this.handleUserError(error, 'Task editing failed');
        }
    }

    /**
     * Handles marking a task as completed (Optional Requirement 2).
     */
    private async handleMarkComplete(): Promise<void> {
        console.log(chalk.green('\n--- Mark Task Complete ---'));
        try {
            const description = await rl.question('Enter description of the task to mark completed: ');

            this.scheduleManager.markTaskCompleted(description.trim());
            // Success message handled by ConflictNotifier Observer

        } catch (error) {
            this.handleUserError(error, 'Operation failed to mark task complete');
        }
    }

    /**
     * Handles viewing tasks filtered by priority level (Optional Requirement 3).
     */
    private async handleViewByPriority(): Promise<void> {
        console.log(chalk.green('\n--- View Tasks by Priority ---'));
        try {
            const priorityStr = await rl.question('Enter Priority to filter by (Low, Medium, High): ');
            const priority = parseTaskPriority(priorityStr.trim());

            // Filtering is handled by the ScheduleManager
            const tasks = this.scheduleManager.getTasksByPriority(priority);

            if (tasks.length === 0) {
                console.log(chalk.yellow(`No tasks scheduled with ${priority} priority.`));
                return;
            }

            console.log(chalk.bold(`\nTasks with Priority: ${this.getPriorityColor(priority)(priority)}`));
            tasks.forEach((task, index) => {
                console.log(this.formatTask(task, index + 1));
            });
            
        } catch (error) {
            this.handleUserError(error, 'Error filtering tasks by priority');
        }
    }

    // --- Utility Methods ---

    /**
     * Displays the application welcome banner.
     */
    private displayWelcomeBanner(): void {
        console.log(chalk.blue.bold(`\n================================================`));
        console.log(chalk.blue.bold(`= ${chalk.yellow.bold('ASTRO SCHEDULER')} | Mission Control Edition =`));
        console.log(chalk.blue.bold(`================================================`));
        console.log(chalk.white('Design Patterns: Singleton, Factory, Observer in use.'));
    }

    /**
     * Formats a single task object for clean display in the console.
     */
    private formatTask(task: Task, index?: number): string {
        const indexPrefix = index ? `${index}. ` : '• ';
        const priorityColor = this.getPriorityColor(task.priority);
        const status = task.completed ? chalk.strikethrough.magentaBright('[COMPLETED]') : chalk.cyan('[PENDING]');
        
        return (
            indexPrefix + 
            chalk.white.bold(`${task.startTime} - ${task.endTime}: `) +
            `${task.description} ` +
            priorityColor(`[${task.priority}]`) +
            ` ${status}`
        );
    }

    /**
     * Returns the appropriate chalk color function for a given priority level.
     */
    private getPriorityColor(priority: TaskPriority): chalk.Chalk {
        switch (priority) {
            case TaskPriority.HIGH: return chalk.red.bold;
            case TaskPriority.MEDIUM: return chalk.yellow.bold;
            case TaskPriority.LOW: return chalk.green;
            default: return chalk.white;
        }
    }

    /**
     * Central error handler for user-facing errors in the CLI. (Gold Standard)
     * Logs the error internally and provides a clean, user-friendly message.
     */
    private handleUserError(error: unknown, operationName: string): void {
        if (error instanceof AppError && error.isOperational) {
            // Operational errors (expected validation failures, conflicts)
            console.error(chalk.red.bold(`\n[ERROR] ${operationName}: ${error.message}`));
            Logger.warn(`${error.name}: ${error.message}`, { context: operationName });
        } else {
            // Unexpected system errors (Non-operational)
            const message = error instanceof Error ? error.message : 'An unknown and unexpected error occurred.';
            console.error(chalk.red.bgRed.bold(`\n[FATAL ERROR] System Failure: ${message}`));
            Logger.error(`Critical failure during ${operationName}`, error as Error);
        }
    }
}
