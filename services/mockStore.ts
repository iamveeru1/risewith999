import { Unit, UnitStatus, Buyer, AccessCode, VisitData } from '../types';

// Generate units for 55 floors, 2 towers, 4 homes each
const generateMockUnits = (): Unit[] => {
  const units: Unit[] = [];
  const towers = ['9 South', '9 North'];
  for (const tower of towers) {
    for (let floor = 1; floor <= 55; floor++) {
      for (let home = 1; home <= 4; home++) {
        const id = `${tower}-${floor}-${home}`;
        // Randomize status for visual variety in demo
        let status = UnitStatus.AVAILABLE;
        const rand = Math.random();
        if (rand > 0.8) status = UnitStatus.SOLD;
        else if (rand > 0.7) status = UnitStatus.LOCKED;
        else if (rand > 0.6) status = UnitStatus.RESERVED;

        units.push({
          id,
          number: `Home ${home}`,
          floor,
          tower,
          type: home % 2 === 0 ? '4BHK' : '3BHK',
          sqft: home % 2 === 0 ? 2400 : 1850,
          price: home % 2 === 0 ? '$620,000' : '$450,000',
          status,
        });
      }
    }
  }
  return units;
};

const MOCK_UNITS = generateMockUnits();

const MOCK_BUYERS: Buyer[] = [
  {
    id: 'b1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555-0101',
    assignedUnitId: '9 South-1-1',
    accessCode: 'RISE-9999',
    codeGeneratedAt: Date.now() - (10 * 60 * 1000) // Generated 10 minutes ago for testing
  },
  { id: 'b2', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 555-0102', assignedUnitId: null },
];

const MOCK_CODES: AccessCode[] = [
  {
    code: 'RISE-9999',
    buyerId: 'b1',
    unitId: '9 South-1-1',
    generatedAt: Date.now(),
    expiresAt: Date.now() + 3600000,
    isUsed: false
  }
];

export const MOCK_ANALYTICS: VisitData[] = [
  { name: 'Living Room', visits: 120, avgTime: 5.2 },
  { name: 'Master Bed', visits: 98, avgTime: 4.1 },
  { name: 'Kitchen', visits: 86, avgTime: 3.5 },
  { name: 'Balcony', visits: 150, avgTime: 6.8 },
  { name: 'Guest Room', visits: 40, avgTime: 2.0 },
];

class StoreService {
  private units: Unit[] = MOCK_UNITS;
  private buyers: Buyer[] = MOCK_BUYERS;
  private codes: AccessCode[] = MOCK_CODES;

  getUnits() { return [...this.units]; }

  toggleUnitStatus(id: string, newStatus?: UnitStatus) {
    this.units = this.units.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: newStatus || (u.status === UnitStatus.AVAILABLE ? UnitStatus.LOCKED : UnitStatus.AVAILABLE)
        };
      }
      return u;
    });
    return this.getUnits();
  }

  getBuyers() { return [...this.buyers]; }
  addBuyer(buyer: Buyer) { this.buyers.push(buyer); return this.getBuyers(); }
  updateBuyer(updatedBuyer: Buyer) {
    this.buyers = this.buyers.map(b => b.id === updatedBuyer.id ? updatedBuyer : b);
    return this.getBuyers();
  }
  deleteBuyer(buyerId: string) {
    this.buyers = this.buyers.filter(b => b.id !== buyerId);
    return this.getBuyers();
  }
  generateCode(buyerId: string, unitId: string): AccessCode {
    const code = `RISE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCode: AccessCode = { code, buyerId, unitId, generatedAt: Date.now(), expiresAt: Date.now() + 3600000, isUsed: false };
    this.codes.push(newCode);
    return newCode;
  }
  getCodes() { return [...this.codes]; }

  validateCode(inputCode: string): { valid: boolean; message: string; accessCode?: AccessCode, unit?: Unit } {
    const accessCode = this.codes.find(c => c.code === inputCode);
    if (!accessCode) return { valid: false, message: 'Invalid Access Code.' };
    const unit = this.units.find(u => u.id === accessCode.unitId);
    if (!unit) return { valid: false, message: 'Linked unit not found.' };
    return { valid: true, message: 'Success', accessCode, unit };
  }
}

export const store = new StoreService();