import { describe, expect, it } from 'vitest';
import {
    CodeQualityResultSchema,
    TestCoverageResultSchema,
    RefactoringSuggestionSchema,
    ReviewReportJSONSchema,
    RefactoringSuggestionJSONSchema,
    TestCoverageResultJSONSchema,
    CodeQualityResultJSONSchema,
} from '../src/types/index.js';

describe('Schema validation',() => {
    it('should validate a valid code quality result',() => {
        const result = CodeQualityResultSchema.safeParse({
            file: 'src/example.ts',
            issues: [
                {
                    line: 10,
                    severity: 'medium',
                    category: 'maintainability',
                    description: 'Example maintainability issues',
                    suggestion: 'Extract this logic into a separate function.',
                },
            ],
            overallScore: 85,
            summary: 'The code is generally maintainable.',
        });
        
        expect(result.success).toBe(true);
    });

    it('should reject an invalid code quality result', () => {
        const result = CodeQualityResultSchema.safeParse({
            file: 'src/example.ts',
            issues: 'invalid',
            overallScore: 'invalid',
            summary: 'Invalid result',
         });

        expect(result.success).toBe(false);
    });

    it('should validate a valid test coverage result', () => {
        const result = TestCoverageResultSchema.safeParse({
            file: 'src/example.ts',
            hasTests: true,
            testFiles: ['tests/example.test.ts'],
            untestedPaths: [
                {
                    type: 'function',
                    location: 'line 20',
                    priority: 'medium',
                    reasoning: 'This function does not have a dedicated test.',
                    suggestedTest: 'Add a test covering the normal input case.',
                },
            ],
            coverageEstimate: 80,
            summary: 'Most important paths are covered.',
        });

        expect(result.success).toBe(true);
    });

    it('sholud validate a vlaid refactoring result', () => {
        const result = RefactoringSuggestionSchema.safeParse({
            file: 'src/example.ts',
            suggestions: [
                {
                type: 'extract-function',
                location: 'line 18-25',
                impact: 'medium',
                description: 'The function contains multiple responsibility.',
                before: 'function example() {}',
                after: 'function example() { helper(); }',
                benefits: 'Improves readability and maintainability.',
             },
          ],
          summary: 'One refactoring opportunity was identified.',
         });
         
          expect(result.success).toBe(true);
    });
});

    it('should export valid JSON schemas', () => {
        expect(CodeQualityResultJSONSchema).toBeDefined();

        expect(TestCoverageResultJSONSchema).toBeDefined();

        expect(RefactoringSuggestionJSONSchema).toBeDefined();

        expect(ReviewReportJSONSchema).toBeDefined();

        expect(CodeQualityResultJSONSchema).toHaveProperty('type');

        expect(TestCoverageResultJSONSchema).toHaveProperty('type');

        expect(RefactoringSuggestionJSONSchema).toHaveProperty('type');

        expect(ReviewReportJSONSchema).toHaveProperty('type');
});

    


    