import { OfficialQuestion, DriverCategoryCode } from '@/core/types';
import { sampleRandom } from '@/core/utils/shuffle';

/**
 * Official ГСЦ МВС Ukraine 20-question exam ticket generator for a chosen category:
 * - 10 questions: Core ПДР України (sections 1..34)
 * - 4 questions: Vehicle construction, terms & legal liability for the category (sec 36 + category sections)
 * - 4 questions: Traffic safety (sec 35, 38, 39 + category safety section)
 * - 2 questions: First aid (sec 37)
 */
export function generateOfficialExamTicket(
  questions: OfficialQuestion[],
  targetCategory: DriverCategoryCode
): OfficialQuestion[] {
  const catQuestions = questions.filter((q) =>
    q.categories.includes(targetCategory)
  );

  const pdrPool = catQuestions.filter((q) => parseFloat(String(q.section)) <= 34);
  const medicalPool = catQuestions.filter((q) => String(q.section) === '37');
  const safetySections = new Set([
    '35',
    '38',
    '39',
    '43',
    '47',
    '51',
    '55',
    '59',
    '63',
  ]);
  const safetyPool = catQuestions.filter((q) =>
    safetySections.has(String(q.section))
  );
  const vehicleLawSections = new Set([
    '36',
    '40',
    '41',
    '42',
    '44',
    '45',
    '46',
    '48',
    '49',
    '50',
    '52',
    '53',
    '54',
    '56',
    '57',
    '58',
    '60',
    '61',
    '62',
  ]);
  const vehicleLawPool = catQuestions.filter((q) =>
    vehicleLawSections.has(String(q.section))
  );

  const ticket = [
    ...sampleRandom(pdrPool, 10),
    ...sampleRandom(vehicleLawPool, 4),
    ...sampleRandom(safetyPool, 4),
    ...sampleRandom(medicalPool, 2),
  ];

  if (ticket.length < 20 && catQuestions.length > ticket.length) {
    const existingIds = new Set(ticket.map((q) => q.id));
    const remaining = catQuestions.filter((q) => !existingIds.has(q.id));
    ticket.push(...sampleRandom(remaining, 20 - ticket.length));
  }

  return ticket;
}
