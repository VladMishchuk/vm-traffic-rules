import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ListChecks,
  Sparkles,
  ShieldAlert,
  MessageSquarePlus,
  BookOpen,
  ArrowRight,
  Info,
  Lock,
} from 'lucide-react';
import { DriverCategoryCode, RulesDatabase } from '@/core/types';
import { ModeInfoModalData } from './ModeInfoModal';

interface StudyModeCardsProps {
  userSelectedCategories: DriverCategoryCode[];
  activeExamCat: DriverCategoryCode;
  availableSectionsCount: number;
  isColdStart: boolean;
  mistakesCount: number;
  rules?: RulesDatabase | null;
  loadingQ: boolean;
  onSetExamTargetCat: (cat: DriverCategoryCode) => void;
  onStartOfficialExam: () => void;
  onOpenTopicPicker: () => void;
  onStartAiRecommended: () => void;
  onStartMistakesTest: () => void;
  onOpenPromptModal: () => void;
  onOpenModeInfo: (info: ModeInfoModalData) => void;
}

export const StudyModeCards: React.FC<StudyModeCardsProps> = ({
  userSelectedCategories,
  activeExamCat,
  availableSectionsCount,
  isColdStart,
  mistakesCount,
  rules,
  loadingQ,
  onSetExamTargetCat,
  onStartOfficialExam,
  onOpenTopicPicker,
  onStartAiRecommended,
  onStartMistakesTest,
  onOpenPromptModal,
  onOpenModeInfo,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* Mode 1: Official Exam */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between hover:border-blue-500/60 transition group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                20 питань • 20 хв
              </span>
              <button
                type="button"
                onClick={() =>
                  onOpenModeInfo({
                    title: 'Іспит як у СЦ МВС',
                    badge: '20 питань • 20 хвилин • до 2 помилок',
                    description:
                      'Повна симуляція реального теоретичного іспиту в Головному сервісному центрі МВС України. Білет формується за офіційною пропорцією: 10 питань з ПДР, 4 з безпеки руху, 4 з будови ТЗ та основ права, 2 з домедичної допомоги.',
                    details: [
                      'Жорсткий таймер 20 хвилин (червона індикація на останній хвилині).',
                      'Допускається максимум 2 помилки; на 3-й помилці іспит достроково припиняється.',
                      'Підказки та пояснення під час іспиту вимкнені — повний розбір доступний після завершення.',
                    ],
                  })
                }
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition cursor-pointer"
                title="Детальний опис режиму"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold pt-1">Іспит як у СЦ МВС</h3>

          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Категорія:</span>
            {userSelectedCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSetExamTargetCat(cat)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeExamCat === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onStartOfficialExam}
          disabled={loadingQ}
          className="mt-6 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          <span>Розпочати іспит (Категорія {activeExamCat})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mode 2: Test by Topics */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between hover:border-indigo-500/60 transition">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ListChecks className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {availableSectionsCount} розділів
              </span>
              <button
                type="button"
                onClick={() =>
                  onOpenModeInfo({
                    title: 'Тест за обраними темами',
                    badge: 'Цільове тренування розділів ПДР',
                    description:
                      'Дозволяє обрати один або декілька конкретних тематичних розділів ПДР України для поглибленого відпрацювання без обмеження за часом.',
                    details: [
                      'Миттєва перевірка відповіді з офіційним обґрунтуванням та посиланням на пункт ПДР.',
                      'Можливість скористатися підказкою або переглянути картку дорожнього знака прямо в тесті.',
                      'Результати кожної відповіді оновлюють ваш рівень засвоєння теми в Аналітиці.',
                    ],
                  })
                }
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition cursor-pointer"
                title="Детальний опис режиму"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="text-lg font-bold pt-1">Тест за обраними темами</h3>
        </div>
        <button
          type="button"
          onClick={onOpenTopicPicker}
          disabled={loadingQ}
          className="mt-6 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          <span>Обрати теми ({availableSectionsCount})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mode 3: AI Recommended */}
      <div
        className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition relative overflow-hidden ${
          isColdStart
            ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50'
            : 'border-violet-500/40 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-blue-600/10 dark:from-violet-950/40 dark:to-slate-900'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              {isColdStart ? (
                <span
                  title="Щоб система могла підібрати питання персонально для вас, пройдіть один 'Іспит' або 'Тест за темами' для збору початкової аналітики"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Потрібна аналітика
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300">
                  Адаптивне навчання
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  onOpenModeInfo({
                    title: 'Рекомендований ШІ',
                    badge: '70% слабкі теми + 30% інтервальне повторення',
                    description:
                      'Інтелектуальний адаптивний режим, що будує персональну сесію на основі останніх 5 спроб по кожному пункту ПДР та кривої забування Еббінгауза.',
                    details: [
                      '70% питань підбираються з ваших найслабших правил і прострочених інтервалів повторення.',
                      '30% питань — контрольна перевірка вже вивчених тем для закріплення у довготривалій пам’яті.',
                      'Включає інтерактивні динамічні 2D-сцени перехресть зі зміненими умовами пріоритету.',
                    ],
                  })
                }
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-500 hover:bg-violet-500/10 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center justify-center transition cursor-pointer"
                title="Детальний опис режиму"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold pt-1">Рекомендований ШІ</h3>
        </div>

        <button
          type="button"
          onClick={onStartAiRecommended}
          title={
            isColdStart
              ? "Щоб система могла підібрати питання персонально для вас, пройдіть один 'Іспит' або 'Тест за темами'"
              : 'Запустити адаптивний тест ШІ'
          }
          className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            isColdStart
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md'
          }`}
        >
          {isColdStart && <Lock className="w-4 h-4" />}
          <span>
            {isColdStart ? 'Заблоковано (Холодний старт)' : 'Запустити ШІ-тест'}
          </span>
        </button>
      </div>

      {/* Mode 4: Work on Mistakes */}
      <div
        className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between transition ${
          isColdStart
            ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-500/50'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              {isColdStart ? (
                <span
                  title="Пройдіть перший тест для збору статистики помилок"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Немає даних
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500">
                  Помилок: {mistakesCount}
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  onOpenModeInfo({
                    title: 'Робота над помилками',
                    badge: 'Банк складних питань',
                    description:
                      'Формує цільову вибірку з 20 питань, у яких ви раніше припустилися помилки або скористалися підказкою під час навчання.',
                    details: [
                      'Питання автоматично додаються до Банку помилок при неправильній відповіді.',
                      'Після успішної правильної відповіді без підказки питання вилучається з активного списку помилок.',
                    ],
                  })
                }
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 flex items-center justify-center transition cursor-pointer"
                title="Детальний опис режиму"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold pt-1">Робота над помилками</h3>
        </div>

        <button
          type="button"
          onClick={onStartMistakesTest}
          title={
            isColdStart
              ? "Щоб система могла підібрати питання персонально для вас, пройдіть один 'Іспит' або 'Тест за темами'"
              : 'Розібрати допущені помилки'
          }
          className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
            isColdStart
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          {isColdStart && <Lock className="w-4 h-4" />}
          <span>
            {isColdStart ? 'Заблоковано (Холодний старт)' : 'Відпрацювати помилки'}
          </span>
        </button>
      </div>

      {/* Mode 5: AI Prompt */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between hover:border-emerald-500/60 transition">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                AI Промпт
              </span>
              <button
                type="button"
                onClick={() =>
                  onOpenModeInfo({
                    title: 'Тест із текстового запиту',
                    badge: 'Генерація за вільним описом (Gemini AI + 2D)',
                    description:
                      'Вільно опишіть дорожню ситуацію, яку хочете потренувати (наприклад: «кругові перехрестя з трамваями» або «сигнали регулювальника вночі»), і ШІ сформує індивідуальний тест.',
                    details: [
                      'Генерує інтерактивні векторні 2D-сцени дорожніх ситуацій із траєкторіями та знаками.',
                      'Добирає найбільш релевантні офіційні питання ПДР України за змістом вашого запиту.',
                    ],
                  })
                }
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition cursor-pointer"
                title="Детальний опис режиму"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="text-lg font-bold pt-1">Тест із текстового запиту</h3>
        </div>
        <button
          type="button"
          onClick={onOpenPromptModal}
          className="mt-6 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>Ввести промпт</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mode 6: Knowledge Base Shortcut */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between hover:border-amber-500/60 transition">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                34 розділи ПДР
              </span>
              <button
                type="button"
                onClick={() =>
                  onOpenModeInfo({
                    title: 'База знань ПДР України',
                    badge: 'Офіційний ілюстрований довідник',
                    description: `Повна актуальна структура Правил дорожнього руху України: 34 розділи правил, ${
                      rules?.signs.length ?? 369
                    } дорожніх знаків, ${
                      rules?.markings.length ?? 66
                    } ліній розмітки, світлофори, розпізнавальні знаки та словник термінів.`,
                    details: [
                      'Автоматичне відстеження прочитаних розділів та відкриття нагороди «Теоретик».',
                      'Кнопка «Закріпити знання» в кінці кожного розділу для миттєвого тесту на 8 питань.',
                    ],
                  })
                }
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:bg-amber-500/10 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center transition cursor-pointer"
                title="Детальний опис режиму"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h3 className="text-lg font-bold pt-1">База знань ПДР України</h3>
        </div>
        <Link
          to="/knowledge"
          className="mt-6 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition"
        >
          <span>Відкрити довідник ПДР</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
