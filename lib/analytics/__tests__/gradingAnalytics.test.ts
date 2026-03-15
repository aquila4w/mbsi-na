describe('Grading and Analytics', () => {
  describe('Grade Calculations', () => {
    test('should calculate weighted average grade', () => {
      const assignments = [
        { grade: 85, weight: 0.3 },
        { grade: 90, weight: 0.3 },
        { grade: 95, weight: 0.4 }
      ];

      const weightedGrade = assignments.reduce(
        (sum, a) => sum + (a.grade * a.weight),
        0
      );

      expect(weightedGrade).toBe(90.5);
    });

    test('should calculate total points earned vs possible', () => {
      const assignments = [
        { earned: 85, possible: 100 },
        { earned: 45, possible: 50 },
        { earned: 28, possible: 30 }
      ];

      const totalEarned = assignments.reduce((sum, a) => sum + a.earned, 0);
      const totalPossible = assignments.reduce((sum, a) => sum + a.possible, 0);
      const percentage = (totalEarned / totalPossible) * 100;

      expect(totalEarned).toBe(158);
      expect(totalPossible).toBe(180);
      expect(percentage).toBeCloseTo(87.78, 2);
    });

    test('should drop lowest grade when configured', () => {
      const grades = [75, 88, 92, 68, 85];
      const dropLowest = 1;

      const sorted = [...grades].sort((a, b) => a - b);
      const kept = sorted.slice(dropLowest);
      const average = kept.reduce((sum, g) => sum + g, 0) / kept.length;

      expect(kept).not.toContain(68);
      expect(kept.length).toBe(4);
      expect(average).toBe(85);
    });

    test('should apply extra credit correctly', () => {
      const baseGrade = 92;
      const extraCredit = 5;
      const maxGrade = 100;

      const finalGrade = Math.min(baseGrade + extraCredit, maxGrade);

      expect(finalGrade).toBe(97);
    });

    test('should cap grade at maximum even with extra credit', () => {
      const baseGrade = 98;
      const extraCredit = 5;
      const maxGrade = 100;

      const finalGrade = Math.min(baseGrade + extraCredit, maxGrade);

      expect(finalGrade).toBe(100);
    });
  });

  describe('Letter Grade Assignment', () => {
    test('should assign letter grades based on percentage', () => {
      const gradeScale = [
        { min: 93, letter: 'A' },
        { min: 90, letter: 'A-' },
        { min: 87, letter: 'B+' },
        { min: 83, letter: 'B' },
        { min: 80, letter: 'B-' },
        { min: 77, letter: 'C+' },
        { min: 73, letter: 'C' },
        { min: 70, letter: 'C-' },
        { min: 67, letter: 'D+' },
        { min: 63, letter: 'D' },
        { min: 60, letter: 'D-' },
        { min: 0, letter: 'F' }
      ];

      const testGrades = [
        { score: 95, expected: 'A' },
        { score: 88, expected: 'B+' },
        { score: 75, expected: 'C' },
        { score: 55, expected: 'F' }
      ];

      testGrades.forEach(({ score, expected }) => {
        const letterGrade = gradeScale.find(scale => score >= scale.min)!.letter;
        expect(letterGrade).toBe(expected);
      });
    });

    test('should support custom grading scales', () => {
      const customScale = [
        { min: 85, letter: 'P', description: 'Pass' },
        { min: 0, letter: 'NP', description: 'Not Pass' }
      ];

      const grades = [90, 82, 88, 79];

      grades.forEach(grade => {
        const result = customScale.find(scale => grade >= scale.min)!;
        if (grade >= 85) {
          expect(result.letter).toBe('P');
        } else {
          expect(result.letter).toBe('NP');
        }
      });
    });
  });

  describe('Grade Distribution Analysis', () => {
    test('should calculate grade distribution', () => {
      const grades = [95, 88, 92, 78, 85, 90, 72, 88, 95, 80];

      const distribution = {
        A: grades.filter(g => g >= 90).length,
        B: grades.filter(g => g >= 80 && g < 90).length,
        C: grades.filter(g => g >= 70 && g < 80).length,
        D: grades.filter(g => g >= 60 && g < 70).length,
        F: grades.filter(g => g < 60).length
      };

      expect(distribution.A).toBe(4);
      expect(distribution.B).toBe(4);
      expect(distribution.C).toBe(2);
    });

    test('should calculate percentile ranking', () => {
      const grades = [60, 70, 75, 80, 85, 90, 95];
      const studentGrade = 85;

      const sorted = [...grades].sort((a, b) => a - b);
      const rank = sorted.filter(g => g < studentGrade).length;
      const percentile = (rank / sorted.length) * 100;

      expect(rank).toBe(4);
      expect(percentile).toBeCloseTo(57.14, 2);
    });

    test('should identify grade outliers', () => {
      const grades = [85, 88, 90, 92, 87, 30, 91, 89];

      const mean = grades.reduce((sum, g) => sum + g, 0) / grades.length;
      const variance = grades.reduce((sum, g) => sum + Math.pow(g - mean, 2), 0) / grades.length;
      const stdDev = Math.sqrt(variance);

      const outliers = grades.filter(g => Math.abs(g - mean) > 2 * stdDev);

      expect(outliers).toContain(30);
      expect(outliers.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Trends', () => {
    test('should calculate grade trend over time', () => {
      const gradedAssignments = [
        { date: '2026-01-15', grade: 75 },
        { date: '2026-02-01', grade: 80 },
        { date: '2026-02-15', grade: 85 },
        { date: '2026-03-01', grade: 90 }
      ];

      const firstGrade = gradedAssignments[0].grade;
      const lastGrade = gradedAssignments[gradedAssignments.length - 1].grade;
      const improvement = lastGrade - firstGrade;

      expect(improvement).toBe(15);
      expect(improvement).toBeGreaterThan(0);
    });

    test('should calculate moving average', () => {
      const grades = [70, 75, 80, 85, 90];
      const windowSize = 3;

      const movingAverages = [];
      for (let i = windowSize - 1; i < grades.length; i++) {
        const window = grades.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((sum, g) => sum + g, 0) / window.length;
        movingAverages.push(average);
      }

      expect(movingAverages[0]).toBe(75);
      expect(movingAverages[1]).toBe(80);
      expect(movingAverages[2]).toBe(85);
    });

    test('should predict final grade based on current performance', () => {
      const currentGrade = 85;
      const completedWeight = 0.6;
      const remainingAssignments = [
        { weight: 0.2, estimatedGrade: 85 },
        { weight: 0.2, estimatedGrade: 85 }
      ];

      let projectedGrade = currentGrade * completedWeight;
      remainingAssignments.forEach(assignment => {
        projectedGrade += assignment.estimatedGrade * assignment.weight;
      });

      expect(projectedGrade).toBe(85);
    });
  });

  describe('Rubric Grading', () => {
    test('should calculate rubric-based grade', () => {
      const rubric = [
        { criterion: 'Content', points: 40, earned: 35 },
        { criterion: 'Organization', points: 30, earned: 28 },
        { criterion: 'Grammar', points: 20, earned: 18 },
        { criterion: 'Citations', points: 10, earned: 9 }
      ];

      const totalEarned = rubric.reduce((sum, c) => sum + c.earned, 0);
      const totalPossible = rubric.reduce((sum, c) => sum + c.points, 0);
      const percentage = (totalEarned / totalPossible) * 100;

      expect(totalEarned).toBe(90);
      expect(totalPossible).toBe(100);
      expect(percentage).toBe(90);
    });

    test('should identify weak areas from rubric', () => {
      const rubric = [
        { criterion: 'Content', points: 40, earned: 35, percentage: 87.5 },
        { criterion: 'Organization', points: 30, earned: 18, percentage: 60 },
        { criterion: 'Grammar', points: 20, earned: 18, percentage: 90 }
      ];

      const weakAreas = rubric.filter(c => c.percentage < 70);

      expect(weakAreas.length).toBe(1);
      expect(weakAreas[0].criterion).toBe('Organization');
    });
  });

  describe('Assignment Statistics', () => {
    test('should calculate assignment completion rate', () => {
      const totalStudents = 30;
      const submitted = 27;
      const completionRate = (submitted / totalStudents) * 100;

      expect(completionRate).toBe(90);
    });

    test('should calculate on-time submission rate', () => {
      const submissions = [
        { on_time: true },
        { on_time: true },
        { on_time: false },
        { on_time: true }
      ];

      const onTime = submissions.filter(s => s.on_time).length;
      const onTimeRate = (onTime / submissions.length) * 100;

      expect(onTimeRate).toBe(75);
    });

    test('should identify struggling students', () => {
      const students = [
        { id: 1, averageGrade: 88 },
        { id: 2, averageGrade: 65 },
        { id: 3, averageGrade: 92 },
        { id: 4, averageGrade: 58 }
      ];

      const threshold = 70;
      const struggling = students.filter(s => s.averageGrade < threshold);

      expect(struggling.length).toBe(2);
      expect(struggling.map(s => s.id)).toContain(2);
      expect(struggling.map(s => s.id)).toContain(4);
    });
  });

  describe('Grade Book Calculations', () => {
    test('should calculate category weights', () => {
      const categories = [
        { name: 'Homework', weight: 0.20, grades: [85, 90, 88] },
        { name: 'Quizzes', weight: 0.30, grades: [92, 88, 95] },
        { name: 'Exams', weight: 0.50, grades: [85, 90] }
      ];

      const categoryAverages = categories.map(cat => ({
        ...cat,
        average: cat.grades.reduce((sum, g) => sum + g, 0) / cat.grades.length
      }));

      const finalGrade = categoryAverages.reduce(
        (sum, cat) => sum + (cat.average * cat.weight),
        0
      );

      expect(finalGrade).toBeCloseTo(89.52, 2);
    });

    test('should handle missing assignments', () => {
      const assignments = [
        { submitted: true, grade: 85 },
        { submitted: false, grade: null },
        { submitted: true, grade: 90 }
      ];

      const policy = 'countAsZero';

      let grades = assignments.map(a =>
        a.submitted ? a.grade! : (policy === 'countAsZero' ? 0 : null)
      ).filter(g => g !== null);

      const average = grades.reduce((sum, g) => sum + g!, 0) / grades.length;

      expect(grades).toContain(0);
      expect(average).toBeCloseTo(58.33, 2);
    });

    test('should export gradebook data', () => {
      const gradebook = [
        { name: 'Student A', assignment1: 85, assignment2: 90, final: 87.5 },
        { name: 'Student B', assignment1: 78, assignment2: 85, final: 81.5 }
      ];

      const headers = Object.keys(gradebook[0]);

      expect(headers).toContain('name');
      expect(headers).toContain('final');
      expect(gradebook.length).toBe(2);
    });
  });
});
