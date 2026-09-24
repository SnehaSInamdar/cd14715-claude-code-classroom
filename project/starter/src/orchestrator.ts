import { query } from '@anthropic-ai/claude-agent-sdk';
import process from 'process';
import path from 'path';


import {
  ReviewReport,
  ReviewReportJSONSchema,
  ReviewReportSchema,
} from './types/report-types';

import {
  RateLimiter,
  RateLimiterConfig,
  DEFAULT_RATE_LIMITS,
} from './utils/rate-limiter';

import { mcpServersConfig } from './config/mcp.config';

import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester,
} from './agents';

import { ORCHESTRATOR_PROMPT } from './prompts';
import { release } from 'os';
import { readlink } from 'fs';


export interface orchestratorOptions {
  rateLimit?:
 Partial<RateLimiterConfig>;
}

export class CodeReviewOrchestrator {
  private readonly rateLimiter: RateLimiter;

  constructor(options: orchestratorOptions = {}) {
    this.rateLimiter = new RateLimiter({
      ...DEFAULT_RATE_LIMITS,
      ...options.rateLimit,
    });
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<ReviewReport> {
    const prompt = `
 ${ORCHESTRATOR_PROMPT}

Review this GitHub pull request:

Repository owner: ${owner}
Repository name: ${repo}
Pull request number: ${prNumber}

Use the GitHub MCP server to inspect the pull request and its changed files.

You MUST explicitly delegate work using the Task tool to these specailized agents:

1. codeQualityAnalyzer
   -Analyze security, performance, maintainability, style, bug risks,
   and best-practice issues.

2. testCoverageAnalyzer
  -Analyze missing tests, untested paths, branches, functions, classes,
  and important edge cases.

3.refactoringSuggestor
   -Analyze refactoring opportunities, readability, maintainability,
   structure, reuse, and modern coding practices.

Combine the results from all three agents into one final ReviewReport

The final response MUST be structured according to the supplied ReviewReport
JSON schema.

Repository: ${owner}/${repo}
Pull request: #{prNumber}
`;

      const startTime = Date.now();
       
    return withRateLimitForReview(
       this.rateLimiter,
      async () => {
        process.env.PATH = `${path.dirname(process.execPath)}:${process.env.PATH ?? ''}`;
        const q = query({
         prompt,
         options: {
           model: process.env.ANTHROPIC_MODEL,
           cwd: process.env.PROJECT_ROOT  || process.cwd(),
           pathToClaudeCodeExecutable: '/home/codespace/.local/bin/claude',
            mcpServers: mcpServersConfig,
            agents: {
               codeQualityAnalyzer,
               testCoverageAnalyzer,
               refactoringSuggester,
             },

           allowedTools:[
             'Read',
             'Grep',
             'Glob',
             'Skill',
             'Task',
             'mcp__github__*',
             'mcp__eslint_*'
             ],

             outputFormat: {
               type: 'json_schema',
               schema: ReviewReportJSONSchema,
               },

               settingSources: ['project'],
               },
             });

             let structuredOutput: unknown = undefined;
             let queryError: string | undefined;

             for await (const message of q) {
              if (message.type === 'result') {
                 if (message.subtype === 'success') {
                    structuredOutput = message.structured_output;
                 }  else {
                    queryError = message.errors?.join(': ') || 'Review query failed.';
                }
              }
             }

             if (queryError) {
                throw new Error(queryError);
             }

             if (!structuredOutput) {
               throw new Error(
                  'The review completed without returning structured output.',
                  );
                 }

                 const parsed = ReviewReportSchema.safeParse(structuredOutput);

                 if (!parsed.success) {
                   throw new Error(
                      `Invalid ReviewReport returned by orchestrator: ${parsed.error.message}`
                   );
                 }

                 const report = parsed.data;

                 report.pullRequest = {
                     owner,
                     repo,
                     number: prNumber,
                  };

                  report.metadata = {
                  ...report.metadata,
                  analyzedAt:
                    report.metadata?.analyzedAt || new Date(). toISOString(),
                  duration: Date.now() - startTime,
                 };

                 return report;
               },
               12000,
             );
             }
           }    


 async function withRateLimitForReview<T>(
    rateLimiter: RateLimiter,
    fn: () => Promise<T>,
    estimatedTokens: number, 
   ): Promise<T> {
    await rateLimiter.acquire(estimatedTokens);

    try {
      const result = await fn();

      rateLimiter.release();

      return result;
   }  catch (error) {
      rateLimiter.release();
      throw error;
   }
}










               
           
        
               

  





  

