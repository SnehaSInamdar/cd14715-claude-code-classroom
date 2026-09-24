import type { AgentDefinition } from "@anthropic-ai/claude-agent-sdk";
import { REFACTORING_SUGGESTER_PROMPT } from "../prompts";

export const refactoringSuggester: AgentDefinition = {
    description:
       'Analyzes pull request code for refactoring opportunities, code structure, readabolity, maintainability, and modern coding practices.',

       tools: ['Read', 'Grep', 'Glob', 'Skill'],

       prompt: REFACTORING_SUGGESTER_PROMPT,

       model: 'inherit',
};
