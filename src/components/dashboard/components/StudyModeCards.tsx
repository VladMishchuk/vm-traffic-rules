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
  Lock,
} from 'lucide-react';
import { DriverCategoryCode, RulesDatabase } from '@/core/types';
import { testModeRegistry } from '@/components/testing';
import { ModeInfoModalData } from './ModeInfoModal';
import { StudyModeCardItem } from './StudyModeCardItem';

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
      <StudyModeCardItem
        cardClassName="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/60 group"
        iconBoxClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        icon={<CheckCircle2 className="w-6 h-6" />}
        badge={
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            20 питань • 20 хв
          </span>
        }
        infoButtonClassName="hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
        onOpenInfo={() =>
          onOpenModeInfo(testModeRegistry.getStrategy('exam').metadata)
        }
        title={testModeRegistry.getStrategy('exam').metadata.title}
        actionButton={
          <button
            type="button"
            onClick={onStartOfficialExam}
            disabled={loadingQ}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <span>Розпочати іспит (Категорія {activeExamCat})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      >
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Категорія:
          </span>
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
      </StudyModeCardItem>

      {/* Mode 2: Test by Topics */}
      <StudyModeCardItem
        cardClassName="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/60"
        iconBoxClassName="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        icon={<ListChecks className="w-6 h-6" />}
        badge={
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {availableSectionsCount} розділів
          </span>
        }
        infoButtonClassName="hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
        onOpenInfo={() =>
          onOpenModeInfo(testModeRegistry.getStrategy('topic').metadata)
        }
        title={testModeRegistry.getStrategy('topic').metadata.title}
        actionButton={
          <button
            type="button"
            onClick={onOpenTopicPicker}
            disabled={loadingQ}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <span>Обрати теми ({availableSectionsCount})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Mode 3: AI Recommended */}
      <StudyModeCardItem
        cardClassName={`relative overflow-hidden ${
          isColdStart
            ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50'
            : 'border-violet-500/40 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-blue-600/10 dark:from-violet-950/40 dark:to-slate-900'
        }`}
        iconBoxClassName="bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm"
        icon={<Sparkles className="w-6 h-6" />}
        badge={
          isColdStart ? (
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
          )
        }
        infoButtonClassName="hover:border-violet-500 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"
        onOpenInfo={() =>
          onOpenModeInfo(testModeRegistry.getStrategy('ai_adaptive').metadata)
        }
        title={testModeRegistry.getStrategy('ai_adaptive').metadata.title}
        actionButton={
          <button
            type="button"
            onClick={onStartAiRecommended}
            title={
              isColdStart
                ? "Щоб система могла підібрати питання персонально для вас, пройдіть один 'Іспит' або 'Тест за темами'"
                : 'Запустити адаптивний тест'
            }
            className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              isColdStart
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md'
            }`}
          >
            {isColdStart && <Lock className="w-4 h-4" />}
            <span>
              {isColdStart
                ? 'Заблоковано (Холодний старт)'
                : 'Запустити адаптивний тест'}
            </span>
          </button>
        }
      />

      {/* Mode 4: Work on Mistakes */}
      <StudyModeCardItem
        cardClassName={
          isColdStart
            ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rose-500/50'
        }
        iconBoxClassName="bg-rose-500/10 text-rose-500"
        icon={<ShieldAlert className="w-6 h-6" />}
        badge={
          isColdStart ? (
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
          )
        }
        infoButtonClassName="hover:border-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
        onOpenInfo={() =>
          onOpenModeInfo(testModeRegistry.getStrategy('mistakes').metadata)
        }
        title={testModeRegistry.getStrategy('mistakes').metadata.title}
        actionButton={
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
              {isColdStart
                ? 'Заблоковано (Холодний старт)'
                : 'Відпрацювати помилки'}
            </span>
          </button>
        }
      />

      {/* Mode 5: AI Prompt */}
      <StudyModeCardItem
        cardClassName="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60"
        iconBoxClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        icon={<MessageSquarePlus className="w-6 h-6" />}
        badge={
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            AI Промпт
          </span>
        }
        infoButtonClassName="hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
        onOpenInfo={() =>
          onOpenModeInfo(testModeRegistry.getStrategy('prompt').metadata)
        }
        title={testModeRegistry.getStrategy('prompt').metadata.title}
        actionButton={
          <button
            type="button"
            onClick={onOpenPromptModal}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Ввести промпт</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Mode 6: Knowledge Base Shortcut */}
      <StudyModeCardItem
        cardClassName="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/60"
        iconBoxClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        icon={<BookOpen className="w-6 h-6" />}
        badge={
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            34 розділи ПДР
          </span>
        }
        infoButtonClassName="hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
        onOpenInfo={() =>
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
        title="База знань ПДР України"
        actionButton={
          <Link
            to="/knowledge"
            className="mt-6 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <span>Відкрити довідник ПДР</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />
    </div>
  );
};
