// ==================== Interfaces (Interface Segregation Principle) ====================

interface IFileSystemComponent {
  getName(): string;
  getSize(): number;
  getPath(): string;
  getCreatedDate(): Date;
  getModifiedDate(): Date;
  getOwner(): string;
  display(indent?: number): void;
  search(query: string): IFileSystemComponent[];
  calculateTotalSize(): number;
}

interface IComposite {
  add(component: IFileSystemComponent): void;
  remove(componentName: string): boolean;
  getChild(componentName: string): IFileSystemComponent | undefined;
  getChildren(): IFileSystemComponent[];
  hasChildren(): boolean;
}

interface IFileMetadata {
  extension: string;
  mimeType: string;
  isShared: boolean;
  permissions: string[];
}

// ==================== Abstract Component (Composite Pattern) ====================

abstract class FileSystemComponent implements IFileSystemComponent {
  protected name: string;
  protected path: string;
  protected createdDate: Date;
  protected modifiedDate: Date;
  protected owner: string;

  constructor(name: string, path: string, owner: string) {
    this.name = name;
    this.path = path;
    this.owner = owner;
    this.createdDate = new Date();
    this.modifiedDate = new Date();
  }

  public getName(): string {
    return this.name;
  }

  public getPath(): string {
    return this.path;
  }

  public getCreatedDate(): Date {
    return this.createdDate;
  }

  public getModifiedDate(): Date {
    return this.modifiedDate;
  }

  public getOwner(): string {
    return this.owner;
  }

  protected updateModifiedDate(): void {
    this.modifiedDate = new Date();
  }

  // Abstract methods to be implemented by concrete classes
  public abstract getSize(): number;
  public abstract display(indent?: number): void;
  public abstract search(query: string): IFileSystemComponent[];
  public abstract calculateTotalSize(): number;
}

// ==================== Leaf: File Class (Composite Pattern) ====================

class File extends FileSystemComponent {
  private size: number;
  private content: string;
  private metadata: IFileMetadata;

  constructor(
    name: string,
    path: string,
    owner: string,
    size: number,
    content: string,
    extension: string,
    mimeType: string
  ) {
    super(name, path, owner);
    this.size = size;
    this.content = content;
    this.metadata = {
      extension,
      mimeType,
      isShared: false,
      permissions: ['read', 'write']
    };
  }

  public getSize(): number {
    return this.size;
  }

  public getContent(): string {
    return this.content;
  }

  public getExtension(): string {
    return this.metadata.extension;
  }

  public getMimeType(): string {
    return this.metadata.mimeType;
  }

  public setContent(content: string): void {
    this.content = content;
    this.size = content.length;
    this.updateModifiedDate();
  }

  public shareFile(): void {
    this.metadata.isShared = true;
    console.log(`File "${this.name}" is now shared.`);
  }

  public calculateTotalSize(): number {
    return this.size;
  }

  public display(indent: number = 0): void {
    const indentation = '  '.repeat(indent);
    console.log(
      `${indentation}📄 ${this.name} (${this.formatSize(this.size)}) [${this.metadata.extension}]`
    );
  }

  public search(query: string): IFileSystemComponent[] {
    const results: IFileSystemComponent[] = [];
    const searchTerm = query.toLowerCase();

    if (
      this.name.toLowerCase().includes(searchTerm) ||
      this.content.toLowerCase().includes(searchTerm)
    ) {
      results.push(this);
    }

    return results;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

// ==================== Composite: Folder Class (Composite Pattern) ====================

class Folder extends FileSystemComponent implements IComposite {
  private children: Map<string, IFileSystemComponent>;
  private color: string;
  private isFavorite: boolean;

  constructor(name: string, path: string, owner: string, color: string = 'default') {
    super(name, path, owner);
    this.children = new Map<string, IFileSystemComponent>();
    this.color = color;
    this.isFavorite = false;
  }

  // COMPOSITE PATTERN: Add child component
  public add(component: IFileSystemComponent): void {
    if (this.children.has(component.getName())) {
      console.log(`Warning: Component "${component.getName()}" already exists in folder "${this.name}"`);
      return;
    }

    this.children.set(component.getName(), component);
    this.updateModifiedDate();
    console.log(`Added "${component.getName()}" to folder "${this.name}"`);
  }

  // COMPOSITE PATTERN: Remove child component
  public remove(componentName: string): boolean {
    if (this.children.has(componentName)) {
      this.children.delete(componentName);
      this.updateModifiedDate();
      console.log(`Removed "${componentName}" from folder "${this.name}"`);
      return true;
    }

    console.log(`Component "${componentName}" not found in folder "${this.name}"`);
    return false;
  }

  // COMPOSITE PATTERN: Get specific child
  public getChild(componentName: string): IFileSystemComponent | undefined {
    return this.children.get(componentName);
  }

  // COMPOSITE PATTERN: Get all children
  public getChildren(): IFileSystemComponent[] {
    return Array.from(this.children.values());
  }

  public hasChildren(): boolean {
    return this.children.size > 0;
  }

  // COMPOSITE PATTERN: Calculate size recursively
  public getSize(): number {
    return this.calculateTotalSize();
  }

  public calculateTotalSize(): number {
    let totalSize = 0;

    for (const child of this.children.values()) {
      totalSize += child.calculateTotalSize();
    }

    return totalSize;
  }

  public getFileCount(): number {
    let count = 0;

    for (const child of this.children.values()) {
      if (child instanceof File) {
        count++;
      } else if (child instanceof Folder) {
        count += child.getFileCount();
      }
    }

    return count;
  }

  public getFolderCount(): number {
    let count = 0;

    for (const child of this.children.values()) {
      if (child instanceof Folder) {
        count++;
        count += child.getFolderCount();
      }
    }

    return count;
  }

  public setFavorite(isFavorite: boolean): void {
    this.isFavorite = isFavorite;
  }

  public isFavoriteFolder(): boolean {
    return this.isFavorite;
  }

  // COMPOSITE PATTERN: Display recursively
  public display(indent: number = 0): void {
    const indentation = '  '.repeat(indent);
    const favoriteIcon = this.isFavorite ? '⭐' : '';
    const folderIcon = this.children.size > 0 ? '📁' : '📂';
    
    console.log(
      `${indentation}${folderIcon} ${this.name}/ ${favoriteIcon}(${this.formatSize(this.getSize())})`
    );

    // Display all children
    for (const child of this.children.values()) {
      child.display(indent + 1);
    }
  }

  // COMPOSITE PATTERN: Search recursively
  public search(query: string): IFileSystemComponent[] {
    const results: IFileSystemComponent[] = [];
    const searchTerm = query.toLowerCase();

    // Check if this folder matches
    if (this.name.toLowerCase().includes(searchTerm)) {
      results.push(this);
    }

    // Search in all children
    for (const child of this.children.values()) {
      const childResults = child.search(query);
      results.push(...childResults);
    }

    return results;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

// ==================== Cloud Drive Manager (Single Responsibility Principle) ====================

class CloudDriveManager {
  private rootFolder: Folder;
  private driveName: string;
  private totalCapacity: number;

  constructor(driveName: string, totalCapacity: number) {
    this.driveName = driveName;
    this.totalCapacity = totalCapacity;
    this.rootFolder = new Folder('Root', '/', 'system', 'blue');
    console.log(`Cloud Drive "${driveName}" initialized with ${this.formatSize(totalCapacity)} capacity.`);
  }

  public getRootFolder(): Folder {
    return this.rootFolder;
  }

  public getDriveName(): string {
    return this.driveName;
  }

  public getUsedSpace(): number {
    return this.rootFolder.calculateTotalSize();
  }

  public getFreeSpace(): number {
    return this.totalCapacity - this.getUsedSpace();
  }

  public getUsagePercentage(): number {
    return (this.getUsedSpace() / this.totalCapacity) * 100;
  }

  public displayDriveInfo(): void {
    console.log('\n========================================');
    console.log(`Cloud Drive: ${this.driveName}`);
    console.log('========================================');
    console.log(`Total Capacity: ${this.formatSize(this.totalCapacity)}`);
    console.log(`Used Space: ${this.formatSize(this.getUsedSpace())}`);
    console.log(`Free Space: ${this.formatSize(this.getFreeSpace())}`);
    console.log(`Usage: ${this.getUsagePercentage().toFixed(2)}%`);
    console.log(`Total Files: ${this.rootFolder.getFileCount()}`);
    console.log(`Total Folders: ${this.rootFolder.getFolderCount()}`);
    console.log('========================================\n');
  }

  public displayDriveStructure(): void {
    console.log('\n========== Drive Structure ==========\n');
    this.rootFolder.display(0);
    console.log('\n=====================================\n');
  }

  public searchDrive(query: string): IFileSystemComponent[] {
    console.log(`\nSearching for: "${query}"`);
    const results = this.rootFolder.search(query);
    console.log(`Found ${results.length} result(s)\n`);
    return results;
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

// ==================== Usage Example ====================

console.log('=== Composite Pattern Demo: Cloud Drive Management ===\n');

// Create Cloud Drive
const cloudDrive = new CloudDriveManager('MyCloudDrive', 10 * 1024 * 1024 * 1024); // 10 GB

const root = cloudDrive.getRootFolder();

// Create folder structure
console.log('\n--- Creating Folder Structure ---\n');

const documentsFolder = new Folder('Documents', '/Documents', 'user@example.com', 'blue');
const picturesFolder = new Folder('Pictures', '/Pictures', 'user@example.com', 'red');
const workFolder = new Folder('Work', '/Documents/Work', 'user@example.com', 'green');
const projectsFolder = new Folder('Projects', '/Documents/Work/Projects', 'user@example.com', 'yellow');

// Set work as favorite
workFolder.setFavorite(true);

// Build folder hierarchy (COMPOSITE PATTERN)
root.add(documentsFolder);
root.add(picturesFolder);
documentsFolder.add(workFolder);
workFolder.add(projectsFolder);

// Add files to folders (COMPOSITE PATTERN - treating files and folders uniformly)
console.log('\n--- Adding Files ---\n');

const resumeFile = new File(
  'resume.pdf',
  '/Documents/resume.pdf',
  'user@example.com',
  524288, // 512 KB
  'Professional resume content...',
  'pdf',
  'application/pdf'
);

const coverLetterFile = new File(
  'cover_letter.docx',
  '/Documents/cover_letter.docx',
  'user@example.com',
  102400, // 100 KB
  'Cover letter content...',
  'docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
);

const projectPlanFile = new File(
  'project_plan.xlsx',
  '/Documents/Work/Projects/project_plan.xlsx',
  'user@example.com',
  2097152, // 2 MB
  'Project planning data...',
  'xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
);

const codeFile = new File(
  'main.ts',
  '/Documents/Work/Projects/main.ts',
  'user@example.com',
  15360, // 15 KB
  'TypeScript code implementation...',
  'ts',
  'text/typescript'
);

const vacationPhoto = new File(
  'vacation_beach.jpg',
  '/Pictures/vacation_beach.jpg',
  'user@example.com',
  3145728, // 3 MB
  'Binary image data...',
  'jpg',
  'image/jpeg'
);

const familyPhoto = new File(
  'family_2024.png',
  '/Pictures/family_2024.png',
  'user@example.com',
  5242880, // 5 MB
  'Binary image data...',
  'png',
  'image/png'
);

// Add files to appropriate folders
documentsFolder.add(resumeFile);
documentsFolder.add(coverLetterFile);
projectsFolder.add(projectPlanFile);
projectsFolder.add(codeFile);
picturesFolder.add(vacationPhoto);
picturesFolder.add(familyPhoto);

// Display drive structure (COMPOSITE PATTERN - uniform treatment)
cloudDrive.displayDriveStructure();

// Display drive information
cloudDrive.displayDriveInfo();

// Test COMPOSITE PATTERN: Calculate sizes recursively
console.log('--- Folder Size Calculations ---\n');
console.log(`Documents folder size: ${(documentsFolder.getSize() / 1024 / 1024).toFixed(2)} MB`);
console.log(`Pictures folder size: ${(picturesFolder.getSize() / 1024 / 1024).toFixed(2)} MB`);
console.log(`Work folder size: ${(workFolder.getSize() / 1024 / 1024).toFixed(2)} MB`);

// Test search functionality (COMPOSITE PATTERN - recursive operation)
console.log('\n--- Search Operations ---\n');

const searchResults1 = cloudDrive.searchDrive('project');
searchResults1.forEach(result => {
  console.log(`  Found: ${result.getName()} at ${result.getPath()}`);
});

const searchResults2 = cloudDrive.searchDrive('.jpg');
console.log();
searchResults2.forEach(result => {
  console.log(`  Found: ${result.getName()} at ${result.getPath()}`);
});

// Test remove operation (COMPOSITE PATTERN)
console.log('\n--- Remove Operation ---\n');
documentsFolder.remove('cover_letter.docx');

// Display updated structure
console.log('\n--- Updated Structure After Removal ---\n');
cloudDrive.displayDriveStructure();

// Final drive info
cloudDrive.displayDriveInfo();

console.log('--- Statistics ---\n');
console.log(`Total files in drive: ${root.getFileCount()}`);
console.log(`Total folders in drive: ${root.getFolderCount()}`);
console.log(`Files in Documents: ${documentsFolder.getFileCount()}`);
console.log(`Files in Projects: ${projectsFolder.getFileCount()}`);