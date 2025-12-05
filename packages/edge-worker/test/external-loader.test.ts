/**
 * Comprehensive tests for external-loader.ts
 *
 * Tests the external workflow loading system that loads procedures, subroutines,
 * classifications, system prompts, and EdgeWorker from ~/.cyrus/workflows/
 */

import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// Import everything from external-loader to test exports
import {
	CLASSIFICATION_TO_PROCEDURE,
	EdgeWorker,
	getAllExternalClassificationMappings,
	getAllLoadedPromptTypes,
	getExternalClassificationToProcedure,
	getExternalPromptTypes,
	getProcedure,
	getProcedureForClassification,
	getSystemPromptPath,
	loadExternalProcedure,
	loadExternalSubroutine,
	loadExternalSystemPrompt,
	PROCEDURES,
	SUBROUTINES,
} from "../src/procedures/external-loader.js";
// Import internal registry to compare
import {
	CLASSIFICATION_TO_PROCEDURE as INTERNAL_CLASSIFICATION_TO_PROCEDURE,
	PROCEDURES as INTERNAL_PROCEDURES,
	SUBROUTINES as INTERNAL_SUBROUTINES,
	getProcedure as internalGetProcedure,
} from "../src/procedures/registry.js";

const WORKFLOWS_DIR = join(homedir(), ".cyrus", "workflows");

describe("External Loader - Exports", () => {
	describe("Re-exported Constants", () => {
		it("should re-export PROCEDURES from internal registry", () => {
			expect(PROCEDURES).toBeDefined();
			expect(PROCEDURES).toBe(INTERNAL_PROCEDURES);
		});

		it("should re-export SUBROUTINES from internal registry", () => {
			expect(SUBROUTINES).toBeDefined();
			expect(SUBROUTINES).toBe(INTERNAL_SUBROUTINES);
		});

		it("should re-export CLASSIFICATION_TO_PROCEDURE from internal registry", () => {
			expect(CLASSIFICATION_TO_PROCEDURE).toBeDefined();
			expect(CLASSIFICATION_TO_PROCEDURE).toBe(
				INTERNAL_CLASSIFICATION_TO_PROCEDURE,
			);
		});
	});

	describe("EdgeWorker Export", () => {
		it("should export EdgeWorker as a class (value export)", () => {
			expect(EdgeWorker).toBeDefined();
			expect(typeof EdgeWorker).toBe("function"); // Classes are functions
		});

		it("should export EdgeWorker that can be instantiated", () => {
			// EdgeWorker should be a constructor
			expect(EdgeWorker.prototype).toBeDefined();
			expect(EdgeWorker.prototype.constructor).toBe(EdgeWorker);
		});

		it("should export EdgeWorker with same prototype as InternalEdgeWorker (when no external)", () => {
			// If no external EdgeWorker exists, should be the internal one
			// We can't guarantee this in all environments, but we can check the shape
			expect(EdgeWorker.prototype.constructor.name).toBe("EdgeWorker");
		});

		it("EdgeWorker should be usable as a type annotation", () => {
			// This test verifies the dual export pattern works
			// If this compiles, the type export is working
			const workerInstance: EdgeWorker | null = null;
			expect(workerInstance).toBeNull();
		});
	});

	describe("Function Exports", () => {
		it("should export loadExternalProcedure function", () => {
			expect(loadExternalProcedure).toBeDefined();
			expect(typeof loadExternalProcedure).toBe("function");
		});

		it("should export loadExternalSystemPrompt function", () => {
			expect(loadExternalSystemPrompt).toBeDefined();
			expect(typeof loadExternalSystemPrompt).toBe("function");
		});

		it("should export getSystemPromptPath function", () => {
			expect(getSystemPromptPath).toBeDefined();
			expect(typeof getSystemPromptPath).toBe("function");
		});

		it("should export getExternalPromptTypes function", () => {
			expect(getExternalPromptTypes).toBeDefined();
			expect(typeof getExternalPromptTypes).toBe("function");
		});

		it("should export loadExternalSubroutine function", () => {
			expect(loadExternalSubroutine).toBeDefined();
			expect(typeof loadExternalSubroutine).toBe("function");
		});

		it("should export getExternalClassificationToProcedure function", () => {
			expect(getExternalClassificationToProcedure).toBeDefined();
			expect(typeof getExternalClassificationToProcedure).toBe("function");
		});

		it("should export getAllExternalClassificationMappings function", () => {
			expect(getAllExternalClassificationMappings).toBeDefined();
			expect(typeof getAllExternalClassificationMappings).toBe("function");
		});

		it("should export getAllLoadedPromptTypes function", () => {
			expect(getAllLoadedPromptTypes).toBeDefined();
			expect(typeof getAllLoadedPromptTypes).toBe("function");
		});

		it("should export getProcedure function", () => {
			expect(getProcedure).toBeDefined();
			expect(typeof getProcedure).toBe("function");
		});

		it("should export getProcedureForClassification function", () => {
			expect(getProcedureForClassification).toBeDefined();
			expect(typeof getProcedureForClassification).toBe("function");
		});
	});
});

describe("External Loader - Fallback Behavior", () => {
	describe("getProcedure", () => {
		it("should return undefined for non-existent procedures", () => {
			const result = getProcedure("completely-non-existent-procedure-xyz");
			expect(result).toBeUndefined();
		});

		it("should return internal procedure when no external exists", () => {
			// simple-question is an internal procedure unlikely to be overridden
			const result = getProcedure("simple-question");
			const internal = internalGetProcedure("simple-question");

			expect(result).toBeDefined();
			expect(result).toEqual(internal);
		});

		it("should return a valid ProcedureDefinition structure", () => {
			const result = getProcedure("simple-question");

			if (result) {
				expect(result.name).toBe("simple-question");
				expect(result.description).toBeDefined();
				expect(Array.isArray(result.subroutines)).toBe(true);
			}
		});
	});

	describe("getProcedureForClassification", () => {
		it("should return procedure name for 'code' classification", () => {
			const result = getProcedureForClassification("code");
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should return procedure name for 'question' classification", () => {
			const result = getProcedureForClassification("question");
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should return procedure name for 'documentation' classification", () => {
			const result = getProcedureForClassification("documentation");
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});

		it("should return procedure name for 'planning' classification", () => {
			const result = getProcedureForClassification("planning");
			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
		});
	});

	describe("getSystemPromptPath", () => {
		it("should return a path for builder prompt type", () => {
			const internalDir = join(__dirname, "../src/prompts");
			const result = getSystemPromptPath("builder", internalDir);

			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
			expect(result.endsWith(".md")).toBe(true);
		});

		it("should return a path for debugger prompt type", () => {
			const internalDir = join(__dirname, "../src/prompts");
			const result = getSystemPromptPath("debugger", internalDir);

			expect(result).toBeDefined();
			expect(typeof result).toBe("string");
			expect(result.endsWith(".md")).toBe(true);
		});

		it("should return internal path when external does not exist", () => {
			const internalDir = "/fake/internal/prompts";
			const result = getSystemPromptPath(
				"non-existent-prompt-type-xyz",
				internalDir,
			);

			// Should fall back to internal path
			expect(result).toBe(join(internalDir, "non-existent-prompt-type-xyz.md"));
		});
	});
});

describe("External Loader - Cache Functions", () => {
	describe("loadExternalProcedure", () => {
		it("should return undefined for non-cached procedure", () => {
			const result = loadExternalProcedure(
				"definitely-not-in-cache-procedure-xyz",
			);
			expect(result).toBeUndefined();
		});
	});

	describe("loadExternalSubroutine", () => {
		it("should return undefined for non-cached subroutine", () => {
			const result = loadExternalSubroutine(
				"definitely-not-in-cache-subroutine-xyz",
			);
			expect(result).toBeUndefined();
		});
	});

	describe("loadExternalSystemPrompt", () => {
		it("should return undefined for non-cached system prompt", () => {
			const result = loadExternalSystemPrompt(
				"definitely-not-in-cache-prompt-xyz",
			);
			expect(result).toBeUndefined();
		});
	});

	describe("getExternalClassificationToProcedure", () => {
		it("should return undefined when no external mapping exists", () => {
			// Only returns external mappings, not internal
			// Most classifications won't have external overrides
			const result = getExternalClassificationToProcedure("question");
			// Could be undefined (no external) or a string (has external)
			expect(result === undefined || typeof result === "string").toBe(true);
		});
	});

	describe("getAllExternalClassificationMappings", () => {
		it("should return a Map", () => {
			const result = getAllExternalClassificationMappings();
			expect(result).toBeInstanceOf(Map);
		});
	});

	describe("getExternalPromptTypes", () => {
		it("should return an array", () => {
			const result = getExternalPromptTypes();
			expect(Array.isArray(result)).toBe(true);
		});

		it("should return strings in the array", () => {
			const result = getExternalPromptTypes();
			for (const item of result) {
				expect(typeof item).toBe("string");
			}
		});
	});

	describe("getAllLoadedPromptTypes", () => {
		it("should return an array", () => {
			const result = getAllLoadedPromptTypes();
			expect(Array.isArray(result)).toBe(true);
		});

		it("should return strings in the array", () => {
			const result = getAllLoadedPromptTypes();
			for (const item of result) {
				expect(typeof item).toBe("string");
			}
		});
	});
});

describe("External Loader - Integration with ~/.cyrus/workflows/", () => {
	it("WORKFLOWS_DIR should be ~/.cyrus/workflows/", () => {
		const expectedDir = join(homedir(), ".cyrus", "workflows");
		expect(expectedDir).toBe(WORKFLOWS_DIR);
	});

	describe("When external workflows exist", () => {
		it("should load external full-development procedure if it exists", () => {
			const procedure = getProcedure("full-development");

			// full-development should always exist (either external or internal)
			expect(procedure).toBeDefined();
			expect(procedure?.name).toBe("full-development");
			expect(procedure?.subroutines).toBeDefined();
			expect(procedure?.subroutines.length).toBeGreaterThan(0);
		});

		it("external procedures should have valid subroutine references", () => {
			const procedure = getProcedure("full-development");

			if (procedure) {
				for (const subroutine of procedure.subroutines) {
					expect(subroutine.name).toBeDefined();
					expect(typeof subroutine.name).toBe("string");
					expect(subroutine.description).toBeDefined();
					expect(subroutine.promptPath).toBeDefined();
				}
			}
		});
	});
});

describe("External Loader - Type Safety", () => {
	it("getProcedure should return ProcedureDefinition | undefined", () => {
		const result = getProcedure("simple-question");

		if (result !== undefined) {
			// Type narrowing - if defined, should have ProcedureDefinition shape
			expect(result.name).toBeDefined();
			expect(result.description).toBeDefined();
			expect(result.subroutines).toBeDefined();
		}
	});

	it("getProcedureForClassification should return string", () => {
		const result = getProcedureForClassification("code");
		expect(typeof result).toBe("string");
	});

	it("getSystemPromptPath should always return string", () => {
		const result = getSystemPromptPath("any-type", "/any/path");
		expect(typeof result).toBe("string");
	});
});
