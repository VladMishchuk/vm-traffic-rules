import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { RulesDatabase } from '@/core/types';
import { formatRuleIdLabel } from '@/lib/dataService';
import TargetDiscussionThread from '@/components/discussion/TargetDiscussionThread';

interface ExplanationCardProps {
  explanation: string;
  ruleIds?: string[];
  rules?: RulesDatabase | null;
  inspectedRuleId: string | null;
  onToggleInspectRule: (ruleId: string) => void;
  onCloseInspectRule: () => void;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({
  explanation,
  ruleIds = [],
  rules,
  inspectedRuleId,
  onToggleInspectRule,
  onCloseInspectRule,
}) => {
  const inspectedRuleDetails = useMemo(() => {
    if (!inspectedRuleId || !rules) return null;
    const cleanNum = inspectedRuleId
      .replace(/^(rule_|sign_|marking_)/, '')
      .replace(/_/g, '.');

    for (const sec of rules.sections) {
      for (const it of sec.items) {
        if (
          it.id === inspectedRuleId ||
          it.number === inspectedRuleId ||
          it.number === cleanNum
        ) {
          return {
            title: `Пункт ${it.number} ПДР (${sec.title})`,
            text: it.text,
            subItems: it.sub_items,
            image: null,
          };
        }
      }
    }

    const sign = rules.signs.find(
      (s) => s.id === inspectedRuleId || s.number === cleanNum
    );
    if (sign) {
      return {
        title: `Дорожній знак ${sign.number} «${sign.name}»`,
        text: sign.description,
        subItems: [],
        image: sign.image_path,
      };
    }

    const marking = rules.markings.find(
      (m) => m.id === inspectedRuleId || m.number === cleanNum
    );
    if (marking) {
      return {
        title: `Дорожня розмітка ${marking.number} «${marking.name}»`,
        text: marking.description,
        subItems: [],
        image: marking.image_path,
      };
    }

    const term = rules.glossary.find((g) => g.id === inspectedRuleId);
    if (term) {
      return {
        title: `Термін ПДР: «${term.term}» (п. 1.10)`,
        text: term.definition,
        subItems: [],
        image: null,
      };
    }

    return null;
  }, [inspectedRuleId, rules]);

  return (
    <div className="rounded-2xl p-5 bg-blue-500/10 border border-blue-500/25 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
          <BookOpen className="w-4 h-4" />
          <span>Офіційне обґрунтування ПДР України:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ruleIds.map((rId) => (
            <button
              key={rId}
              type="button"
              onClick={() => onToggleInspectRule(rId)}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition cursor-pointer"
            >
              {formatRuleIdLabel(rId, rules)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {explanation}
      </p>

      {/* Inline Rule / Sign Inspector */}
      {inspectedRuleDetails && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-500/30 space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
              {inspectedRuleDetails.title}
            </h4>
            <button
              type="button"
              onClick={onCloseInspectRule}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Закрити
            </button>
          </div>

          {inspectedRuleDetails.image && (
            <img
              src={inspectedRuleDetails.image}
              alt={inspectedRuleDetails.title}
              className="h-20 object-contain rounded-lg bg-white p-1 border"
            />
          )}

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {inspectedRuleDetails.text}
          </p>

          {inspectedRuleId && (
            <TargetDiscussionThread
              key={inspectedRuleId}
              targetId={inspectedRuleId}
              targetLabel={inspectedRuleDetails.title}
              compact
            />
          )}
        </div>
      )}
    </div>
  );
};
