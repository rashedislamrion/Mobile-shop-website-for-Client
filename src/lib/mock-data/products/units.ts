export type MockUnit = {
  id: string;
  name: string;
  shortCode: string;
};

export const mockUnits: MockUnit[] = [
  { id: "UNT-001", name: "Piece", shortCode: "pc" },
  { id: "UNT-002", name: "Set", shortCode: "set" },
  { id: "UNT-003", name: "Pair", shortCode: "pair" },
  { id: "UNT-004", name: "Box", shortCode: "box" },
  { id: "UNT-005", name: "Dozen", shortCode: "dz" },
  { id: "UNT-006", name: "Meter", shortCode: "m" },
  { id: "UNT-007", name: "Gram", shortCode: "g" },
  { id: "UNT-008", name: "Kilogram", shortCode: "kg" },
];
