describe('Quiz Analytics', () => {
  describe('Score Calculations', () => {
    test('should calculate average score correctly', () => {
      const scores = [80, 90, 70, 100, 85];
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      expect(average).toBe(85);
    });

    test('should calculate median score correctly', () => {
      const scores = [60, 70, 80, 90, 100];
      const sorted = [...scores].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      expect(median).toBe(80);
    });

    test('should find highest and lowest scores', () => {
      const scores = [75, 92, 68, 88, 95];
      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);

      expect(highest).toBe(95);
      expect(lowest).toBe(68);
    });

    test('should calculate pass rate', () => {
      const attempts = [
        { score: 80, passing: 70 },
        { score: 65, passing: 70 },
        { score: 90, passing: 70 },
        { score: 75, passing: 70 }
      ];

      const passed = attempts.filter(a => a.score >= a.passing).length;
      const passRate = (passed / attempts.length) * 100;

      expect(passRate).toBe(75);
    });
  });

  describe('Question Analytics', () => {
    test('should calculate difficulty index', () => {
      const totalAnswers = 100;
      const correctAnswers = 75;
      const difficultyIndex = (correctAnswers / totalAnswers) * 100;

      expect(difficultyIndex).toBe(75);
    });

    test('should categorize question difficulty', () => {
      const testCases = [
        { difficultyIndex: 85, expected: 'easy' },
        { difficultyIndex: 60, expected: 'medium' },
        { difficultyIndex: 35, expected: 'hard' }
      ];

      testCases.forEach(({ difficultyIndex }) => {
        let category = 'medium';
        if (difficultyIndex >= 80) category = 'easy';
        else if (difficultyIndex < 50) category = 'hard';

        if (difficultyIndex >= 80) {
          expect(category).toBe('easy');
        } else if (difficultyIndex < 50) {
          expect(category).toBe('hard');
        } else {
          expect(category).toBe('medium');
        }
      });
    });

    test('should calculate discrimination index', () => {
      const topGroupCorrect = 18;
      const topGroupTotal = 20;
      const bottomGroupCorrect = 8;
      const bottomGroupTotal = 20;

      const topProportion = topGroupCorrect / topGroupTotal;
      const bottomProportion = bottomGroupCorrect / bottomGroupTotal;
      const discriminationIndex = topProportion - bottomProportion;

      expect(discriminationIndex).toBeCloseTo(0.5, 2);
    });

    test('should interpret discrimination index quality', () => {
      const testCases = [
        { index: 0.45, quality: 'excellent' },
        { index: 0.25, quality: 'good' },
        { index: 0.15, quality: 'acceptable' },
        { index: 0.05, quality: 'poor' }
      ];

      testCases.forEach(({ index }) => {
        let quality = 'poor';
        if (index >= 0.40) quality = 'excellent';
        else if (index >= 0.30) quality = 'good';
        else if (index >= 0.20) quality = 'acceptable';

        if (index >= 0.40) {
          expect(quality).toBe('excellent');
        } else if (index >= 0.30) {
          expect(quality).toBe('good');
        } else if (index >= 0.20) {
          expect(quality).toBe('acceptable');
        } else {
          expect(quality).toBe('poor');
        }
      });
    });
  });

  describe('Time Analytics', () => {
    test('should calculate average time spent', () => {
      const timeSpents = [1200, 1500, 900, 1800, 1400];
      const averageTime = timeSpents.reduce((sum, time) => sum + time, 0) / timeSpents.length;

      expect(averageTime).toBe(1360);
    });

    test('should format time in human readable format', () => {
      const seconds = 3665;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      expect(hours).toBe(1);
      expect(minutes).toBe(1);
      expect(secs).toBe(5);
    });

    test('should detect rapid answering anomaly', () => {
      const averageTimePerQuestion = 60;
      const actualTime = 15;
      const threshold = 0.25;

      const isRapid = actualTime < (averageTimePerQuestion * threshold);

      expect(isRapid).toBe(true);
    });
  });

  describe('Student Performance Analytics', () => {
    test('should calculate completion rate', () => {
      const startedAttempts = 10;
      const completedAttempts = 8;
      const completionRate = (completedAttempts / startedAttempts) * 100;

      expect(completionRate).toBe(80);
    });

    test('should track improvement over attempts', () => {
      const attemptScores = [60, 70, 85];
      const firstScore = attemptScores[0];
      const lastScore = attemptScores[attemptScores.length - 1];
      const improvement = lastScore - firstScore;

      expect(improvement).toBe(25);
      expect(improvement).toBeGreaterThan(0);
    });

    test('should calculate average improvement rate', () => {
      const attempts = [
        { attempt: 1, score: 60 },
        { attempt: 2, score: 70 },
        { attempt: 3, score: 80 }
      ];

      const improvements = [];
      for (let i = 1; i < attempts.length; i++) {
        improvements.push(attempts[i].score - attempts[i - 1].score);
      }

      const averageImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;

      expect(averageImprovement).toBe(10);
    });
  });

  describe('Question Bank Analytics', () => {
    test('should calculate question reuse frequency', () => {
      const questionUsage = {
        timesUsed: 15,
        totalQuizzes: 50
      };

      const reuseRate = (questionUsage.timesUsed / questionUsage.totalQuizzes) * 100;

      expect(reuseRate).toBe(30);
    });

    test('should identify most effective questions', () => {
      const questions = [
        { id: 1, discriminationIndex: 0.45, difficultyIndex: 65 },
        { id: 2, discriminationIndex: 0.25, difficultyIndex: 70 },
        { id: 3, discriminationIndex: 0.50, difficultyIndex: 60 }
      ];

      const effectiveQuestions = questions.filter(q =>
        q.discriminationIndex >= 0.40 &&
        q.difficultyIndex >= 50 &&
        q.difficultyIndex <= 80
      );

      expect(effectiveQuestions.length).toBe(2);
      expect(effectiveQuestions).toContainEqual(questions[0]);
      expect(effectiveQuestions).toContainEqual(questions[2]);
    });
  });
});
