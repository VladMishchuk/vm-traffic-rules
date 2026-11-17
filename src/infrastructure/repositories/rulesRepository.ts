import { RulesDatabase } from '@/core/types';
import { loadRules, formatRuleIdLabel } from '@/lib/dataService';

export const rulesRepository = {
  getAllRules(): Promise<RulesDatabase> {
    return loadRules();
  },

  formatRuleLabel(ruleId: string, rules?: RulesDatabase | null): string {
    return formatRuleIdLabel(ruleId, rules);
  },
};
