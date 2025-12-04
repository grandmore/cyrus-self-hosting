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
import type { ProcedureDefinition } from "./types.js";

const WORKFLOWS_DIR = join(homedir(), ".cyrus", "workflows");

// Cache of external procedures loaded at initialization
const externalProcedures = new Map<string, ProcedureDefinition>();

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

			const procedureName = entry.name;
			const registryPath = join(WORKFLOWS_DIR, procedureName, "registry.js");

			if (!existsSync(registryPath)) continue;

			try {
				const registryUrl = pathToFileURL(registryPath).href;
				const module = await import(`${registryUrl}?t=${Date.now()}`);

				if (typeof module.getProcedure === "function") {
					const procedure = module.getProcedure(procedureName);
					if (procedure) {
						externalProcedures.set(procedureName, procedure);
						console.log(
							`[External Workflow] Loaded procedure "${procedureName}" from ${registryPath}`,
						);
					}
				}
			} catch (error) {
				console.debug(
					`[External Workflow] Failed to load ${procedureName}:`,
					error instanceof Error ? error.message : error,
				);
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
