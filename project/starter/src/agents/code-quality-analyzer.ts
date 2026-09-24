import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_PROMPT } from '../prompts';

export const codeQualityAnalyzer:
AgentDefinition = {
    description :
       'Analyzes pull request code for security, performance, maintainability, style, bug risks, and best practices.',

       tools: ['Read', 'Grep', 'Glob', 'Skill'],

       prompt: CODE_QUALITY_PROMPT,

       model: 'inherit',

};