export type CommentTargetType = 'question' | 'knowledge_item';

export interface QuestionComment {
  id: string;
  targetId: string;
  targetType?: CommentTargetType;
  authorUid: string;
  authorName: string;
  authorBadges: string[];
  text: string;
  likes: number;
  dislikes: number;
  userVote?: 1 | -1 | 0;
  isReported?: boolean;
  createdAt: string;
}

export interface ContentReport {
  id: string;
  reportType: 'question_error' | 'comment_spam';
  targetId: string;
  reasonCategory: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}
