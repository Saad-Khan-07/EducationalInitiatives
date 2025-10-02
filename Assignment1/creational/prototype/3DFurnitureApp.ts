// ==================== Interfaces (Interface Segregation Principle) ====================

interface ICloneable<T> {
  clone(): T;
}

interface IPosition3D {
  x: number;
  y: number;
  z: number;
}

interface IDimensions3D {
  width: number;
  height: number;
  depth: number;
}

interface IMaterial {
  name: string;
  color: string;
  texture: string;
  reflectivity: number;
}

interface IFurniture extends ICloneable<IFurniture> {
  getId(): string;
  getName(): string;
  getPosition(): IPosition3D;
  getDimensions(): IDimensions3D;
  getMaterial(): IMaterial;
  getPrice(): number;
  setPosition(position: IPosition3D): void;
  setMaterial(material: IMaterial): void;
  display(): void;
}

// ==================== Value Objects ====================

class Position3D implements IPosition3D {
  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

  public clone(): Position3D {
    return new Position3D(this.x, this.y, this.z);
  }
}

class Dimensions3D implements IDimensions3D {
  constructor(
    public width: number,
    public height: number,
    public depth: number
  ) {}

  public clone(): Dimensions3D {
    return new Dimensions3D(this.width, this.height, this.depth);
  }
}

class Material implements IMaterial {
  constructor(
    public name: string,
    public color: string,
    public texture: string,
    public reflectivity: number
  ) {}

  public clone(): Material {
    return new Material(this.name, this.color, this.texture, this.reflectivity);
  }
}

// ==================== Abstract Base Class (Open/Closed Principle) ====================

abstract class Furniture implements IFurniture {
  protected id: string;
  protected name: string;
  protected position: Position3D;
  protected dimensions: Dimensions3D;
  protected material: Material;
  protected price: number;

  constructor(
    id: string,
    name: string,
    position: Position3D,
    dimensions: Dimensions3D,
    material: Material,
    price: number
  ) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.dimensions = dimensions;
    this.material = material;
    this.price = price;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getPosition(): IPosition3D {
    return this.position;
  }

  public getDimensions(): IDimensions3D {
    return this.dimensions;
  }

  public getMaterial(): IMaterial {
    return this.material;
  }

  public getPrice(): number {
    return this.price;
  }

  public setPosition(position: IPosition3D): void {
    this.position = new Position3D(position.x, position.y, position.z);
  }

  public setMaterial(material: IMaterial): void {
    this.material = new Material(
      material.name,
      material.color,
      material.texture,
      material.reflectivity
    );
  }

  // PROTOTYPE PATTERN: Abstract clone method
  public abstract clone(): IFurniture;

  public display(): void {
    console.log(`\n--- ${this.name} (${this.id}) ---`);
    console.log(`Position: (${this.position.x}, ${this.position.y}, ${this.position.z})`);
    console.log(`Dimensions: ${this.dimensions.width}W x ${this.dimensions.height}H x ${this.dimensions.depth}D`);
    console.log(`Material: ${this.material.name} (${this.material.color})`);
    console.log(`Price: $${this.price}`);
  }
}

// ==================== Concrete Furniture Classes ====================

class Chair extends Furniture {
  private hasArmrests: boolean;
  private isSwivel: boolean;
  private backrestAngle: number;

  constructor(
    id: string,
    name: string,
    position: Position3D,
    dimensions: Dimensions3D,
    material: Material,
    price: number,
    hasArmrests: boolean,
    isSwivel: boolean,
    backrestAngle: number
  ) {
    super(id, name, position, dimensions, material, price);
    this.hasArmrests = hasArmrests;
    this.isSwivel = isSwivel;
    this.backrestAngle = backrestAngle;
  }

  // PROTOTYPE PATTERN: Deep clone implementation
  public clone(): Chair {
    return new Chair(
      this.generateNewId(),
      this.name,
      this.position.clone(),
      this.dimensions.clone(),
      this.material.clone(),
      this.price,
      this.hasArmrests,
      this.isSwivel,
      this.backrestAngle
    );
  }

  private generateNewId(): string {
    return `CHAIR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  public display(): void {
    super.display();
    console.log(`Armrests: ${this.hasArmrests ? 'Yes' : 'No'}`);
    console.log(`Swivel: ${this.isSwivel ? 'Yes' : 'No'}`);
    console.log(`Backrest Angle: ${this.backrestAngle}°`);
  }
}

class Table extends Furniture {
  private shape: string;
  private numberOfLegs: number;
  private hasDrawers: boolean;
  private drawerCount: number;

  constructor(
    id: string,
    name: string,
    position: Position3D,
    dimensions: Dimensions3D,
    material: Material,
    price: number,
    shape: string,
    numberOfLegs: number,
    hasDrawers: boolean,
    drawerCount: number
  ) {
    super(id, name, position, dimensions, material, price);
    this.shape = shape;
    this.numberOfLegs = numberOfLegs;
    this.hasDrawers = hasDrawers;
    this.drawerCount = drawerCount;
  }

  // PROTOTYPE PATTERN: Deep clone implementation
  public clone(): Table {
    return new Table(
      this.generateNewId(),
      this.name,
      this.position.clone(),
      this.dimensions.clone(),
      this.material.clone(),
      this.price,
      this.shape,
      this.numberOfLegs,
      this.hasDrawers,
      this.drawerCount
    );
  }

  private generateNewId(): string {
    return `TABLE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  public display(): void {
    super.display();
    console.log(`Shape: ${this.shape}`);
    console.log(`Legs: ${this.numberOfLegs}`);
    console.log(`Drawers: ${this.hasDrawers ? this.drawerCount : 'None'}`);
  }
}

class Sofa extends Furniture {
  private numberOfSeats: number;
  private hasCushions: boolean;
  private cushionCount: number;
  private isReclinable: boolean;

  constructor(
    id: string,
    name: string,
    position: Position3D,
    dimensions: Dimensions3D,
    material: Material,
    price: number,
    numberOfSeats: number,
    hasCushions: boolean,
    cushionCount: number,
    isReclinable: boolean
  ) {
    super(id, name, position, dimensions, material, price);
    this.numberOfSeats = numberOfSeats;
    this.hasCushions = hasCushions;
    this.cushionCount = cushionCount;
    this.isReclinable = isReclinable;
  }

  // PROTOTYPE PATTERN: Deep clone implementation
  public clone(): Sofa {
    return new Sofa(
      this.generateNewId(),
      this.name,
      this.position.clone(),
      this.dimensions.clone(),
      this.material.clone(),
      this.price,
      this.numberOfSeats,
      this.hasCushions,
      this.cushionCount,
      this.isReclinable
    );
  }

  private generateNewId(): string {
    return `SOFA-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  public display(): void {
    super.display();
    console.log(`Seats: ${this.numberOfSeats}`);
    console.log(`Cushions: ${this.hasCushions ? this.cushionCount : 'None'}`);
    console.log(`Reclinable: ${this.isReclinable ? 'Yes' : 'No'}`);
  }
}

// ==================== Furniture Registry (Prototype Manager) ====================

class FurniturePrototypeRegistry {
  private prototypes: Map<string, IFurniture>;

  constructor() {
    this.prototypes = new Map<string, IFurniture>();
  }

  public registerPrototype(key: string, prototype: IFurniture): void {
    this.prototypes.set(key, prototype);
    console.log(`Prototype '${key}' registered successfully.`);
  }

  public getPrototype(key: string): IFurniture | undefined {
    return this.prototypes.get(key);
  }

  public clonePrototype(key: string): IFurniture | null {
    const prototype = this.prototypes.get(key);
    
    if (!prototype) {
      console.error(`Prototype '${key}' not found in registry.`);
      return null;
    }

    const cloned = prototype.clone();
    console.log(`Cloned furniture from prototype '${key}'`);
    return cloned;
  }

  public listPrototypes(): string[] {
    return Array.from(this.prototypes.keys());
  }
}

// ==================== Scene Manager (Single Responsibility Principle) ====================

class SceneManager {
  private furnitureItems: IFurniture[];
  private sceneName: string;

  constructor(sceneName: string) {
    this.furnitureItems = [];
    this.sceneName = sceneName;
  }

  public addFurniture(furniture: IFurniture): void {
    this.furnitureItems.push(furniture);
    console.log(`Added ${furniture.getName()} to scene '${this.sceneName}'`);
  }

  public removeFurniture(furnitureId: string): boolean {
    const index = this.furnitureItems.findIndex(
      item => item.getId() === furnitureId
    );
    
    if (index !== -1) {
      const removed = this.furnitureItems.splice(index, 1)[0];
      if (removed) {
        console.log(`Removed ${removed.getName()} from scene`);
      }
      return true;
    }
    
    return false;
  }

  public getFurnitureById(furnitureId: string): IFurniture | undefined {
    return this.furnitureItems.find(item => item.getId() === furnitureId);
  }

  public getAllFurniture(): IFurniture[] {
    return [...this.furnitureItems];
  }

  public displayScene(): void {
    console.log(`\n========== Scene: ${this.sceneName} ==========`);
    console.log(`Total Items: ${this.furnitureItems.length}`);
    
    this.furnitureItems.forEach(item => {
      item.display();
    });
    
    console.log('==========================================\n');
  }

  public calculateTotalPrice(): number {
    return this.furnitureItems.reduce(
      (total, item) => total + item.getPrice(),
      0
    );
  }
}

// ==================== Usage Example ====================

console.log('=== Prototype Pattern Demo: 3D Furniture Application ===\n');

// Create prototype registry
const registry = new FurniturePrototypeRegistry();

// Create complex prototype objects
const officeChairPrototype = new Chair(
  'CHAIR-PROTO-001',
  'Executive Office Chair',
  new Position3D(0, 0, 0),
  new Dimensions3D(60, 120, 60),
  new Material('Leather', 'Black', 'smooth', 0.3),
  450,
  true,
  true,
  110
);

const diningTablePrototype = new Table(
  'TABLE-PROTO-001',
  'Wooden Dining Table',
  new Position3D(0, 0, 0),
  new Dimensions3D(180, 75, 90),
  new Material('Oak Wood', 'Brown', 'wood-grain', 0.2),
  800,
  'Rectangular',
  4,
  true,
  2
);

const modernSofaPrototype = new Sofa(
  'SOFA-PROTO-001',
  'Modern L-Shaped Sofa',
  new Position3D(0, 0, 0),
  new Dimensions3D(250, 85, 160),
  new Material('Fabric', 'Gray', 'textile', 0.1),
  1200,
  5,
  true,
  8,
  true
);

// Register prototypes
registry.registerPrototype('office-chair', officeChairPrototype);
registry.registerPrototype('dining-table', diningTablePrototype);
registry.registerPrototype('modern-sofa', modernSofaPrototype);

console.log(`\nAvailable Prototypes: ${registry.listPrototypes().join(', ')}\n`);

// Create scene
const livingRoomScene = new SceneManager('Living Room');

// Clone furniture from prototypes and customize
console.log('\n=== Cloning Furniture ===\n');

const sofa1 = registry.clonePrototype('modern-sofa');
if (sofa1) {
  sofa1.setPosition(new Position3D(100, 0, 50));
  livingRoomScene.addFurniture(sofa1);
}

const sofa2 = registry.clonePrototype('modern-sofa');
if (sofa2) {
  sofa2.setPosition(new Position3D(400, 0, 50));
  sofa2.setMaterial(new Material('Velvet', 'Navy Blue', 'velvet', 0.15));
  livingRoomScene.addFurniture(sofa2);
}

const chair1 = registry.clonePrototype('office-chair');
if (chair1) {
  chair1.setPosition(new Position3D(200, 0, 200));
  livingRoomScene.addFurniture(chair1);
}

const table1 = registry.clonePrototype('dining-table');
if (table1) {
  table1.setPosition(new Position3D(300, 0, 300));
  table1.setMaterial(new Material('Mahogany', 'Dark Brown', 'wood-grain', 0.25));
  livingRoomScene.addFurniture(table1);
}

// Display the scene
livingRoomScene.displayScene();

// Display total price
console.log(`Total Scene Cost: $${livingRoomScene.calculateTotalPrice()}`);

// Demonstrate deep cloning
console.log('\n=== Deep Clone Verification ===\n');
const originalChair = officeChairPrototype;
const clonedChair = originalChair.clone();

console.log('Original Chair:');
originalChair.display();

clonedChair.setPosition(new Position3D(500, 0, 500));
clonedChair.setMaterial(new Material('Fabric', 'Red', 'textile', 0.2));

console.log('\nCloned Chair (Modified):');
clonedChair.display();

console.log('\nOriginal Chair (Unchanged):');
originalChair.display();

console.log('\nAre they the same object?', originalChair === clonedChair);
console.log('Do they have the same ID?', originalChair.getId() === clonedChair.getId());