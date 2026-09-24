import type { AgentDefinition } from "@anthropic-ai/claude-agent-sdk";
import { TEST_COVERAGE_PROMPT } from "../prompts";

export const testCoverageAnalyzer:
AgentDefinition = {
    description:
       'Analyzes pull request code for missing tests, untested paths, braches, edge cases, and coverage gaps.',

       tools: ['Read', 'Grep', 'Glob', 'Skill'],

       prompt: TEST_COVERAGE_PROMPT,

       model: 'inherit',
};