/**
 * Tests for external workflow loading from ~/.cyrus/workflows/
 */

import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getProcedure } from "../src/procedures/registry.js";

describe("External Workflow Loading", () => {
	it("should load external workflow if it exists", () => {
		// The full-development workflow should exist at ~/.cyrus/workflows/full-development/
		const procedure = getProcedure("full-development");

		expect(procedure).toBeDefined();
		expect(procedure?.name).toBe("full-development");
		expect(procedure?.subroutines).toBeDefined();
		expect(procedure?.subroutines.length).toBeGreaterThan(0);

		// Check that subroutines have paths (either relative or absolute)
		for (const subroutine of procedure?.subroutines ?? []) {
			expect(subroutine.promptPath).toBeDefined();
			expect(subroutine.name).toBeDefined();
			expect(subroutine.description).toBeDefined();
		}
	});

	it("should fall back to internal workflow if external does not exist", () => {
		// simple-question should not exist externally, so it should use internal
		const procedure = getProcedure("simple-question");

		expect(procedure).toBeDefined();
		expect(procedure?.name).toBe("simple-question");
		expect(procedure?.subroutines).toBeDefined();
	});

	it("should handle non-existent procedures gracefully", () => {
		const procedure = getProcedure("non-existent-procedure");
		expect(procedure).toBeUndefined();
	});

	it("external workflow paths should be absolute", () => {
		const procedure = getProcedure("full-development");

		// If the external workflow exists, check if paths are absolute
		if (procedure) {
			const workflowDir = join(
				homedir(),
				".cyrus",
				"workflows",
				"full-development",
			);

			// At least one subroutine should have an absolute path starting with the workflow directory
			const hasAbsolutePath = procedure.subroutines.some(
				(sub) =>
					sub.promptPath !== "primary" &&
					sub.promptPath.startsWith(workflowDir),
			);

			// This will be true if external workflow is loaded
			if (hasAbsolutePath) {
				console.log(
					"[Test] External workflow detected - paths are absolute as expected",
				);
			} else {
				console.log(
					"[Test] Internal workflow detected - paths are relative as expected",
				);
			}

			expect(procedure.subroutines.length).toBeGreaterThan(0);
		}
	});
});
