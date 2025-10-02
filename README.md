# 📚 Design Patterns Assignments Repository

This repository contains two assignments demonstrating the implementation of various design patterns in TypeScript:

## 📂 Repository Structure

```
design-patterns-repo/
├── assignment1/           # Design Pattern Examples
│   ├── behavioral/       # 2 examples each
│   ├── creational/       # 2 examples each
│   └── structural/       # 2 examples each
└── assignment2/           # Astro Scheduler Application
    └── astro-scheduler/
```

---

## 📖 Assignment 1: Design Pattern Examples

Assignment 1 contains practical implementations of design patterns across three categories:

### Behavioral Patterns (2 examples)
- Implementation of patterns that focus on communication between objects and the assignment of responsibilities

### Creational Patterns (2 examples)  
- Implementation of patterns that deal with object creation mechanisms

### Structural Patterns (2 examples)
- Implementation of patterns that deal with object composition and relationships

Each pattern includes a working example with clear documentation explaining the use case and implementation details.

---

## 🚀 Assignment 2: Astro Scheduler - Mission Control Edition

The Astro Scheduler is a high-reliability Command Line Interface (CLI) application designed to help a single astronaut manage their critical daily schedule. It strictly enforces time management rules—such as preventing overlapping tasks—by utilizing robust software design patterns and gold-standard error handling for clean, maintainable, and reliable operation.

## ⚙️ Setup and Installation

Follow these steps to get the Astro Scheduler running on your local machine.

### Prerequisites

* **Node.js:** Ensure you have Node.js (version 16 or higher is recommended) installed.
  - Verify installation: `node --version`
* **npm or yarn:** A package manager (npm is included with Node.js).
  - Verify installation: `npm --version`
* **TypeScript:** This project uses TypeScript, which will be installed as a dependency.

### Installation Steps

1. **Clone the Repository:**
```bash
git clone https://github.com/your-username/design-patterns-repo.git
cd design-patterns-repo
```

2. **Navigate to Assignment 2 (Astro Scheduler):**
```bash
cd assignment2/astro-scheduler
```

3. **Install Dependencies:**
Install all necessary packages, including TypeScript, ts-node runtime, and the chalk library for colorful output.
```bash
npm install
```

4. **Compile TypeScript (Optional):**
If you want to compile the TypeScript files to JavaScript:
```bash
npm run build
```

5. **Run the Application:**
You can run the application using either of these methods:

   **Method 1: Using ts-node (Recommended for development)**
   ```bash
   npx ts-node src/index.ts
   ```

   **Method 2: Using npm script**
   ```bash
   npm start
   ```

   **Method 3: Running compiled JavaScript (if built)**
   ```bash
   node dist/index.js
   ```

### Package.json Scripts

The following scripts are available in the project:

```json
{
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "dev": "ts-node-dev --respawn src/index.ts",
    "test": "jest"
  }
}
```

### Troubleshooting

- **If ts-node is not found:** Make sure you're in the correct directory and have run `npm install`
- **If you get TypeScript errors:** Ensure you have the correct Node.js version (16+)
- **If the logs directory is missing:** The application will automatically create it on first run

---

## 🧑‍🚀 System Context: Single-User Reliability

This system is built as a single-user application, intended for one astronaut to manage their individual daily schedule. It is designed for maximum reliability in an isolated environment (like a space mission), where preventing schedule conflicts and ensuring thorough logging of all activities are paramount.

## 🌟 The Problem: Scheduling Conflicts and Data Integrity

Astronauts require a precise, conflict-free daily schedule to maximize mission efficiency. The system addresses several core challenges:

- **Mandatory Conflict Prevention**: The system must prevent the creation or modification of any task that overlaps in time with an existing one. This is non-negotiable for mission success.

- **Strict Data Validation**: Inputs for time (HH:MM), time range (Start time must be strictly before End time), and task descriptions must be rigorously validated.

- **Decoupled Accountability**: The core scheduling logic (adding/removing tasks) should be separated from side effects like informing the user (CLI output) and logging events (file I/O).

## 💡 Architectural Approach: Design Patterns in Action

The Astro Scheduler employs a layered architecture centered around three essential design patterns: Singleton, Factory, and Observer. This approach ensures decoupling, maintainability, and a single source of truth for all schedule data.

| Design Pattern | Files Involved | Role in the System |
|----------------|----------------|-------------------|
| **Singleton** | `ScheduleManager.ts` | Manages the single instance of the schedule. It ensures that all parts of the application operate on the exact same master list of tasks, providing a global point of access. |
| **Factory** | `TaskFactory.ts` | Encapsulates the complex creation of a valid Task object. It handles unique ID generation, initial input parsing, and validation, separating object creation logic from business logic. |
| **Observer** | `ISubject.ts`, `IObserver.ts`, `ConflictNotifier.ts`, `TaskLogger.ts` | Decouples core scheduling from side-effects. The ScheduleManager (Subject) notifies registered classes (Observers) about schedule changes, conflicts, and success/failure events. |

## 🧩 How the Observer Pattern Decouples the System

The Observer pattern is key to achieving a clean separation between the central data manager and the environment (CLI, File System).

- **The Subject (ScheduleManager)**: Whenever a critical change occurs (e.g., `addTask()`, `updateTask()`), the ScheduleManager calls its `notify()` method, passing a specific `ScheduleEvent` (e.g., `TASK_ADDED`, `TASK_CONFLICT`) and an event data payload.

- **The Observers (Attached at Startup)**:
  - **ConflictNotifier.ts**: This observer listens for relevant events and handles user feedback by printing colored, timestamped success messages or large, red conflict warnings to the CLI.
  - **TaskLogger.ts**: This observer receives every event and is solely responsible for File I/O. It delegates to the Logger service to write detailed, structured log entries into the daily file.

This means the ScheduleManager doesn't know how or where events are handled—it just announces them, keeping its focus purely on data management and conflict resolution.

## 📜 Logging Mechanism (Gold Standard)

All system events, warnings, operational errors (like validation failures), and fatal exceptions are recorded using the centralized Logger utility (`Logger.ts`).

- **Log Location**: Logs are stored in a dedicated `logs/` directory in the project root.
- **Daily Log File**: Logs are rotated daily into a file named `YYYY-MM-DD_logs.log`.
- **Uncaught Exception Handling**: The application entry point (`index.ts`) implements robust handlers to catch `unhandledRejection` and `uncaughtException`, ensuring system stability and logging critical errors before a controlled shutdown.

## ➡️ Astronaut Workflow: Adding a Task

The process for an astronaut to enter a new task showcases the combined use of the design patterns and validation utilities:

1. **CLI Input**: The astronaut selects `1. Add New Task` on the ConsoleInterface. The interface prompts for Description, Start Time, End Time, and Priority.

2. **Object Creation (Factory)**: The ConsoleInterface passes the raw strings to `TaskFactory.createTask()`.
   - The factory validates the time format (HH:MM) and time range (Start < End) using `TimeUtils.validateTimeFormat()` and `TimeUtils.validateTimeRange()`.
   - It generates a unique ID and creates a new Task entity.

3. **Core Logic (Singleton)**: The valid Task is passed to the `ScheduleManager.addTask()`.
   - The Manager calls `ValidationService.checkTaskOverlap()` against its list of tasks to find a conflict.

4. **Event Notification (Observer)**:
   - **On Success**: The Manager adds the task to its internal map and calls `notify('TASK_ADDED', ...)`
     - ConflictNotifier prints a green success message to the console.
     - TaskLogger writes an INFO log entry to the daily file.
   - **On Conflict**: The Manager throws a `TaskConflictError` and calls `notify('TASK_CONFLICT', ...)`
     - ConflictNotifier prints a large red warning, detailing the conflicting task.
     - TaskLogger writes a WARN log entry to the daily file.

## 🖥️ CLI Menu and Workflows

The application presents a clean menu to the user, with mandatory (M) and optional (O) requirements clearly marked.

| Action | Description | Mandatory/Optional |
|--------|-------------|-------------------|
| **1. Add New Task** | Creates a task, strictly checking for time conflicts. | (M) |
| **2. Remove Task** | Removes a task by its description. | (M) |
| **3. View All Tasks** | Displays the entire schedule, sorted by Start Time. | (M) |
| **4. Edit Existing Task** | Allows updating task details, checking for new conflicts. | (O) |
| **5. Mark Task as Completed** | Toggles the completion status of a task by description. | (O) |
| **6. View Tasks by Priority** | Displays tasks filtered by High, Medium, or Low priority. | (O) |
| **7. Exit** | Gracefully shuts down the application. | |

## 📸 Screenshots

### Here's a look into the main menu:
<img width="422" height="227" alt="image" src="https://github.com/user-attachments/assets/9f98e0d4-5bb2-45f9-81f0-e69a9fd5a088" />

### Screenshot 1: Main Schedule Menu
<img width="1047" height="439" alt="image" src="https://github.com/user-attachments/assets/66fb8bee-3a88-4f6b-a111-500d93453563" />

### Screenshot 2: Successful Task Addition (No Conflict)
<img width="794" height="290" alt="image" src="https://github.com/user-attachments/assets/6406d04e-48a6-4467-9126-af2b6f799216" />

### Screenshot 3: Conflict Error Handling
<img width="1179" height="440" alt="image" src="https://github.com/user-attachments/assets/b2166437-7eae-43e5-8b52-1419c751a4ee" />

### Screenshot 4: Viewing the Sorted Schedule (Option 3)
<img width="736" height="176" alt="image" src="https://github.com/user-attachments/assets/98e89fcd-9664-4dd1-864f-14771792faaf" />
