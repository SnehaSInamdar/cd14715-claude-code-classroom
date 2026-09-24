import { describe, it, expect } from 'vitest';
import { ReportGenerator } from '../src/utils/report-generator';
import { ReviewReport } from '../src/types/report-types';
 
describe('ReportGenerator', () => {
  const report: ReviewReport = {
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
          issues: [
            {
              line: 10,
              severity: 'medium',
              category: 'maintainability',
              description: 'Example maintainability issue',
              suggestion: 'Extract this logic into a helper function.',
            },
          ],
          overallScore: 85,
          summary: 'The code is generally maintainable.',
        },
 
        testCoverage: {
          file: 'src/example.ts',
          hasTests: true,
          testFiles: ['tests/example.test.ts'],
          untestedPaths: [
            {
              type: 'function',
              location: 'line 20',
              priority: 'medium',
              reasoning: 'This function does not have a dedicated test.',
              suggestedTest: 'Add a test for the normal input case.',
            },
          ],
          coverageEstimate: 80,
          summary: 'Most important paths are covered.',
        },
 
        refactorings: {
          file: 'src/example.ts',
          suggestions: [
            {
              type: 'extract-function',
              location: 'line 18-25',
              impact: 'medium',
              description: 'Extract the repeated logic into a helper.',
              before: 'function example() {}',
              after: 'function example() { helper(); }',
              benefits: 'Improves readability and maintainability.',
            },
          ],
          summary: 'A refactoring opportunity was identified.',
        },
      },
    ],
 
    summary: {
      totalFiles: 1,
      overallScore: 85,
      criticalIssues: 0,
      highPriorityTests: 0,
      refactoringOpportunities: 1,
    },
 
    recommendations: [
      {
        priority: 'medium',
        category: 'Maintainability',
        description: 'Extract repeated logic into a helper function.',
        files: ['src/example.ts'],
      },
    ],
 
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
 
  it('generates a Markdown report', () => {
    const generator = new ReportGenerator();
 
    const markdown = generator.generateMarkdownReport(report);
 
    expect(markdown).toContain('Code Review Report');
    expect(markdown).toContain('src/example.ts');
    expect(markdown).toContain('Maintainability');
    expect(markdown).toContain('85/100');
  });
 
  it('generates an HTML report', () => {
    const generator = new ReportGenerator();
 
    const html = generator.generateHTMLReport(report);
 
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Code Review Report');
    expect(html).toContain('Maintainability');
    expect(html).toContain('85');
  });
 
  it('generates valid formatted JSON', () => {
    const generator = new ReportGenerator();
 
    const json = generator.generateJSONReport(report);
 
    const parsed = JSON.parse(json);
 
    expect(parsed.pullRequest.owner).toBe('test-owner');
    expect(parsed.pullRequest.repo).toBe('test-repo');
    expect(parsed.pullRequest.number).toBe(1);
    expect(parsed.summary.overallScore).toBe(85);
    expect(parsed.fileReviews).toHaveLength(1);
  });
});