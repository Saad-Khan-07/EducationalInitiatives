// ==================== Interfaces (Interface Segregation Principle) ====================

interface IObserver {
  update(subject: ISubject): void;
  getObserverId(): string;
  getObserverName(): string;
}

interface ISubject {
  attach(observer: IObserver): void;
  detach(observer: IObserver): void;
  notify(): void;
}

interface IPricingPlan {
  planId: string;
  planName: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
}

interface IPriceChangeEvent {
  planId: string;
  planName: string;
  oldPrice: number;
  newPrice: number;
  changePercentage: number;
  effectiveDate: Date;
  reason: string;
}

interface ISubscription {
  subscriptionId: string;
  userId: string;
  planId: string;
  startDate: Date;
  renewalDate: Date;
  status: string;
}

// ==================== Enums ====================

enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

// ==================== Pricing Plan (Data Model) ====================

class PricingPlan implements IPricingPlan {
  public planId: string;
  public planName: string;
  public price: number;
  public currency: string;
  public billingCycle: string;
  public features: string[];
  private createdDate: Date;

  constructor(
    planId: string,
    planName: string,
    price: number,
    currency: string,
    billingCycle: string,
    features: string[]
  ) {
    this.planId = planId;
    this.planName = planName;
    this.price = price;
    this.currency = currency;
    this.billingCycle = billingCycle;
    this.features = features;
    this.createdDate = new Date();
  }

  public updatePrice(newPrice: number): void {
    this.price = newPrice;
  }

  public addFeature(feature: string): void {
    if (!this.features.includes(feature)) {
      this.features.push(feature);
    }
  }

  public removeFeature(feature: string): void {
    this.features = this.features.filter(f => f !== feature);
  }

  public getFormattedPrice(): string {
    return `${this.currency} ${this.price.toFixed(2)}`;
  }
}

// ==================== OBSERVER PATTERN: Subject (Pricing Manager) ====================

class PricingManager implements ISubject {
  private observers: Set<IObserver>;
  private pricingPlans: Map<string, PricingPlan>;
  private priceHistory: IPriceChangeEvent[];

  constructor() {
    this.observers = new Set<IObserver>();
    this.pricingPlans = new Map<string, PricingPlan>();
    this.priceHistory = [];
    console.log('[PricingManager] Initialized');
  }

  // OBSERVER PATTERN: Attach observer
  public attach(observer: IObserver): void {
    this.observers.add(observer);
    console.log(`[PricingManager] Observer attached: ${observer.getObserverName()}`);
  }

  // OBSERVER PATTERN: Detach observer
  public detach(observer: IObserver): void {
    if (this.observers.delete(observer)) {
      console.log(`[PricingManager] Observer detached: ${observer.getObserverName()}`);
    }
  }

  // OBSERVER PATTERN: Notify all observers
  public notify(): void {
    console.log(`[PricingManager] Notifying ${this.observers.size} observer(s)...`);
    
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  public addPricingPlan(plan: PricingPlan): void {
    this.pricingPlans.set(plan.planId, plan);
    console.log(`[PricingManager] Added pricing plan: ${plan.planName}`);
  }

  public getPricingPlan(planId: string): PricingPlan | undefined {
    return this.pricingPlans.get(planId);
  }

  public getAllPricingPlans(): PricingPlan[] {
    return Array.from(this.pricingPlans.values());
  }

  // Trigger notification when price changes
  public updatePlanPrice(
    planId: string,
    newPrice: number,
    reason: string,
    effectiveDate: Date = new Date()
  ): void {
    const plan = this.pricingPlans.get(planId);

    if (!plan) {
      console.error(`[PricingManager] Plan not found: ${planId}`);
      return;
    }

    const oldPrice = plan.price;
    const changePercentage = ((newPrice - oldPrice) / oldPrice) * 100;

    // Create price change event
    const priceChangeEvent: IPriceChangeEvent = {
      planId: plan.planId,
      planName: plan.planName,
      oldPrice,
      newPrice,
      changePercentage,
      effectiveDate,
      reason
    };

    // Update the plan
    plan.updatePrice(newPrice);

    // Store in history
    this.priceHistory.push(priceChangeEvent);

    console.log(`\n[PricingManager] Price updated for "${plan.planName}"`);
    console.log(`  Old Price: ${plan.currency} ${oldPrice.toFixed(2)}`);
    console.log(`  New Price: ${plan.currency} ${newPrice.toFixed(2)}`);
    console.log(`  Change: ${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(2)}%`);
    console.log(`  Reason: ${reason}\n`);

    // OBSERVER PATTERN: Notify all observers about the change
    this.notify();
  }

  public addPlanFeature(planId: string, feature: string): void {
    const plan = this.pricingPlans.get(planId);

    if (plan) {
      plan.addFeature(feature);
      console.log(`[PricingManager] Added feature "${feature}" to plan "${plan.planName}"`);
      this.notify();
    }
  }

  public getLatestPriceChange(): IPriceChangeEvent | undefined {
    return this.priceHistory[this.priceHistory.length - 1];
  }

  public getPriceHistory(): IPriceChangeEvent[] {
    return [...this.priceHistory];
  }
}

// ==================== OBSERVER PATTERN: Concrete Observer - Customer ====================

class Customer implements IObserver {
  private customerId: string;
  private customerName: string;
  private email: string;
  private subscriptions: ISubscription[];
  private notificationPreferences: NotificationChannel[];

  constructor(
    customerId: string,
    customerName: string,
    email: string,
    notificationPreferences: NotificationChannel[]
  ) {
    this.customerId = customerId;
    this.customerName = customerName;
    this.email = email;
    this.subscriptions = [];
    this.notificationPreferences = notificationPreferences;
  }

  public getObserverId(): string {
    return this.customerId;
  }

  public getObserverName(): string {
    return this.customerName;
  }

  public addSubscription(subscription: ISubscription): void {
    this.subscriptions.push(subscription);
    console.log(`[Customer ${this.customerName}] Subscribed to plan: ${subscription.planId}`);
  }

  public getActiveSubscriptions(): ISubscription[] {
    return this.subscriptions.filter(sub => sub.status === SubscriptionStatus.ACTIVE);
  }

  // OBSERVER PATTERN: Update method called when pricing changes
  public update(subject: ISubject): void {
    if (subject instanceof PricingManager) {
      const latestChange = subject.getLatestPriceChange();

      if (!latestChange) return;

      // Check if customer is subscribed to the changed plan
      const affectedSubscription = this.subscriptions.find(
        sub => sub.planId === latestChange.planId && sub.status === SubscriptionStatus.ACTIVE
      );

      if (affectedSubscription) {
        this.handlePriceChangeNotification(latestChange);
      }
    }
  }

  private handlePriceChangeNotification(priceChange: IPriceChangeEvent): void {
    console.log(`\n[Customer ${this.customerName}] Received price change notification:`);
    console.log(`  Plan: ${priceChange.planName}`);
    console.log(`  Old Price: ${priceChange.oldPrice.toFixed(2)}`);
    console.log(`  New Price: ${priceChange.newPrice.toFixed(2)}`);
    console.log(`  Change: ${priceChange.changePercentage > 0 ? '+' : ''}${priceChange.changePercentage.toFixed(2)}%`);
    console.log(`  Effective Date: ${priceChange.effectiveDate.toLocaleDateString()}`);
    console.log(`  Reason: ${priceChange.reason}`);

    // Send notifications through preferred channels
    this.sendNotifications(priceChange);
  }

  private sendNotifications(priceChange: IPriceChangeEvent): void {
    this.notificationPreferences.forEach(channel => {
      this.sendNotification(channel, priceChange);
    });
  }

  private sendNotification(channel: NotificationChannel, priceChange: IPriceChangeEvent): void {
    console.log(`  📨 Sending ${channel} notification to ${this.email}`);
  }
}

// ==================== OBSERVER PATTERN: Concrete Observer - Admin Dashboard ====================

class AdminDashboard implements IObserver {
  private dashboardId: string;
  private dashboardName: string;
  private priceChangeAlerts: IPriceChangeEvent[];
  private analyticsEnabled: boolean;

  constructor(dashboardId: string, dashboardName: string) {
    this.dashboardId = dashboardId;
    this.dashboardName = dashboardName;
    this.priceChangeAlerts = [];
    this.analyticsEnabled = true;
  }

  public getObserverId(): string {
    return this.dashboardId;
  }

  public getObserverName(): string {
    return this.dashboardName;
  }

  // OBSERVER PATTERN: Update method for admin dashboard
  public update(subject: ISubject): void {
    if (subject instanceof PricingManager) {
      const latestChange = subject.getLatestPriceChange();

      if (latestChange) {
        this.priceChangeAlerts.push(latestChange);
        this.logPriceChangeToAnalytics(latestChange);
        this.displayDashboardAlert(latestChange);
      }
    }
  }

  private logPriceChangeToAnalytics(priceChange: IPriceChangeEvent): void {
    if (this.analyticsEnabled) {
      console.log(`\n[Admin Dashboard] Analytics logged:`);
      console.log(`  Event: Price Change`);
      console.log(`  Plan: ${priceChange.planName}`);
      console.log(`  Impact: ${priceChange.changePercentage > 0 ? 'Increase' : 'Decrease'} of ${Math.abs(priceChange.changePercentage).toFixed(2)}%`);
    }
  }

  private displayDashboardAlert(priceChange: IPriceChangeEvent): void {
    console.log(`[Admin Dashboard] 🔔 New alert displayed for ${priceChange.planName}`);
  }

  public getRecentAlerts(count: number = 5): IPriceChangeEvent[] {
    return this.priceChangeAlerts.slice(-count);
  }
}

// ==================== OBSERVER PATTERN: Concrete Observer - Billing System ====================

class BillingSystem implements IObserver {
  private systemId: string;
  private systemName: string;
  private pendingBillingUpdates: Map<string, IPriceChangeEvent>;

  constructor(systemId: string, systemName: string) {
    this.systemId = systemId;
    this.systemName = systemName;
    this.pendingBillingUpdates = new Map<string, IPriceChangeEvent>();
  }

  public getObserverId(): string {
    return this.systemId;
  }

  public getObserverName(): string {
    return this.systemName;
  }

  // OBSERVER PATTERN: Update method for billing system
  public update(subject: ISubject): void {
    if (subject instanceof PricingManager) {
      const latestChange = subject.getLatestPriceChange();

      if (latestChange) {
        this.processBillingUpdate(latestChange);
      }
    }
  }

  private processBillingUpdate(priceChange: IPriceChangeEvent): void {
    console.log(`\n[Billing System] Processing billing update:`);
    console.log(`  Plan ID: ${priceChange.planId}`);
    console.log(`  New Price: ${priceChange.newPrice.toFixed(2)}`);
    console.log(`  Effective Date: ${priceChange.effectiveDate.toLocaleDateString()}`);

    this.pendingBillingUpdates.set(priceChange.planId, priceChange);
    this.updateInvoiceTemplates(priceChange);
    this.scheduleRenewalPriceUpdates(priceChange);
  }

  private updateInvoiceTemplates(priceChange: IPriceChangeEvent): void {
    console.log(`[Billing System] ✓ Invoice templates updated for ${priceChange.planName}`);
  }

  private scheduleRenewalPriceUpdates(priceChange: IPriceChangeEvent): void {
    console.log(`[Billing System] ✓ Scheduled renewal price updates for ${priceChange.effectiveDate.toLocaleDateString()}`);
  }

  public getPendingUpdates(): IPriceChangeEvent[] {
    return Array.from(this.pendingBillingUpdates.values());
  }
}

// ==================== OBSERVER PATTERN: Concrete Observer - Email Marketing System ====================

class EmailMarketingSystem implements IObserver {
  private systemId: string;
  private systemName: string;
  private campaignQueue: string[];

  constructor(systemId: string, systemName: string) {
    this.systemId = systemId;
    this.systemName = systemName;
    this.campaignQueue = [];
  }

  public getObserverId(): string {
    return this.systemId;
  }

  public getObserverName(): string {
    return this.systemName;
  }

  // OBSERVER PATTERN: Update method for marketing system
  public update(subject: ISubject): void {
    if (subject instanceof PricingManager) {
      const latestChange = subject.getLatestPriceChange();

      if (latestChange) {
        this.createMarketingCampaign(latestChange);
      }
    }
  }

  private createMarketingCampaign(priceChange: IPriceChangeEvent): void {
    console.log(`\n[Email Marketing] Creating campaign for price change:`);
    
    if (priceChange.changePercentage < 0) {
      console.log(`  Campaign Type: PRICE DROP ANNOUNCEMENT`);
      console.log(`  Message: "Great news! ${priceChange.planName} is now ${Math.abs(priceChange.changePercentage).toFixed(2)}% cheaper!"`);
    } else {
      console.log(`  Campaign Type: PRICE INCREASE NOTIFICATION`);
      console.log(`  Message: "Important update: ${priceChange.planName} pricing will change effective ${priceChange.effectiveDate.toLocaleDateString()}"`);
    }

    const campaignId = `CAMPAIGN_${Date.now()}`;
    this.campaignQueue.push(campaignId);
    console.log(`[Email Marketing] ✓ Campaign queued: ${campaignId}`);
  }

  public getCampaignQueue(): string[] {
    return [...this.campaignQueue];
  }
}

// ==================== Usage Example ====================

console.log('=== Observer Pattern Demo: Subscription/Pricing Model Updates ===\n');

// Create the Subject (Pricing Manager)
const pricingManager = new PricingManager();

// Create pricing plans
console.log('--- Setting Up Pricing Plans ---\n');

const basicPlan = new PricingPlan(
  'PLAN_BASIC',
  'Basic Plan',
  9.99,
  'USD',
  'Monthly',
  ['5 GB Storage', 'Email Support', 'Basic Features']
);

const proPlan = new PricingPlan(
  'PLAN_PRO',
  'Professional Plan',
  29.99,
  'USD',
  'Monthly',
  ['50 GB Storage', 'Priority Support', 'Advanced Features', 'API Access']
);

const enterprisePlan = new PricingPlan(
  'PLAN_ENTERPRISE',
  'Enterprise Plan',
  99.99,
  'USD',
  'Monthly',
  ['Unlimited Storage', '24/7 Support', 'All Features', 'Custom Integration']
);

pricingManager.addPricingPlan(basicPlan);
pricingManager.addPricingPlan(proPlan);
pricingManager.addPricingPlan(enterprisePlan);

// Create Observers (Customers)
console.log('\n--- Creating Customers (Observers) ---\n');

const customer1 = new Customer(
  'CUST_001',
  'Alice Johnson',
  'alice@example.com',
  [NotificationChannel.EMAIL, NotificationChannel.PUSH]
);

const customer2 = new Customer(
  'CUST_002',
  'Bob Smith',
  'bob@example.com',
  [NotificationChannel.EMAIL, NotificationChannel.SMS]
);

const customer3 = new Customer(
  'CUST_003',
  'Charlie Brown',
  'charlie@example.com',
  [NotificationChannel.EMAIL]
);

// Add subscriptions
customer1.addSubscription({
  subscriptionId: 'SUB_001',
  userId: 'CUST_001',
  planId: 'PLAN_PRO',
  startDate: new Date(),
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  status: SubscriptionStatus.ACTIVE
});

customer2.addSubscription({
  subscriptionId: 'SUB_002',
  userId: 'CUST_002',
  planId: 'PLAN_BASIC',
  startDate: new Date(),
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  status: SubscriptionStatus.ACTIVE
});

customer3.addSubscription({
  subscriptionId: 'SUB_003',
  userId: 'CUST_003',
  planId: 'PLAN_PRO',
  startDate: new Date(),
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  status: SubscriptionStatus.ACTIVE
});

// Create other observers
const adminDashboard = new AdminDashboard('DASH_001', 'Admin Dashboard');
const billingSystem = new BillingSystem('BILL_001', 'Billing System');
const emailMarketing = new EmailMarketingSystem('MARKET_001', 'Email Marketing');

// OBSERVER PATTERN: Attach observers to subject
console.log('\n--- Attaching Observers ---\n');

pricingManager.attach(customer1);
pricingManager.attach(customer2);
pricingManager.attach(customer3);
pricingManager.attach(adminDashboard);
pricingManager.attach(billingSystem);
pricingManager.attach(emailMarketing);

// Test Case 1: Update pricing (triggers notifications to all observers)
console.log('\n\n========== TEST CASE 1: Price Increase ==========');
pricingManager.updatePlanPrice(
  'PLAN_PRO',
  34.99,
  'Enhanced features and infrastructure improvements',
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Effective in 7 days
);

// Test Case 2: Price decrease
console.log('\n\n========== TEST CASE 2: Price Decrease (Promotion) ==========');
pricingManager.updatePlanPrice(
  'PLAN_BASIC',
  7.99,
  'Special promotional pricing for new year',
  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
);

// Test Case 3: Detach an observer
console.log('\n\n========== TEST CASE 3: Detach Observer ==========\n');
pricingManager.detach(customer2);

// Test Case 4: Update after detaching (customer2 won't be notified)
console.log('\n\n========== TEST CASE 4: Price Update After Detach ==========');
pricingManager.updatePlanPrice(
  'PLAN_ENTERPRISE',
  89.99,
  'Competitive market adjustment',
  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
);

// Display summary
console.log('\n\n========== Summary ==========\n');
console.log(`Total Price Changes: ${pricingManager.getPriceHistory().length}`);
console.log(`Active Observers: ${pricingManager['observers'].size}`);
console.log(`\nAdmin Dashboard Alerts: ${adminDashboard.getRecentAlerts().length}`);
console.log(`Billing System Pending Updates: ${billingSystem.getPendingUpdates().length}`);
console.log(`Marketing Campaigns Queued: ${emailMarketing.getCampaignQueue().length}`);