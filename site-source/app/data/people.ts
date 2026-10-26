import source from "./source-tree.json";
import { draftGender, type GenderHaze } from "./genders";

export type Person = {
  id: string;
  name: string;
  gen: number;
  parentId: string | null;
  partnerOf: string | null;
  deceased: boolean;
  gender: GenderHaze;
  source: "tree" | "partner" | "added";
};

type SourcePerson = {
  id: string;
  name: string;
  gen: number;
  parentId: string | null;
  deceased: boolean;
  gender?: GenderHaze;
  spouses: { name: string; deceased: boolean; gender?: GenderHaze }[];
};

export const people: Person[] = (source.people as SourcePerson[]).flatMap((person) => [
  {
    id: person.id,
    name: person.name,
    gen: person.gen,
    parentId: person.parentId,
    partnerOf: null,
    deceased: person.deceased,
    gender: person.gender ?? draftGender(person.name),
    source: "tree" as const,
  },
  ...person.spouses
    .filter((spouse) => spouse.name.trim().toLowerCase() !== "unknown")
    .map((spouse, index) => ({
      id: `partner-${person.id}-${index}`,
      name: spouse.name,
      gen: person.gen,
      parentId: null,
      partnerOf: person.id,
      deceased: spouse.deceased,
      gender: spouse.gender ?? draftGender(spouse.name),
      source: "partner" as const,
    })),
]);

export function primaryPerson(person: Person, all: Person[] = people): Person {
  return person.partnerOf
    ? all.find((candidate) => candidate.id === person.partnerOf) ?? person
    : person;
}

export function childrenOf(id: string, all: Person[] = people): Person[] {
  return all.filter((candidate) => candidate.parentId === id);
}

export function partnersOf(id: string, all: Person[] = people): Person[] {
  return all.filter((candidate) => candidate.partnerOf === id);
}

export function branchOf(person: Person, all: Person[] = people): string | null {
  let current = primaryPerson(person, all);
  const seen = new Set<string>();
  while (current.gen > 6 && current.parentId && !seen.has(current.id)) {
    seen.add(current.id);
    current = all.find((candidate) => candidate.id === current.parentId) ?? current;
  }
  return current.gen === 6 ? current.id : null;
}
