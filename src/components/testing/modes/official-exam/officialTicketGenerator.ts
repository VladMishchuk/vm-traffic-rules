import { OfficialQuestion, DriverCategoryCode } from '@/core/types';
import { sampleRandom } from '@/core/utils/shuffle';

/**
 * Офіційний генератор білетів ГСЦ МВС України на 20 питань для обраної категорії:
 * - 10 питань: Основні ПДР України (розділи 1..34)
 * - 4 питання: Будова ТЗ, терміни та правова відповідальність (розд. 36 + категорійні розділи)
 * - 4 питання: Основи безпеки руху (розд. 35, 38, 39 + категорійні розділи безпеки)
 * - 2 питання: Домедична допомога (розд. 37)
 */
export function generateOfficialExamTicket(
  questions: OfficialQuestion[],
  targetCategory: DriverCategoryCode
): OfficialQuestion[] {
  const catQuestions = questions.filter((q) =>
    q.categories.includes(targetCategory)
  );

  const pdrPool = catQuestions.filter(
    (q) => parseFloat(String(q.section)) <= 34
  );
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
