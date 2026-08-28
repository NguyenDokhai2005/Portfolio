'use client';

import { useCallback, useEffect, useState } from 'react';

import { seedComments } from '@/data/comments';
import type { Comment } from '@/types';

interface AddCommentInput {
  name: string;
  comment: string;
  image: File | null;
}

/**
 * Client-side stand-in for the original Supabase table + realtime channel.
 * Pinned comments stay on top; new comments are prepended. Likes are
 * de-duplicated per browser via localStorage, exactly like the original.
 */
export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setComments(
      [...seedComments].sort(
        (a, b) => Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)),
      ),
    );
  }, []);

  const addComment = useCallback(async ({ name, comment, image }: AddCommentInput) => {
    if (!name.trim() || !comment.trim()) return;

    setLoading(true);
    try {
      const imageUrl = image ? URL.createObjectURL(image) : null;
      const created: Comment = {
        id: `c-${Date.now()}`,
        name: name.trim(),
        comment: comment.trim(),
        image_url: imageUrl,
        likes: 0,
        created_at: new Date().toISOString(),
      };

      setComments((prev) => {
        const pinned = prev.filter((item) => item.is_pinned);
        const rest = prev.filter((item) => !item.is_pinned);
        return [...pinned, created, ...rest];
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const likeComment = useCallback((id: string, likes: number) => {
    if (localStorage.getItem(`liked-${id}`)) return;
    localStorage.setItem(`liked-${id}`, 'true');
    setComments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes: (likes || 0) + 1 } : item)),
    );
  }, []);

  return { comments, loading, addComment, likeComment };
}
