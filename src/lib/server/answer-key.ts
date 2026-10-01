import 'server-only';
export const MCQ_KEY: Record<string, number> = {
  '1': 2, '2': 0, '3': 0, '4': 2, '5': 2, '6': 1, '7': 1, '8': 1,
  '9': 1, '10': 0, '11': 2, '12': 2, '13': 1, '14': 1, '15': 2,
};
export function mcqScore(answers: Record<string, number>) {
  return Math.round(Object.entries(MCQ_KEY).filter(([id, answer]) => answers[id] === answer).length / 15 * 100);
}
