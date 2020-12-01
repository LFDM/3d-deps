import { cleanupNodeModuleName } from "./postprocessor";

describe("analyzer-js", () => {
  describe("_cleanpNodeModuleName", () => {
    it("handles scoped modules", () => {
      const actual = cleanupNodeModuleName(
        "../node_modules/@emotion/react/types/index.d.ts"
      );
      expect(actual).toEqual("../node_modules/@emotion/react");
    });

    it("handles unscoped modules, leading directly to an index file", () => {
      const actual = cleanupNodeModuleName(
        "../node_modules/assert-never/index.d.ts"
      );
      expect(actual).toEqual("../node_modules/assert-never");
    });

    it("handles unscoped modules, leading to a file within", () => {
      const actual = cleanupNodeModuleName(
        "../node_modules/react-feather/dist/index.d.ts"
      );
      expect(actual).toEqual("../node_modules/react-feather");
    });

    it("handles @types", () => {
      const actual = cleanupNodeModuleName(
        "../node_modules/@types/react/index.d.ts"
      );
      expect(actual).toEqual("../node_modules/react");
    });

    it("returns null for a random file called node_modules", () => {
      const actual = cleanupNodeModuleName("xxx/node_modules.ts");
      expect(actual).toEqual(null);
    });

    it("returns null when not a node module", () => {
      const actual = cleanupNodeModuleName("hooks/useWindowSize.ts");
      expect(actual).toBe(null);
    });
  });
});
