import 'server-only';
export const MCQ_KEY: Record<string, number> = {
  '1': 2, '2': 0, '3': 0, '4': 2, '5': 2, '6': 1, '7': 1, '8': 1,
  '9': 1, '10': 0, '11': 2, '12': 2, '13': 1, '14': 1, '15': 2,
  '16': 0, '17': 1, '18': 1, '19': 1, '20': 3,
};
export function mcqScore(answers: Record<string, number>, total = Object.keys(MCQ_KEY).length) {
  return Math.round(Object.entries(MCQ_KEY).filter(([id, answer]) => Number(id) <= total && answers[id] === answer).length / total * 100);
}
