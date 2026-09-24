import { describe, it, expect, vi, beforeEach } from 'vitest';
 
const mockQuery = vi.hoisted(() => vi.fn());
 
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: mockQuery,
}));
 
import { CodeReviewOrchestrator } from '../src/orchestrator';
 
const mockReviewReport = {
  pullRequest: {
    owner: 'test-owner',
    repo: 'test-repo',
    number: 1,
  },
 
  fileReviews: [
    {
      file: 'src/example.ts',
 
      codeQuality: {
        file: 'src/example.ts',
        issues: [],
        overallScore: 90,
        summary: 'Code quality is good.',
      },
 
      testCoverage: {
        file: 'src/example.ts',
        hasTests: true,
        testFiles: ['tests/example.test.ts'],
        untestedPaths: [],
        coverageEstimate: 90,
        summary: 'Good test coverage.',
      },
 
      refactorings: {
        file: 'src/example.ts',
        suggestions: [],
        summary: 'No refactoring suggestions are required.',
      },
    },
  ],
 
  summary: {
    totalFiles: 1,
    overallScore: 90,
    criticalIssues: 0,
    highPriorityTests: 0,
    refactoringOpportunities: 0,
  },
 
  recommendations: [],
 
  metadata: {
    analyzedAt: '2026-09-23T00:00:00.000Z',
    duration: 100,
    agentVersions: {
      codeQualityAnalyzer: '1.0',
      testCoverageAnalyzer: '1.0',
      refactoringSuggester: '1.0',
    },
  },
};
 
function createSuccessfulQuery() {
  return (async function* () {
    yield {
      type: 'result',
      subtype: 'success',
      structured_output: mockReviewReport,
    };
  })();
}
 
describe('CodeReviewOrchestrator', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockImplementation(() => createSuccessfulQuery());
  });
 
  describe('Configuration', () => {
    it('initializes with default options', () => {
      const orchestrator = new CodeReviewOrchestrator();
 
      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
    });
 
    it('accepts custom rate limit configuration', () => {
      const orchestrator = new CodeReviewOrchestrator({
        rateLimit: {
          maxRequestsPerMinute: 10,
          maxTokensPerMinute: 10000,
          maxConcurrent: 2,
        },
      });
 
      expect(orchestrator).toBeInstanceOf(CodeReviewOrchestrator);
    });
  });
 
  describe('reviewPullRequest', () => {
    it('calls the Claude Agent SDK query for a pull request review', async () => {
      const orchestrator = new CodeReviewOrchestrator();
 
      const report = await orchestrator.reviewPullRequest(
        'test-owner',
        'test-repo',
        1
      );
 
      expect(mockQuery).toHaveBeenCalledTimes(1);
 
      expect(report.pullRequest).toEqual({
        owner: 'test-owner',
        repo: 'test-repo',
        number: 1,
      });
    });
 
    it('passes the required MCP and agent configuration to the SDK', async () => {
      const orchestrator = new CodeReviewOrchestrator();
 
      await orchestrator.reviewPullRequest(
        'test-owner',
        'test-repo',
        1
      );
 
      const [request] = mockQuery.mock.calls[0];
 
      expect(request.options).toBeDefined();
      expect(request.options.mcpServers).toBeDefined();
      expect(request.options.agents).toBeDefined();
      expect(request.options.allowedTools).toContain('Task');
      expect(request.options.outputFormat).toBeDefined();
    });
 
    it('aggregates the mocked structured output into a ReviewReport', async () => {
      const orchestrator = new CodeReviewOrchestrator();
 
      const report = await orchestrator.reviewPullRequest(
        'test-owner',
        'test-repo',
        1
      );
 
      expect(report.fileReviews).toHaveLength(1);
      expect(report.fileReviews[0].file).toBe('src/example.ts');
      expect(report.summary.overallScore).toBe(90);
 
      expect(report.metadata.agentVersions).toHaveProperty(
        'codeQualityAnalyzer'
      );
    });
 
    it('validates the structured output with the ReviewReport schema', async () => {
      const orchestrator = new CodeReviewOrchestrator();
 
      const report = await orchestrator.reviewPullRequest(
        'test-owner',
        'test-repo',
        1
      );
 
      expect(report.summary.totalFiles).toBe(1);
      expect(report.summary.criticalIssues).toBe(0);
      expect(report.recommendations).toEqual([]);
    });
 
    it('throws when the Claude Agent SDK reports a failed query', async () => {
      mockQuery.mockImplementation(
        () =>
          (async function* () {
            yield {
              type: 'result',
              subtype: 'error',
              errors: ['Mock SDK failure'],
            };
          })()
      );
 
      const orchestrator = new CodeReviewOrchestrator();
 
      await expect(
        orchestrator.reviewPullRequest(
          'test-owner',
          'test-repo',
          1
        )
      ).rejects.toThrow('Mock SDK failure');
    });
  });
});
