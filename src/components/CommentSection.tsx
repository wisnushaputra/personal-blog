'use client';

import { useState, FormEvent } from 'react';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Reply, Send, Loader2 } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  replies: {
    id: string;
    name: string;
    content: string;
    createdAt: string;
  }[];
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export function CommentSection({ postId, comments: initialComments }: CommentSectionProps) {
  const [comments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, parentId?: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId: parentId || undefined,
          name: formData.get('name'),
          email: formData.get('email'),
          content: formData.get('content'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Gagal mengirim komentar');
      }

      setSuccessMessage('Komentar berhasil dikirim! Menunggu persetujuan admin.');
      form.reset();
      setReplyingTo(null);
    } catch (error: any) {
      alert(error.message || 'Gagal mengirim komentar. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="mb-8 flex items-center gap-2 text-xl font-semibold text-ink">
        <MessageSquare className="h-5 w-5" />
        Komentar ({comments.length})
      </h3>

      {/* Comment Form */}
      <div className="mb-10 rounded-xl border border-border bg-surface p-6">
        <h4 className="mb-4 font-semibold text-ink">Tulis Komentar</h4>

        {successMessage && (
          <div className="bg-accent/10 border-accent/20 mb-4 rounded-lg border px-4 py-3 text-sm text-accent">
            {successMessage}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="comment-name" className="mb-1 block text-sm font-medium text-ink">
                Nama
              </label>
              <input
                id="comment-name"
                name="name"
                type="text"
                required
                placeholder="Nama kamu"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="comment-email" className="mb-1 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="comment-email"
                name="email"
                type="email"
                required
                placeholder="email@example.com"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="comment-content" className="mb-1 block text-sm font-medium text-ink">
              Komentar
            </label>
            <textarea
              id="comment-content"
              name="content"
              rows={4}
              required
              placeholder="Tulis komentar kamu di sini..."
              className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </form>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="py-10 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted opacity-40" />
          <p className="text-sm text-muted">Belum ada komentar. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* Parent Comment */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{comment.name}</p>
                    <time className="text-xs text-muted">
                      {formatDate(new Date(comment.createdAt))}
                    </time>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {comment.content}
                </p>
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-accent"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Balas
                </button>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <form
                    onSubmit={(e) => handleSubmit(e, comment.id)}
                    className="mt-4 space-y-3 border-t border-border pt-4"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Nama kamu"
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="email@example.com"
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <textarea
                      name="content"
                      rows={3}
                      required
                      placeholder={`Balas komentar ${comment.name}...`}
                      className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        Kirim Balasan
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted transition-colors hover:text-ink"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-8 mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-surface/50 rounded-xl border border-border p-4"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className="bg-muted/30 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-ink">
                          {reply.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">{reply.name}</p>
                          <time className="text-xs text-muted">
                            {formatDate(new Date(reply.createdAt))}
                          </time>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
