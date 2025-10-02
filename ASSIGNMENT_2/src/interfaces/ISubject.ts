/**
 * ISubject.ts
 * Interface for implementing the Subject (Observable) in the Observer pattern
 * Defines the contract for objects that can be observed
 */

import { IObserver, IEventData } from './IObserver';

/**
 * Subject interface for the Observer pattern
 * Classes implementing this interface can be observed by IObserver instances
 */
export interface ISubject {
  /**
   * Attaches an observer to this subject
   * The observer will be notified of events
   * 
   * @param observer - The observer to attach
   * @returns True if successfully attached, false if already attached
   */
  attach(observer: IObserver): boolean;
  
  /**
   * Detaches an observer from this subject
   * The observer will no longer receive notifications
   * 
   * @param observer - The observer to detach
   * @returns True if successfully detached, false if not found
   */
  detach(observer: IObserver): boolean;
  
  /**
   * Notifies all attached observers of an event
   * Should handle errors gracefully if an observer fails
   * 
   * @param event - The type/name of the event
   * @param data - Additional data about the event
   */
  notify(event: string, data: IEventData): void;
  
  /**
   * Gets the count of attached observers
   * 
   * @returns Number of attached observers
   */
  getObserverCount?(): number;
  
  /**
   * Detaches all observers
   * Useful for cleanup or reset
   */
  detachAll?(): void;
  
  /**
   * Checks if a specific observer is attached
   * 
   * @param observer - The observer to check
   * @returns True if the observer is attached
   */
  hasObserver?(observer: IObserver): boolean;
  
  /**
   * Gets all attached observers
   * Should return a copy to prevent external modification
   * 
   * @returns Array of attached observers
   */
  getObservers?(): IObserver[];
  
  /**
   * Notifies observers asynchronously
   * Useful for non-blocking notifications
   * 
   * @param event - The type/name of the event
   * @param data - Additional data about the event
   * @returns Promise that resolves when all observers are notified
   */
  notifyAsync?(event: string, data: IEventData): Promise<void>;
}

/**
 * Extended subject interface with advanced features
 * Provides additional control over observer management
 */
export interface IAdvancedSubject extends ISubject {
  /**
   * Attaches an observer with priority
   * Higher priority observers are notified first
   * 
   * @param observer - The observer to attach
   * @param priority - Priority level (higher = earlier notification)
   */
  attachWithPriority(observer: IObserver, priority: number): boolean;
  
  /**
   * Pauses notifications to all observers
   * Events may be queued depending on implementation
   */
  pauseNotifications(): void;
  
  /**
   * Resumes notifications to all observers
   * May process queued events depending on implementation
   */
  resumeNotifications(): void;
  
  /**
   * Checks if notifications are currently paused
   * 
   * @returns True if notifications are paused
   */
  isNotificationsPaused(): boolean;
  
  /**
   * Sets a filter for events
   * Only events passing the filter will be notified
   * 
   * @param filter - Function that returns true for events to notify
   */
  setEventFilter(filter: (event: string) => boolean): void;
  
  /**
   * Clears any event filter
   */
  clearEventFilter(): void;
}

/**
 * Factory for creating event data objects
 * Ensures consistent structure
 */
export class EventDataFactory {
  /**
   * Creates a standard event data object
   * 
   * @param message - Optional message describing the event
   * @param data - Optional data payload
   * @param error - Optional error if applicable
   * @returns IEventData object
   */
  public static create(
    message?: string,
    data?: any,
    error?: Error
  ): IEventData {
    return {
      timestamp: new Date(),
      message,
      data,
      error
    };
  }
  
  /**
   * Creates an error event data object
   * 
   * @param error - The error that occurred
   * @param message - Optional additional message
   * @returns IEventData object
   */
  public static createError(error: Error, message?: string): IEventData {
    return {
      timestamp: new Date(),
      message: message || error.message,
      error,
      data: {
        errorName: error.name,
        errorStack: error.stack
      }
    };
  }
  
  /**
   * Creates a success event data object
   * 
   * @param message - Success message
   * @param data - Optional data payload
   * @returns IEventData object
   */
  public static createSuccess(message: string, data?: any): IEventData {
    return {
      timestamp: new Date(),
      message,
      data
    };
  }
}

/**
 * Base implementation helper for subjects
 * Can be extended by concrete subject classes
 */
export abstract class BaseSubject implements ISubject {
  protected observers: Map<IObserver, number> = new Map(); // Observer -> Priority
  protected isPaused: boolean = false;
  protected eventQueue: Array<{ event: string; data: IEventData }> = [];
  
  public attach(observer: IObserver): boolean {
    if (this.observers.has(observer)) {
      return false;
    }
    this.observers.set(observer, 0); // Default priority
    return true;
  }
  
  public detach(observer: IObserver): boolean {
    return this.observers.delete(observer);
  }
  
  public notify(event: string, data: IEventData): void {
    if (this.isPaused) {
      this.eventQueue.push({ event, data });
      return;
    }
    
    // Sort observers by priority (higher first)
    const sortedObservers = Array.from(this.observers.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([observer]) => observer);
    
    for (const observer of sortedObservers) {
      try {
        if (observer.isInterestedIn && !observer.isInterestedIn(event)) {
          continue;
        }
        observer.update(event, data);
      } catch (error) {
        console.error(`Observer ${observer.getName?.() || 'Unknown'} failed:`, error);
      }
    }
  }
  
  public getObserverCount(): number {
    return this.observers.size;
  }
  
  public detachAll(): void {
    this.observers.clear();
  }
  
  public hasObserver(observer: IObserver): boolean {
    return this.observers.has(observer);
  }
  
  public getObservers(): IObserver[] {
    return Array.from(this.observers.keys());
  }
}