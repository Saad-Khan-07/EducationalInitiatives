// ==================== Interfaces (Interface Segregation Principle) ====================

interface IUser {
  getUserId(): string;
  getUsername(): string;
  getEmail(): string;
  getPasswordHash(): string;
  getRoles(): string[];
  isAccountLocked(): boolean;
  getFailedLoginAttempts(): number;
}

interface IAuthenticationResult {
  isSuccess: boolean;
  message: string;
  userId?: string;
  token?: string;
  requiresTwoFactor?: boolean;
}

interface ISessionData {
  sessionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

// ==================== User Entity ====================

class User implements IUser {
  private userId: string;
  private username: string;
  private email: string;
  private passwordHash: string;
  private roles: string[];
  private accountLocked: boolean;
  private failedLoginAttempts: number;

  constructor(
    userId: string,
    username: string,
    email: string,
    passwordHash: string,
    roles: string[] = ['user']
  ) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.roles = roles;
    this.accountLocked = false;
    this.failedLoginAttempts = 0;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }

  public getRoles(): string[] {
    return [...this.roles];
  }

  public isAccountLocked(): boolean {
    return this.accountLocked;
  }

  public getFailedLoginAttempts(): number {
    return this.failedLoginAttempts;
  }

  public lockAccount(): void {
    this.accountLocked = true;
  }

  public unlockAccount(): void {
    this.accountLocked = false;
    this.failedLoginAttempts = 0;
  }

  public incrementFailedAttempts(): void {
    this.failedLoginAttempts++;
  }

  public resetFailedAttempts(): void {
    this.failedLoginAttempts = 0;
  }
}

// ==================== Subsystem 1: User Repository ====================

class UserRepository {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map<string, User>();
    this.initializeMockUsers();
  }

  private initializeMockUsers(): void {
    // Mock users for demonstration
    const user1 = new User(
      'U001',
      'john_doe',
      'john@example.com',
      this.hashPassword('password123'),
      ['user', 'admin']
    );
    
    const user2 = new User(
      'U002',
      'jane_smith',
      'jane@example.com',
      this.hashPassword('securepass456'),
      ['user']
    );

    this.users.set('john_doe', user1);
    this.users.set('jane_smith', user2);
  }

  public findUserByUsername(username: string): User | null {
    console.log(`[UserRepository] Searching for user: ${username}`);
    const user = this.users.get(username) || null;
    
    if (user) {
      console.log(`[UserRepository] User found: ${username}`);
    } else {
      console.log(`[UserRepository] User not found: ${username}`);
    }
    
    return user;
  }

  public updateUser(user: User): void {
    this.users.set(user.getUsername(), user);
    console.log(`[UserRepository] User updated: ${user.getUsername()}`);
  }

  private hashPassword(password: string): string {
    // Simplified hash for demonstration
    return `hash_${password}_${password.length}`;
  }
}

// ==================== Subsystem 2: Authentication Service ====================

class AuthenticationService {
  public validateCredentials(user: User, password: string): boolean {
    console.log(`[AuthenticationService] Validating credentials for: ${user.getUsername()}`);
    
    const hashedPassword = this.hashPassword(password);
    const isValid = hashedPassword === user.getPasswordHash();
    
    console.log(`[AuthenticationService] Credentials valid: ${isValid}`);
    return isValid;
  }

  public generateAuthToken(userId: string): string {
    const token = `TOKEN_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[AuthenticationService] Generated auth token for user: ${userId}`);
    return token;
  }

  private hashPassword(password: string): string {
    // Simplified hash for demonstration (matches UserRepository)
    return `hash_${password}_${password.length}`;
  }
}

// ==================== Subsystem 3: Account Security Manager ====================

class AccountSecurityManager {
  private readonly maxFailedAttempts: number = 3;

  public checkAccountLockStatus(user: User): boolean {
    console.log(`[AccountSecurityManager] Checking lock status for: ${user.getUsername()}`);
    
    if (user.isAccountLocked()) {
      console.log(`[AccountSecurityManager] Account is LOCKED`);
      return false;
    }
    
    console.log(`[AccountSecurityManager] Account is active`);
    return true;
  }

  public handleFailedLogin(user: User): void {
    console.log(`[AccountSecurityManager] Recording failed login attempt`);
    user.incrementFailedAttempts();
    
    if (user.getFailedLoginAttempts() >= this.maxFailedAttempts) {
      user.lockAccount();
      console.log(`[AccountSecurityManager] Account LOCKED after ${this.maxFailedAttempts} failed attempts`);
    } else {
      console.log(`[AccountSecurityManager] Failed attempts: ${user.getFailedLoginAttempts()}/${this.maxFailedAttempts}`);
    }
  }

  public handleSuccessfulLogin(user: User): void {
    console.log(`[AccountSecurityManager] Resetting failed login attempts`);
    user.resetFailedAttempts();
  }
}

// ==================== Subsystem 4: Session Manager ====================

class SessionManager {
  private sessions: Map<string, ISessionData>;

  constructor() {
    this.sessions = new Map<string, ISessionData>();
  }

  public createSession(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): ISessionData {
    console.log(`[SessionManager] Creating session for user: ${userId}`);
    
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const sessionData: ISessionData = {
      sessionId,
      userId,
      createdAt: now,
      expiresAt,
      ipAddress,
      userAgent
    };

    this.sessions.set(sessionId, sessionData);
    console.log(`[SessionManager] Session created: ${sessionId}`);
    
    return sessionData;
  }

  public getSession(sessionId: string): ISessionData | null {
    return this.sessions.get(sessionId) || null;
  }

  public invalidateSession(sessionId: string): void {
    if (this.sessions.delete(sessionId)) {
      console.log(`[SessionManager] Session invalidated: ${sessionId}`);
    }
  }

  public isSessionValid(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    const now = new Date();
    return now < session.expiresAt;
  }

  private generateSessionId(): string {
    return `SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }
}

// ==================== Subsystem 5: Activity Logger ====================

class ActivityLogger {
  private logs: string[];

  constructor() {
    this.logs = [];
  }

  public logLoginAttempt(
    username: string,
    success: boolean,
    ipAddress: string,
    timestamp: Date = new Date()
  ): void {
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `[${timestamp.toISOString()}] LOGIN ${status} - User: ${username}, IP: ${ipAddress}`;
    
    this.logs.push(logEntry);
    console.log(`[ActivityLogger] ${logEntry}`);
  }

  public logLogout(username: string, ipAddress: string): void {
    const logEntry = `[${new Date().toISOString()}] LOGOUT - User: ${username}, IP: ${ipAddress}`;
    
    this.logs.push(logEntry);
    console.log(`[ActivityLogger] ${logEntry}`);
  }

  public logSecurityEvent(event: string, details: string): void {
    const logEntry = `[${new Date().toISOString()}] SECURITY - ${event}: ${details}`;
    
    this.logs.push(logEntry);
    console.log(`[ActivityLogger] ${logEntry}`);
  }

  public getRecentLogs(count: number = 10): string[] {
    return this.logs.slice(-count);
  }
}

// ==================== Subsystem 6: Notification Service ====================

class NotificationService {
  public sendLoginNotification(user: User, ipAddress: string): void {
    console.log(`[NotificationService] Sending login notification to ${user.getEmail()}`);
    console.log(`[NotificationService] Email: "New login from IP: ${ipAddress}"`);
  }

  public sendAccountLockedNotification(user: User): void {
    console.log(`[NotificationService] Sending account locked notification to ${user.getEmail()}`);
    console.log(`[NotificationService] Email: "Your account has been locked due to multiple failed login attempts"`);
  }

  public sendPasswordResetNotification(user: User): void {
    console.log(`[NotificationService] Sending password reset notification to ${user.getEmail()}`);
  }
}

// ==================== FACADE PATTERN: Login Facade ====================

class LoginFacade {
  private userRepository: UserRepository;
  private authenticationService: AuthenticationService;
  private accountSecurityManager: AccountSecurityManager;
  private sessionManager: SessionManager;
  private activityLogger: ActivityLogger;
  private notificationService: NotificationService;

  constructor() {
    // Initialize all subsystems
    this.userRepository = new UserRepository();
    this.authenticationService = new AuthenticationService();
    this.accountSecurityManager = new AccountSecurityManager();
    this.sessionManager = new SessionManager();
    this.activityLogger = new ActivityLogger();
    this.notificationService = new NotificationService();
  }

  // FACADE METHOD: Simplified login interface
  public login(
    username: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): IAuthenticationResult {
    console.log('\n========== Login Process Started ==========\n');

    // Step 1: Find user
    const user = this.userRepository.findUserByUsername(username);
    
    if (!user) {
      this.activityLogger.logLoginAttempt(username, false, ipAddress);
      return {
        isSuccess: false,
        message: 'Invalid username or password'
      };
    }

    // Step 2: Check account lock status
    const isAccountActive = this.accountSecurityManager.checkAccountLockStatus(user);
    
    if (!isAccountActive) {
      this.activityLogger.logSecurityEvent(
        'LOCKED_ACCOUNT_ACCESS_ATTEMPT',
        `User: ${username}, IP: ${ipAddress}`
      );
      return {
        isSuccess: false,
        message: 'Account is locked. Please contact support.'
      };
    }

    // Step 3: Validate credentials
    const isValidCredentials = this.authenticationService.validateCredentials(user, password);
    
    if (!isValidCredentials) {
      this.accountSecurityManager.handleFailedLogin(user);
      this.userRepository.updateUser(user);
      this.activityLogger.logLoginAttempt(username, false, ipAddress);
      
      if (user.isAccountLocked()) {
        this.notificationService.sendAccountLockedNotification(user);
      }
      
      return {
        isSuccess: false,
        message: 'Invalid username or password'
      };
    }

    // Step 4: Handle successful login
    this.accountSecurityManager.handleSuccessfulLogin(user);
    this.userRepository.updateUser(user);

    // Step 5: Generate auth token
    const authToken = this.authenticationService.generateAuthToken(user.getUserId());

    // Step 6: Create session
    const session = this.sessionManager.createSession(
      user.getUserId(),
      ipAddress,
      userAgent
    );

    // Step 7: Log activity and send notifications
    this.activityLogger.logLoginAttempt(username, true, ipAddress);
    this.notificationService.sendLoginNotification(user, ipAddress);

    console.log('\n========== Login Process Completed ==========\n');

    return {
      isSuccess: true,
      message: 'Login successful',
      userId: user.getUserId(),
      token: authToken
    };
  }

  // FACADE METHOD: Simplified logout interface
  public logout(sessionId: string, ipAddress: string): boolean {
    console.log('\n========== Logout Process Started ==========\n');

    const session = this.sessionManager.getSession(sessionId);
    
    if (!session) {
      console.log('[LoginFacade] Invalid session ID');
      return false;
    }

    const user = this.userRepository.findUserByUsername('john_doe'); // Simplified
    
    if (user) {
      this.activityLogger.logLogout(user.getUsername(), ipAddress);
    }

    this.sessionManager.invalidateSession(sessionId);

    console.log('\n========== Logout Process Completed ==========\n');
    return true;
  }

  // FACADE METHOD: Validate active session
  public validateSession(sessionId: string): boolean {
    console.log(`\n[LoginFacade] Validating session: ${sessionId}`);
    return this.sessionManager.isSessionValid(sessionId);
  }

  // FACADE METHOD: Get activity logs
  public getActivityLogs(count: number = 10): string[] {
    return this.activityLogger.getRecentLogs(count);
  }
}

// ==================== Usage Example ====================

console.log('=== Facade Pattern Demo: User Login Orchestration ===\n');

const loginFacade = new LoginFacade();

// Test Case 1: Successful login
console.log('TEST CASE 1: Successful Login\n');
console.log('='.repeat(50));

const result1 = loginFacade.login(
  'john_doe',
  'password123',
  '192.168.1.100',
  'Mozilla/5.0 Chrome/91.0'
);

console.log('\nLogin Result:', result1);

// Test Case 2: Failed login - wrong password
console.log('\n\nTEST CASE 2: Failed Login (Wrong Password)\n');
console.log('='.repeat(50));

const result2 = loginFacade.login(
  'john_doe',
  'wrongpassword',
  '192.168.1.100',
  'Mozilla/5.0 Chrome/91.0'
);

console.log('\nLogin Result:', result2);

// Test Case 3: Multiple failed attempts (account lock)
console.log('\n\nTEST CASE 3: Multiple Failed Attempts (Account Lock)\n');
console.log('='.repeat(50));

for (let i = 1; i <= 3; i++) {
  console.log(`\nAttempt ${i}:`);
  const result = loginFacade.login(
    'jane_smith',
    'wrongpass',
    '192.168.1.101',
    'Mozilla/5.0 Firefox/89.0'
  );
  console.log('Result:', result.message);
}

// Test Case 4: Attempt login on locked account
console.log('\n\nTEST CASE 4: Login Attempt on Locked Account\n');
console.log('='.repeat(50));

const result4 = loginFacade.login(
  'jane_smith',
  'securepass456',
  '192.168.1.101',
  'Mozilla/5.0 Firefox/89.0'
);

console.log('\nLogin Result:', result4);

// Test Case 5: View activity logs
console.log('\n\nTEST CASE 5: Activity Logs\n');
console.log('='.repeat(50));

const logs = loginFacade.getActivityLogs(15);
console.log('\nRecent Activity:');
logs.forEach(log => console.log(log));