// ==================== Interfaces (Interface Segregation Principle) ====================

interface ILearningModuleState {
  getStateName(): string;
  start(context: LearningModule): void;
  pause(context: LearningModule): void;
  resume(context: LearningModule): void;
  complete(context: LearningModule): void;
  fail(context: LearningModule): void;
  reset(context: LearningModule): void;
  displayStateInfo(): void;
}

interface ILearningProgress {
  completedLessons: number;
  totalLessons: number;
  currentScore: number;
  requiredScore: number;
  timeSpent: number;
  attempts: number;
}

interface ILesson {
  lessonId: string;
  lessonTitle: string;
  duration: number;
  isCompleted: boolean;
  score: number;
}

interface IAssessment {
  assessmentId: string;
  assessmentTitle: string;
  passingScore: number;
  maxAttempts: number;
  currentAttempt: number;
  score: number;
  isPassed: boolean;
}

// ==================== Learning Module Context ====================

class LearningModule {
  private state: ILearningModuleState;
  private moduleId: string;
  private moduleName: string;
  private studentName: string;
  private lessons: ILesson[];
  private assessment: IAssessment;
  private progress: ILearningProgress;
  private stateHistory: string[];

  constructor(moduleId: string, moduleName: string, studentName: string) {
    this.moduleId = moduleId;
    this.moduleName = moduleName;
    this.studentName = studentName;
    this.lessons = [];
    this.stateHistory = [];
    
    // Initialize with NotStarted state
    this.state = new NotStartedState();
    this.addToHistory(this.state.getStateName());

    // Initialize progress
    this.progress = {
      completedLessons: 0,
      totalLessons: 0,
      currentScore: 0,
      requiredScore: 70,
      timeSpent: 0,
      attempts: 1
    };

    // Initialize assessment
    this.assessment = {
      assessmentId: `ASSESS_${moduleId}`,
      assessmentTitle: `${moduleName} Final Assessment`,
      passingScore: 70,
      maxAttempts: 3,
      currentAttempt: 0,
      score: 0,
      isPassed: false
    };

    console.log(`[LearningModule] Created: ${this.moduleName} for student ${this.studentName}`);
  }

  // STATE PATTERN: Change state
  public setState(state: ILearningModuleState): void {
    console.log(`[LearningModule] State transition: ${this.state.getStateName()} → ${state.getStateName()}`);
    this.state = state;
    this.addToHistory(state.getStateName());
  }

  public getState(): ILearningModuleState {
    return this.state;
  }

  public getStateName(): string {
    return this.state.getStateName();
  }

  // Delegate state-specific behavior to current state
  public start(): void {
    this.state.start(this);
  }

  public pause(): void {
    this.state.pause(this);
  }

  public resume(): void {
    this.state.resume(this);
  }

  public complete(): void {
    this.state.complete(this);
  }

  public fail(): void {
    this.state.fail(this);
  }

  public reset(): void {
    this.state.reset(this);
  }

  // Module management methods
  public addLesson(lesson: ILesson): void {
    this.lessons.push(lesson);
    this.progress.totalLessons = this.lessons.length;
  }

  public completeLesson(lessonId: string, score: number): void {
    const lesson = this.lessons.find(l => l.lessonId === lessonId);
    
    if (lesson && !lesson.isCompleted) {
      lesson.isCompleted = true;
      lesson.score = score;
      this.progress.completedLessons++;
      this.progress.currentScore = this.calculateAverageScore();
      
      console.log(`[LearningModule] Lesson completed: ${lesson.lessonTitle} (Score: ${score}%)`);
      
      // Check if all lessons are completed
      if (this.progress.completedLessons === this.progress.totalLessons) {
        console.log('[LearningModule] All lessons completed! Ready for assessment.');
      }
    }
  }

  public takeAssessment(score: number): void {
    this.assessment.currentAttempt++;
    this.assessment.score = score;
    
    console.log(`\n[Assessment] Attempt ${this.assessment.currentAttempt}/${this.assessment.maxAttempts}`);
    console.log(`[Assessment] Score: ${score}% (Passing: ${this.assessment.passingScore}%)`);
    
    if (score >= this.assessment.passingScore) {
      this.assessment.isPassed = true;
      console.log('[Assessment] ✓ PASSED!');
      this.complete();
    } else {
      console.log('[Assessment] ✗ FAILED');
      
      if (this.assessment.currentAttempt >= this.assessment.maxAttempts) {
        console.log('[Assessment] Maximum attempts reached.');
        this.fail();
      } else {
        console.log(`[Assessment] ${this.assessment.maxAttempts - this.assessment.currentAttempt} attempt(s) remaining.`);
      }
    }
  }

  public getProgress(): ILearningProgress {
    return { ...this.progress };
  }

  public getAssessment(): IAssessment {
    return { ...this.assessment };
  }

  public getLessons(): ILesson[] {
    return [...this.lessons];
  }

  public getModuleInfo(): string {
    return `${this.moduleName} (${this.moduleId}) - Student: ${this.studentName}`;
  }

  public displayStatus(): void {
    console.log('\n========================================');
    console.log(`Module: ${this.moduleName}`);
    console.log(`Student: ${this.studentName}`);
    console.log(`Current State: ${this.state.getStateName()}`);
    console.log(`Progress: ${this.progress.completedLessons}/${this.progress.totalLessons} lessons`);
    console.log(`Average Score: ${this.progress.currentScore.toFixed(2)}%`);
    console.log(`Assessment Status: ${this.assessment.isPassed ? 'PASSED' : 'NOT PASSED'}`);
    console.log('========================================\n');
  }

  private calculateAverageScore(): number {
    const completedLessons = this.lessons.filter(l => l.isCompleted);
    
    if (completedLessons.length === 0) return 0;
    
    const totalScore = completedLessons.reduce((sum, lesson) => sum + lesson.score, 0);
    return totalScore / completedLessons.length;
  }

  private addToHistory(stateName: string): void {
    this.stateHistory.push(`${new Date().toLocaleTimeString()} - ${stateName}`);
  }

  public getStateHistory(): string[] {
    return [...this.stateHistory];
  }
}

// ==================== STATE PATTERN: Concrete States ====================

// State 1: Not Started
class NotStartedState implements ILearningModuleState {
  public getStateName(): string {
    return 'NOT_STARTED';
  }

  public start(context: LearningModule): void {
    console.log('[NotStartedState] Starting learning module...');
    context.setState(new InProgressState());
    console.log('[NotStartedState] ✓ Module started successfully!');
  }

  public pause(context: LearningModule): void {
    console.log('[NotStartedState] ✗ Cannot pause - module not started yet.');
  }

  public resume(context: LearningModule): void {
    console.log('[NotStartedState] ✗ Cannot resume - module not started yet.');
  }

  public complete(context: LearningModule): void {
    console.log('[NotStartedState] ✗ Cannot complete - module not started yet.');
  }

  public fail(context: LearningModule): void {
    console.log('[NotStartedState] ✗ Cannot fail - module not started yet.');
  }

  public reset(context: LearningModule): void {
    console.log('[NotStartedState] Module is already in initial state.');
  }

  public displayStateInfo(): void {
    console.log('📝 State: NOT STARTED - Ready to begin learning');
  }
}

// State 2: In Progress
class InProgressState implements ILearningModuleState {
  public getStateName(): string {
    return 'IN_PROGRESS';
  }

  public start(context: LearningModule): void {
    console.log('[InProgressState] ✗ Module already in progress.');
  }

  public pause(context: LearningModule): void {
    console.log('[InProgressState] Pausing module...');
    context.setState(new PausedState());
    console.log('[InProgressState] ✓ Module paused.');
  }

  public resume(context: LearningModule): void {
    console.log('[InProgressState] ✗ Module is already active.');
  }

  public complete(context: LearningModule): void {
    const progress = context.getProgress();
    
    if (progress.completedLessons < progress.totalLessons) {
      console.log('[InProgressState] ✗ Cannot complete - not all lessons finished.');
      return;
    }

    console.log('[InProgressState] All lessons completed. Moving to assessment...');
    context.setState(new UnderAssessmentState());
  }

  public fail(context: LearningModule): void {
    console.log('[InProgressState] Module failed. Moving to failed state...');
    context.setState(new FailedState());
  }

  public reset(context: LearningModule): void {
    console.log('[InProgressState] Resetting module...');
    context.setState(new NotStartedState());
    console.log('[InProgressState] ✓ Module reset to initial state.');
  }

  public displayStateInfo(): void {
    console.log('📚 State: IN PROGRESS - Currently learning');
  }
}

// State 3: Paused
class PausedState implements ILearningModuleState {
  public getStateName(): string {
    return 'PAUSED';
  }

  public start(context: LearningModule): void {
    console.log('[PausedState] ✗ Module already started. Use resume to continue.');
  }

  public pause(context: LearningModule): void {
    console.log('[PausedState] ✗ Module is already paused.');
  }

  public resume(context: LearningModule): void {
    console.log('[PausedState] Resuming module...');
    context.setState(new InProgressState());
    console.log('[PausedState] ✓ Module resumed.');
  }

  public complete(context: LearningModule): void {
    console.log('[PausedState] ✗ Cannot complete while paused. Resume first.');
  }

  public fail(context: LearningModule): void {
    console.log('[PausedState] Module failed. Moving to failed state...');
    context.setState(new FailedState());
  }

  public reset(context: LearningModule): void {
    console.log('[PausedState] Resetting module...');
    context.setState(new NotStartedState());
    console.log('[PausedState] ✓ Module reset to initial state.');
  }

  public displayStateInfo(): void {
    console.log('⏸️  State: PAUSED - Learning temporarily suspended');
  }
}

// State 4: Under Assessment
class UnderAssessmentState implements ILearningModuleState {
  public getStateName(): string {
    return 'UNDER_ASSESSMENT';
  }

  public start(context: LearningModule): void {
    console.log('[UnderAssessmentState] ✗ Module already started and under assessment.');
  }

  public pause(context: LearningModule): void {
    console.log('[UnderAssessmentState] ✗ Cannot pause during assessment.');
  }

  public resume(context: LearningModule): void {
    console.log('[UnderAssessmentState] ✗ Assessment is already active.');
  }

  public complete(context: LearningModule): void {
    console.log('[UnderAssessmentState] Assessment passed! Completing module...');
    context.setState(new CompletedState());
    console.log('[UnderAssessmentState] ✓ Module completed successfully! 🎉');
  }

  public fail(context: LearningModule): void {
    console.log('[UnderAssessmentState] Assessment failed. Moving to failed state...');
    context.setState(new FailedState());
  }

  public reset(context: LearningModule): void {
    console.log('[UnderAssessmentState] Resetting module...');
    context.setState(new NotStartedState());
    console.log('[UnderAssessmentState] ✓ Module reset to initial state.');
  }

  public displayStateInfo(): void {
    console.log('📝 State: UNDER ASSESSMENT - Taking final exam');
  }
}

// State 5: Completed
class CompletedState implements ILearningModuleState {
  public getStateName(): string {
    return 'COMPLETED';
  }

  public start(context: LearningModule): void {
    console.log('[CompletedState] ✗ Module already completed.');
  }

  public pause(context: LearningModule): void {
    console.log('[CompletedState] ✗ Cannot pause - module is completed.');
  }

  public resume(context: LearningModule): void {
    console.log('[CompletedState] ✗ Cannot resume - module is completed.');
  }

  public complete(context: LearningModule): void {
    console.log('[CompletedState] ✗ Module already completed.');
  }

  public fail(context: LearningModule): void {
    console.log('[CompletedState] ✗ Cannot fail - module already completed.');
  }

  public reset(context: LearningModule): void {
    console.log('[CompletedState] Resetting completed module for retake...');
    context.setState(new NotStartedState());
    console.log('[CompletedState] ✓ Module reset for retake.');
  }

  public displayStateInfo(): void {
    console.log('✅ State: COMPLETED - Module successfully finished!');
  }
}

// State 6: Failed
class FailedState implements ILearningModuleState {
  public getStateName(): string {
    return 'FAILED';
  }

  public start(context: LearningModule): void {
    console.log('[FailedState] ✗ Module has failed. Reset to start again.');
  }

  public pause(context: LearningModule): void {
    console.log('[FailedState] ✗ Cannot pause - module has failed.');
  }

  public resume(context: LearningModule): void {
    console.log('[FailedState] ✗ Cannot resume - module has failed.');
  }

  public complete(context: LearningModule): void {
    console.log('[FailedState] ✗ Cannot complete - module has failed.');
  }

  public fail(context: LearningModule): void {
    console.log('[FailedState] ✗ Module already failed.');
  }

  public reset(context: LearningModule): void {
    console.log('[FailedState] Resetting failed module for retry...');
    context.setState(new NotStartedState());
    console.log('[FailedState] ✓ Module reset. You can try again!');
  }

  public displayStateInfo(): void {
    console.log('❌ State: FAILED - Module not completed. Reset to retry.');
  }
}

// ==================== Usage Example ====================

console.log('=== State Pattern Demo: Automated Learning Module Workflow ===\n');

// Create learning module
const learningmodule = new LearningModule(
  'MOD_001',
  'Introduction to TypeScript',
  'John Doe'
);

// Add lessons to the module
console.log('\n--- Adding Lessons ---\n');

learningmodule.addLesson({
  lessonId: 'LESSON_001',
  lessonTitle: 'TypeScript Basics',
  duration: 30,
  isCompleted: false,
  score: 0
});

learningmodule.addLesson({
  lessonId: 'LESSON_002',
  lessonTitle: 'Classes and Interfaces',
  duration: 45,
  isCompleted: false,
  score: 0
});

learningmodule.addLesson({
  lessonId: 'LESSON_003',
  lessonTitle: 'Advanced Types',
  duration: 60,
  isCompleted: false,
  score: 0
});

// Display initial status
learningmodule.displayStatus();

// TEST CASE 1: Start the module
console.log('\n========== TEST CASE 1: Start Module ==========\n');
learningmodule.start();
learningmodule.displayStatus();

// TEST CASE 2: Try to start again (invalid)
console.log('\n========== TEST CASE 2: Try Starting Again ==========\n');
learningmodule.start();

// TEST CASE 3: Pause the module
console.log('\n========== TEST CASE 3: Pause Module ==========\n');
learningmodule.pause();
learningmodule.displayStatus();

// TEST CASE 4: Resume the module
console.log('\n========== TEST CASE 4: Resume Module ==========\n');
learningmodule.resume();
learningmodule.displayStatus();

// TEST CASE 5: Complete lessons
console.log('\n========== TEST CASE 5: Complete Lessons ==========\n');
learningmodule.completeLesson('LESSON_001', 85);
learningmodule.completeLesson('LESSON_002', 92);
learningmodule.completeLesson('LESSON_003', 88);
learningmodule.displayStatus();

// TEST CASE 6: Move to assessment
console.log('\n========== TEST CASE 6: Move to Assessment ==========\n');
learningmodule.complete();
learningmodule.displayStatus();

// TEST CASE 7: Fail assessment (first attempt)
console.log('\n========== TEST CASE 7: Take Assessment (Fail) ==========\n');
learningmodule.takeAssessment(65);
learningmodule.displayStatus();

// TEST CASE 8: Fail assessment (second attempt)
console.log('\n========== TEST CASE 8: Take Assessment (Fail Again) ==========\n');
learningmodule.takeAssessment(68);
learningmodule.displayStatus();

// TEST CASE 9: Pass assessment (third attempt)
console.log('\n========== TEST CASE 9: Take Assessment (Pass) ==========\n');
learningmodule.takeAssessment(78);
learningmodule.displayStatus();

// TEST CASE 10: Try operations on completed module
console.log('\n========== TEST CASE 10: Operations on Completed Module ==========\n');
learningmodule.start();
learningmodule.pause();
learningmodule.complete();

// Display state history
console.log('\n========== State History ==========\n');
const history = learningmodule.getStateHistory();
history.forEach((entry, index) => {
  console.log(`${index + 1}. ${entry}`);
});

// TEST CASE 11: Create new module with failed scenario
console.log('\n\n========== TEST CASE 11: Failed Module Scenario ==========\n');

const module2 = new LearningModule(
  'MOD_002',
  'Advanced JavaScript',
  'Jane Smith'
);

module2.addLesson({
  lessonId: 'LESSON_101',
  lessonTitle: 'Closures',
  duration: 40,
  isCompleted: false,
  score: 0
});

module2.start();
module2.completeLesson('LESSON_101', 75);
module2.complete();

// Fail all assessment attempts
console.log('\nAttempting assessment (will fail all 3 times):\n');
module2.takeAssessment(60);
module2.takeAssessment(65);
module2.takeAssessment(68);

module2.displayStatus();

// Reset failed module
console.log('\n========== Resetting Failed Module ==========\n');
module2.reset();
module2.displayStatus();