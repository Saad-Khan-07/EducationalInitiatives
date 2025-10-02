/**
 * IObserver.ts
 * Interface for implementing the Observer pattern
 * Defines the contract for objects that observe state changes
 */

/**
 * Event data structure passed to observers
 * Contains information about what happened and relevant data
 */
export interface IEventData {
  /**
   * Timestamp when the event occurred
   */
  timestamp: Date;
  
  /**
   * Optional message describing the event
   */
  message?: string;
  
  /**
   * Optional data payload specific to the event type
   */
  data?: any;
  
  /**
   * Optional error if the event represents an error condition
   */
  error?: Error;

  context?: any;

  isError?: boolean;
}

/**
 * Observer interface for the Observer pattern
 * Classes implementing this interface can observe and react to events
 */
export interface IObserver {
  /**
   * Called when an observed event occurs
   * Implementations should handle the event appropriately
   * 
   * @param event - The type/name of the event that occurred
   * @param data - Additional data about the event
   */
  update(event: string, data: IEventData): void;
  
  /**
   * Optional: Get the name/identifier of this observer
   * Useful for logging and debugging
   * 
   * @returns Name or identifier of the observer
   */
  getName?(): string;
  
  /**
   * Optional: Check if this observer is interested in a specific event
   * Allows for selective event handling
   * 
   * @param event - The event type to check
   * @returns True if the observer wants to handle this event
   */
  isInterestedIn?(event: string): boolean;
}

/**
 * Enum of standard event types in the application
 * Provides type safety for event names
 */
export enum ScheduleEvent {
  // Task lifecycle events
  TASK_ADDED = 'TASK_ADDED',
  TASK_REMOVED = 'TASK_REMOVED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  
  // Conflict and validation events
  TASK_CONFLICT = 'TASK_CONFLICT',
  TASK_ADD_FAILED = 'TASK_ADD_FAILED',
  TASK_UPDATE_FAILED = 'TASK_UPDATE_FAILED',
  TASK_VALIDATION_FAILED = 'TASK_VALIDATION_FAILED',
  
  // Schedule-level events
  SCHEDULE_CLEARED = 'SCHEDULE_CLEARED',
  SCHEDULE_IMPORTED = 'SCHEDULE_IMPORTED',
  SCHEDULE_EXPORTED = 'SCHEDULE_EXPORTED',
  
  // System events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
  SYSTEM_INFO = 'SYSTEM_INFO'
}

/**
 * Type-safe event handler function signature
 * Can be used for callback-style observers
 */
export type EventHandler = (event: string, data: IEventData) => void;

/**
 * Configuration for observer behavior
 * Can be used to customize how observers handle events
 */
export interface IObserverConfig {
  /**
   * List of events this observer is interested in
   * Empty array means interested in all events
   */
  interestedEvents?: ScheduleEvent[];
  
  /**
   * Whether to handle events asynchronously
   * Default is false (synchronous)
   */
  async?: boolean;
  
  /**
   * Priority for observer execution order
   * Higher numbers execute first
   */
  priority?: number;
  
  /**
   * Whether this observer should continue receiving events after an error
   * Default is true
   */
  continueOnError?: boolean;
}