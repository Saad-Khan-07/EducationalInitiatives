/**
 * src/patterns/observer/ConflictNotifier.ts
 * OBSERVER PATTERN: Console notifications observer (Primary user feedback).
 * Displays colored messages in the console for various schedule events.
 */

// Assuming ICommon.ts contains IObserver, IEventData, and ScheduleEvent
// import { IObserver, IEventData, ScheduleEvent } from '../../interfaces/'; 
import { IObserver } from '../../interfaces/IObserver';
import { IEventData } from '../../interfaces/IObserver';
import { ScheduleEvent } from '../../interfaces/IObserver';
import { ITask } from '../../interfaces/ITask';
// import { ITask } from '../../models/Task';
import chalk from 'chalk';

/**
 * ConflictNotifier - Observer implementation
 * Provides real-time console notifications for schedule events.
 */
export class ConflictNotifier implements IObserver {
    private readonly name: string = 'ConflictNotifier';
    private showTimestamps: boolean;
    private useColors: boolean;
    private interestedEvents: Set<string>;

    /**
     * Constructor for ConflictNotifier
     * @param showTimestamps - Whether to include timestamps in messages
     * @param useColors - Whether to use colored output
     */
    constructor(showTimestamps: boolean = true, useColors: boolean = true) {
        this.showTimestamps = showTimestamps;
        this.useColors = useColors;
        
        // Define which events this notifier cares about
        this.interestedEvents = new Set([
            ScheduleEvent.TASK_ADDED,
            ScheduleEvent.TASK_REMOVED,
            ScheduleEvent.TASK_UPDATED,
            ScheduleEvent.TASK_COMPLETED,
            ScheduleEvent.TASK_CONFLICT,
            ScheduleEvent.TASK_ADD_FAILED,
            ScheduleEvent.TASK_UPDATE_FAILED,
            ScheduleEvent.TASK_VALIDATION_FAILED,
            ScheduleEvent.SCHEDULE_CLEARED,
            ScheduleEvent.SCHEDULE_IMPORTED,
            ScheduleEvent.SCHEDULE_EXPORTED,
        ]);
    }

    /**
     * Helper to check if this observer cares about the event.
     */
    public isInterestedIn(event: string): boolean {
        return this.interestedEvents.has(event);
    }

    /**
     * Helper to format the Date object into a readable time string.
     */
    private formatTimestamp(date: Date): string {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    /**
     * Helper to get colored text for task priority.
     */
    private getPriorityColor(priority: string): string {
        if (!this.useColors) return priority;
        
        switch (priority.toUpperCase()) {
            case 'CRITICAL':
                return chalk.bgMagenta.white.bold(priority);
            case 'HIGH':
                return chalk.bgRed.white.bold(priority);
            case 'MEDIUM':
                return chalk.bgYellow.black.bold(priority);
            case 'LOW':
                return chalk.bgGreen.white(priority);
            default:
                return priority;
        }
    }

    /**
     * Update method called when observed events occur
     * @param event - The event type
     * @param data - Event data
     */
    public update(event: string, data: IEventData): void {
        // Check if we're interested in this event
        if (!this.isInterestedIn(event)) {
            return;
        }

        const timestamp = this.showTimestamps 
            ? `[${this.formatTimestamp(data.timestamp)}] ` 
            : '';

        switch (event) {
            case ScheduleEvent.TASK_CONFLICT:
                this.notifyConflict(timestamp, data);
                break;
            
            case ScheduleEvent.TASK_ADDED:
                this.notifyTaskAdded(timestamp, data);
                break;
            
            case ScheduleEvent.TASK_REMOVED:
                this.notifyTaskRemoved(timestamp, data);
                break;
            
            case ScheduleEvent.TASK_UPDATED:
                this.notifyTaskUpdated(timestamp, data);
                break;
            
            case ScheduleEvent.TASK_COMPLETED:
                this.notifyTaskCompleted(timestamp, data);
                break;
            
            case ScheduleEvent.TASK_ADD_FAILED:
            case ScheduleEvent.TASK_UPDATE_FAILED:
            case ScheduleEvent.TASK_VALIDATION_FAILED:
                this.notifyError(timestamp, data);
                break;
            
            case ScheduleEvent.SCHEDULE_CLEARED:
            case ScheduleEvent.SCHEDULE_IMPORTED:
            case ScheduleEvent.SCHEDULE_EXPORTED:
                this.notifySystemInfo(timestamp, data);
                break;
        }
    }
    
    // --- Specific Notification Handlers ---

    private notifyConflict(timestamp: string, data: IEventData): void {
        const conflict: ITask | undefined = data.context?.conflictingTask;
        console.log(chalk.red.bold(`\n${timestamp}❌ CONFLICT DETECTED!`));
        console.log(chalk.red.bold(`   ${data.message}`));
        
        if (conflict) {
            console.log(chalk.red(`   → Conflicts with existing task:`));
            console.log(chalk.red(`     ${conflict.description} [${this.getPriorityColor(conflict.priority)}] (${conflict.startTime}-${conflict.endTime})`));
        }
        console.log(chalk.red.bold('   → Operation NOT completed.'));
    }

    private notifyTaskAdded(timestamp: string, data: IEventData): void {
        const task: ITask | undefined = data.context?.task;
        console.log(chalk.green.bold(`\n${timestamp}✅ Task Added Successfully.`));
        console.log(chalk.green(`   ${data.message}`));
        if (task) {
            console.log(chalk.green(`   → ${task.description} [${this.getPriorityColor(task.priority)}] (${task.startTime}-${task.endTime})`));
        }
    }
    
    private notifyTaskRemoved(timestamp: string, data: IEventData): void {
        console.log(chalk.yellow(`\n${timestamp}🗑️ Task Removed:`));
        console.log(chalk.yellow(`   ${data.message}`));
    }
    
    private notifyTaskUpdated(timestamp: string, data: IEventData): void {
        const task: ITask | undefined = data.context?.task;
        console.log(chalk.blue.bold(`\n${timestamp}📝 Task Updated:`));
        console.log(chalk.blue(`   ${data.message}`));
        if (task) {
            console.log(chalk.blue(`   → New Schedule: ${task.description} [${this.getPriorityColor(task.priority)}] (${task.startTime}-${task.endTime})`));
        }
    }

    private notifyTaskCompleted(timestamp: string, data: IEventData): void {
        const task: ITask | undefined = data.context?.task;
        console.log(chalk.magenta.bold(`\n${timestamp}🎉 Task Completed! Well done, Astronaut!`));
        console.log(chalk.magenta(`   ${data.message}`));
        if (task) {
            console.log(chalk.magenta(`   → ${task.description} is marked finished.`));
        }
    }

    private notifyError(timestamp: string, data: IEventData): void {
        console.log(chalk.red.bold(`\n${timestamp}🛑 OPERATION FAILED:`));
        console.log(chalk.red(`   ${data.message}`));
        if (data.context?.errorName) {
            console.log(chalk.red(`   → Error Type: ${data.context.errorName}`));
        }
    }

    private notifySystemInfo(timestamp: string, data: IEventData): void {
        console.log(chalk.cyan(`\n${timestamp}ℹ️ System Info:`));
        console.log(chalk.cyan(`   ${data.message}`));
    }
}
