/**
 * TaskPriority.ts
 * Defines the priority levels for tasks in the astronaut schedule
 */

/**
 * Enum representing the priority levels of tasks
 * Used throughout the application to categorize task importance
 */
export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

/**
 * Parses a string value to TaskPriority enum
 * Case-insensitive parsing for user convenience
 * 
 * @param priority - String representation of priority
 * @returns TaskPriority enum value
 * @throws Error if the priority string is invalid
 */
export function parseTaskPriority(priority: string): TaskPriority {
  const normalizedPriority = priority.toLowerCase().trim();
  
  switch (normalizedPriority) {
    case 'low':
      return TaskPriority.LOW;
    case 'medium':
      return TaskPriority.MEDIUM;
    case 'high':
      return TaskPriority.HIGH;
    default:
      throw new Error(
        `Invalid priority: "${priority}". Valid options are: Low, Medium, High`
      );
  }
}

/**
 * Gets all available priority values as an array
 * Useful for displaying options to users
 * 
 * @returns Array of all TaskPriority values
 */
export function getAllPriorities(): TaskPriority[] {
  return Object.values(TaskPriority);
}

/**
 * Converts TaskPriority to a numeric value for sorting
 * Higher priority = higher numeric value
 * 
 * @param priority - TaskPriority to convert
 * @returns Numeric value (1-3)
 */
export function getPriorityWeight(priority: TaskPriority): number {
  switch (priority) {
    case TaskPriority.LOW:
      return 1;
    case TaskPriority.MEDIUM:
      return 2;
    case TaskPriority.HIGH:
      return 3;
    default:
      return 0;
  }
}

/**
 * Compares two priorities for sorting
 * 
 * @param a - First priority
 * @param b - Second priority
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
export function comparePriorities(a: TaskPriority, b: TaskPriority): number {
  return getPriorityWeight(b) - getPriorityWeight(a);
}