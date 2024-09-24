import { atom, PrimitiveAtom, useAtom } from "jotai";

const atoms = new Map<string, PrimitiveAtom<string[] | undefined>>();
const marketsFilterAtom = (name: string) => {
  const namedAtom = atoms.get(name);
  if (!namedAtom) {
    const newAtom = atom<string[] | undefined>(undefined);
    atoms.set(name, newAtom);
    return newAtom;
  }
  return namedAtom;
};

export function useFilterStore(name: string) {
  const [filter, setFilter] = useAtom(marketsFilterAtom(name));
  return { filter, setFilter };
}
