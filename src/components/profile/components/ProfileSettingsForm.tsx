import React from 'react';
import { Settings, Check, Save } from 'lucide-react';
import { RulesDatabase, DriverCategoryCode } from '@/core/types';

interface ProfileSettingsFormProps {
  rules: RulesDatabase | undefined;
  selectedCategories: DriverCategoryCode[];
  onToggleCategory: (cat: DriverCategoryCode) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  autoExplain: boolean;
  setAutoExplain: (autoExplain: boolean) => void;
  defaultTopics: string[];
  setDefaultTopics: React.Dispatch<React.SetStateAction<string[]>>;
  availableSections: { section: string; title: string; questionCount: number }[];
  onSaveSettings: () => void;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  rules,
  selectedCategories,
  onToggleCategory,
  displayName,
  setDisplayName,
  autoExplain,
  setAutoExplain,
  defaultTopics,
  setDefaultTopics,
  availableSections,
  onSaveSettings,
}) => {
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
      <h2 className="text-xl font-extrabold flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Налаштування профілю та навчання
      </h2>

      {/* Driver Categories Selector inside Profile Settings */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Категорії водійського посвідчення (підбір питань ПДР)
        </label>
        <div className="flex flex-wrap gap-2">
          {rules?.driver_categories.map((cat) => {
            const active = selectedCategories.includes(
              cat.code as DriverCategoryCode
            );
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => onToggleCategory(cat.code as DriverCategoryCode)}
                title={`${cat.name}: ${cat.description}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <span>{cat.code}</span>
                <span className="font-normal opacity-80 hidden sm:inline">
                  ({cat.name})
                </span>
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Відображуване ім'я
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm"
            />
          </div>

          <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={autoExplain}
              onChange={(e) => setAutoExplain(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-blue-600"
            />
            <div>
              <span className="text-sm font-semibold block">
                Показувати пояснення при неправильних відповідях автоматично
              </span>
              <span className="text-xs text-slate-500">
                Одразу розгортати цитату відповідного пункту ПДР після помилки
              </span>
            </div>
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Теми за замовчуванням для «Тесту за темами» ({defaultTopics.length})
          </label>
          <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
            {availableSections.map((sec) => {
              const checked = defaultTopics.includes(sec.section);
              return (
                <label
                  key={sec.section}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setDefaultTopics((prev) =>
                          checked
                            ? prev.filter((s) => s !== sec.section)
                            : [...prev, sec.section]
                        )
                      }
                      className="accent-blue-600"
                    />
                    <span className="truncate">
                      Розділ {sec.section}. {sec.title}
                    </span>
                  </span>
                  <span className="text-slate-400 shrink-0 ml-2">
                    {sec.questionCount}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onSaveSettings}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Зберегти налаштування</span>
        </button>
      </div>
    </section>
  );
};

export default ProfileSettingsForm;
