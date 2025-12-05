/**
 * External workflow loader
 * Pre-loads external procedure definitions from ~/.cyrus/workflows/ at module initialization
 *
 * This maintains a synchronous getProcedure() interface by loading all external
 * workflows when this module is first imported.
 */

import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type {
	ProcedureDefinition,
	RequestClassification,
	SubroutineDefinition,
} from "./types.js";

const WORKFLOWS_DIR = join(homedir(), ".cyrus", "workflows");

// Cache of external procedures loaded at initialization
const externalProcedures = new Map<string, ProcedureDefinition>();

// Cache of external subroutines loaded at initialization
const externalSubroutines = new Map<string, SubroutineDefinition>();

// Cache of external classification to procedure mappings
const externalClassificationToProcedure = new Map<
	RequestClassification,
	string
>();

// Cache of external system prompts (promptType → absolute file path)
const externalSystemPrompts = new Map<string, string>();

// Set of external prompt types (collected from registry.js PROMPT_TYPES exports)
const externalPromptTypes = new Set<string>();

/**
 * Initialize external workflows by scanning ~/.cyrus/workflows/
 * This runs once when the module is first imported
 */
async function initializeExternalWorkflows() {
	if (!existsSync(WORKFLOWS_DIR)) {
		return;
	}

	try {
		const entries = readdirSync(WORKFLOWS_DIR, { withFileTypes: true });

		for (const entry of entries) {
			if (!entry.isDirectory()) continue;

			const workflowName = entry.name;
			const workflowPath = join(WORKFLOWS_DIR, workflowName);

			// Load procedures from registry.js
			const registryPath = join(workflowPath, "registry.js");
			if (existsSync(registryPath)) {
				try {
					const registryUrl = pathToFileURL(registryPath).href;
					const module = await import(`${registryUrl}?t=${Date.now()}`);

					// Load all subroutines from SUBROUTINES export
					if (module.SUBROUTINES && typeof module.SUBROUTINES === "object") {
						for (const [, subroutine] of Object.entries(module.SUBROUTINES)) {
							const sub = subroutine as SubroutineDefinition;
							externalSubroutines.set(sub.name, sub);
							console.log(
								`[External Workflow] Loaded subroutine "${sub.name}" from ${registryPath}`,
							);
						}
					}

					// Load all procedures from PROCEDURES export
					if (module.PROCEDURES && typeof module.PROCEDURES === "object") {
						for (const [name, procedure] of Object.entries(module.PROCEDURES)) {
							externalProcedures.set(name, procedure as ProcedureDefinition);
							console.log(
								`[External Workflow] Loaded procedure "${name}" from ${registryPath}`,
							);
						}
					}

					// Load classification to procedure mappings
					if (
						module.CLASSIFICATION_TO_PROCEDURE &&
						typeof module.CLASSIFICATION_TO_PROCEDURE === "object"
					) {
						for (const [classification, procedureName] of Object.entries(
							module.CLASSIFICATION_TO_PROCEDURE,
						)) {
							externalClassificationToProcedure.set(
								classification as RequestClassification,
								procedureName as string,
							);
							console.log(
								`[External Workflow] Mapped classification "${classification}" → "${procedureName}" from ${registryPath}`,
							);
						}
					}

					// Collect PROMPT_TYPES from registry
					if (Array.isArray(module.PROMPT_TYPES)) {
						for (const promptType of module.PROMPT_TYPES) {
							externalPromptTypes.add(promptType);
							console.log(
								`[External Workflow] Registered prompt type "${promptType}" from ${registryPath}`,
							);
						}
					}
				} catch (error) {
					console.debug(
						`[External Workflow] Failed to load ${workflowName}:`,
						error instanceof Error ? error.message : error,
					);
				}
			}

			// Load system prompts from system-prompts/*.md
			const systemPromptsDir = join(workflowPath, "system-prompts");
			if (existsSync(systemPromptsDir)) {
				try {
					const promptFiles = readdirSync(systemPromptsDir, {
						withFileTypes: true,
					});

					for (const promptFile of promptFiles) {
						if (!promptFile.isFile() || !promptFile.name.endsWith(".md"))
							continue;

						const promptType = promptFile.name.replace(/\.md$/, "");
						const promptPath = join(systemPromptsDir, promptFile.name);

						// Later workflows override earlier ones
						externalSystemPrompts.set(promptType, promptPath);
						console.log(
							`[External Workflow] Loaded system prompt "${promptType}" from ${promptPath}`,
						);
					}
				} catch (error) {
					console.debug(
						`[External Workflow] Failed to scan system prompts in ${workflowName}:`,
						error instanceof Error ? error.message : error,
					);
				}
			}
		}
	} catch (error) {
		console.debug(
			"[External Workflow] Failed to scan workflows directory:",
			error instanceof Error ? error.message : error,
		);
	}
}

// Initialize on module load (top-level await)
await initializeExternalWorkflows();

/**
 * Get a procedure from the external workflows cache
 *
 * @param name - The procedure name to load (e.g., "full-development")
 * @returns ProcedureDefinition from external registry, or undefined if not found
 */
export function loadExternalProcedure(
	name: string,
): ProcedureDefinition | undefined {
	return externalProcedures.get(name);
}

/**
 * Get a system prompt file path from the external workflows cache
 *
 * @param promptType - The prompt type (e.g., "builder", "debugger", "orchestrator", "scoper")
 * @returns Absolute file path to the external system prompt, or undefined if not found
 */
export function loadExternalSystemPrompt(
	promptType: string,
): string | undefined {
	return externalSystemPrompts.get(promptType);
}

/**
 * Get system prompt path - checks external first, falls back to internal
 *
 * @param promptType - The prompt type
 * @param internalPromptsDir - Path to internal prompts directory
 * @returns Absolute file path to the system prompt
 */
export function getSystemPromptPath(
	promptType: string,
	internalPromptsDir: string,
): string {
	const externalPath = externalSystemPrompts.get(promptType);
	if (externalPath) {
		console.log(
			`[External Workflow] Using external ${promptType} system prompt from ${externalPath}`,
		);
		return externalPath;
	}

	const internalPath = join(internalPromptsDir, `${promptType}.md`);
	console.log(
		`[External Workflow] Using internal ${promptType} system prompt from ${internalPath}`,
	);
	return internalPath;
}

/**
 * Get all external prompt types registered by workflows
 *
 * @returns Array of prompt type names (e.g., ["tdd-builder"])
 */
export function getExternalPromptTypes(): string[] {
	return Array.from(externalPromptTypes);
}

/**
 * Get a subroutine from the external workflows cache
 */
export function loadExternalSubroutine(
	name: string,
): SubroutineDefinition | undefined {
	return externalSubroutines.get(name);
}

/**
 * Get procedure name for a classification from external workflows
 * Returns undefined if no external mapping exists
 */
export function getExternalClassificationToProcedure(
	classification: RequestClassification,
): string | undefined {
	return externalClassificationToProcedure.get(classification);
}

/**
 * Get all external classification mappings
 */
export function getAllExternalClassificationMappings(): Map<
	RequestClassification,
	string
> {
	return externalClassificationToProcedure;
}

/**
 * Get all system prompt types that have been loaded from external workflows
 * This includes both built-in types (debugger, builder, etc.) that were overridden
 * and any new types (like tdd-builder) added by external workflows
 *
 * @returns Array of all loaded system prompt type names
 */
export function getAllLoadedPromptTypes(): string[] {
	return Array.from(externalSystemPrompts.keys());
}

// ============================================================================
// Registry Loading - external if exists, otherwise internal
// ============================================================================

import {
	CLASSIFICATION_TO_PROCEDURE as INTERNAL_CLASSIFICATION_TO_PROCEDURE,
	PROCEDURES as INTERNAL_PROCEDURES,
	SUBROUTINES as INTERNAL_SUBROUTINES,
	getProcedure as internalGetProcedure,
	getProcedureForClassification as internalGetProcedureForClassification,
} from "./registry.js";

/**
 * Get a procedure definition by name
 * Checks external first, falls back to internal
 */
export function getProcedure(name: string): ProcedureDefinition | undefined {
	const external = externalProcedures.get(name);
	if (external) {
		return external;
	}
	return internalGetProcedure(name);
}

/**
 * Get procedure name for a given classification
 * Checks external first, falls back to internal
 */
export function getProcedureForClassification(
	classification: RequestClassification,
): string {
	const external = externalClassificationToProcedure.get(classification);
	if (external) {
		return external;
	}
	return internalGetProcedureForClassification(classification);
}

// Re-export internal constants for backwards compatibility
export const PROCEDURES = INTERNAL_PROCEDURES;
export const SUBROUTINES = INTERNAL_SUBROUTINES;
export const CLASSIFICATION_TO_PROCEDURE = INTERNAL_CLASSIFICATION_TO_PROCEDURE;

// ============================================================================
// EdgeWorker Loading - external if exists, otherwise internal
// ============================================================================

import { EdgeWorker as InternalEdgeWorker } from "../EdgeWorker.js";

const EXTERNAL_EDGE_WORKER_PATH = join(WORKFLOWS_DIR, "EdgeWorker.js");

async function loadEdgeWorker(): Promise<typeof InternalEdgeWorker> {
	if (existsSync(EXTERNAL_EDGE_WORKER_PATH)) {
		try {
			const externalUrl = pathToFileURL(EXTERNAL_EDGE_WORKER_PATH).href;
			const module = await import(`${externalUrl}?t=${Date.now()}`);

			if (module.EdgeWorker) {
				console.log(
					`[External Workflow] Using external EdgeWorker from ${EXTERNAL_EDGE_WORKER_PATH}`,
				);
				return module.EdgeWorker;
			}
			console.log(
				`[External Workflow] External EdgeWorker found but no EdgeWorker export, using internal`,
			);
		} catch (error) {
			console.error(
				`[External Workflow] Failed to load external EdgeWorker:`,
				error instanceof Error ? error.message : error,
			);
		}
	}

	return InternalEdgeWorker;
}

// Load at module initialization
const LoadedEdgeWorker = await loadEdgeWorker();

// Export value
export const EdgeWorker: typeof InternalEdgeWorker = LoadedEdgeWorker;

// Export type (for type annotations like `edgeWorker: EdgeWorker`)
export type EdgeWorker = InternalEdgeWorker;
