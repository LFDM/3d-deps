import { countIndirectConnections } from "./graph";

describe("graph", () => {
  describe("countIndirectDependencies", () => {
    const nodes = [
      {
        id: "a",
        children: ["b", "c"],
        parents: [],
      },
      {
        id: "b",
        children: ["c", "d"],
        parents: ["a"],
      },
      {
        id: "c",
        children: ["e", "f", "g", "h"],
        parents: ["a", "b"],
      },
      {
        id: "d",
        children: ["e"],
        parents: ["c"],
      },
      {
        id: "e",
        children: [],
        parents: ["c", "d"],
      },
      {
        id: "f",
        children: [],
        parents: ["c"],
      },
      {
        id: "g",
        children: [],
        parents: ["c"],
      },
      {
        id: "h",
        children: [],
        parents: ["c"],
      },
    ];

    it.only("counts all child nodes", () => {
      const actual = countIndirectConnections(nodes);
      expect(actual).toEqual({
        a: {
          children: 7,
          parents: 0,
        },
        b: {
          children: 6,
          parents: 1,
        },
        c: {
          children: 4,
          parents: 2,
        },
        d: {
          children: 1,
          parents: 2,
        },
        e: {
          children: 0,
          parents: 3,
        },
      });
    });
  });
});
