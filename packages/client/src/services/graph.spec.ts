import { countIndirectConnections } from "./graph";

describe("graph", () => {
  describe("countIndirectDependencies", () => {
    it.only("counts all child nodes", () => {
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
          children: ["d", "e", "f", "g", "h"],
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
          children: 5,
          parents: 2,
        },
        d: {
          children: 1,
          parents: 3,
        },
        e: {
          children: 0,
          parents: 4,
        },
        f: {
          children: 0,
          parents: 3,
        },
        g: {
          children: 0,
          parents: 3,
        },
        h: {
          children: 0,
          parents: 3,
        },
      });
    });

    it.only("handles circles", () => {
      const nodes = [
        {
          id: "a",
          children: ["b", "c"],
          parents: ["d"],
        },
        {
          id: "b",
          children: ["c", "d"],
          parents: ["a"],
        },
        {
          id: "c",
          children: [],
          parents: ["a", "b"],
        },
        {
          id: "d",
          children: ["a"],
          parents: ["b"],
        },
      ];
      const actual = countIndirectConnections(nodes);
      expect(actual).toEqual({
        a: {
          children: 4,
          parents: 3,
        },
        b: {
          children: 4,
          parents: 3,
        },
        c: {
          children: 0,
          parents: 3,
        },
        d: {
          children: 4,
          parents: 3,
        },
      });
    });
  });
});
