'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Pin, Upload } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';

import { useComments } from '@/hooks/useComments';
import { EASE, riseItemSm, riseStagger } from '@/lib/motion';

export default function Comments() {
  const { comments, loading, addComment, likeComment } = useComments();
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if (!name.trim() || !comment.trim()) return;
    await addComment({ name, comment, image });
    setName('');
    setComment('');
    setImage(null);
    setPreview(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] md:rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-8 h-full"
    >
      <div className="mb-5 md:mb-6">
        <h3 className="text-xl md:text-2xl font-semibold mb-1">Comments</h3>
        <p className="text-xs md:text-sm text-white/40">Leave your thoughts here</p>
      </div>

      <motion.div
        variants={riseStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="space-y-3 md:space-y-4 mb-5 md:mb-6"
      >
        <motion.input
          variants={riseItemSm}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="Your Name"
          placeholder="Your Name"
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none focus:border-white"
        />

        <motion.textarea
          variants={riseItemSm}
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          aria-label="Your Comment"
          placeholder="Your Comment"
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none resize-none focus:border-white"
        />

        <motion.label
          variants={riseItemSm}
          className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 md:p-4 flex items-center gap-3 cursor-pointer"
        >
          <Upload size={16} />
          <span className="text-xs md:text-sm text-white/65">Upload Image</span>
          <input hidden type="file" accept="image/*" onChange={handleFileChange} />
        </motion.label>

        <AnimatePresence>
          {preview && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={preview}
              alt="Preview"
              className="rounded-2xl h-36 md:h-44 w-full object-cover border border-white/10"
            />
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          variants={riseItemSm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePost}
          disabled={loading}
          className="w-full rounded-2xl py-3 md:py-4 bg-white/10 border border-white/10 transition-all disabled:opacity-60"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </motion.button>
      </motion.div>

      <motion.div
        variants={riseStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="rounded-[24px] md:rounded-[28px] border border-white/10 bg-black/20 p-3 h-[320px] md:h-[420px] overflow-y-auto custom-scroll"
      >
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {comments.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{
                  duration: 0.55,
                  ease: EASE,
                  layout: { duration: 0.45, ease: EASE },
                }}
                className={`rounded-[20px] md:rounded-[24px] border p-3 md:p-4 ${
                  item.is_pinned
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
                    {item.name?.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.is_pinned && (
                        <div className="flex items-center gap-1 px-2 py-[3px] rounded-full bg-purple-500/15 border border-purple-500/20 text-[10px] text-purple-300">
                          <Pin size={10} />
                          PINNED
                        </div>
                      )}
                    </div>
                    <p className="text-[12px] md:text-[13px] text-white/55">
                      {item.comment}
                    </p>
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt="Comment attachment"
                        className="mt-3 rounded-xl w-full max-h-48 md:max-h-56 object-cover border border-white/10"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    aria-label={`Like comment from ${item.name}`}
                    onClick={() => likeComment(item.id, item.likes)}
                    className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white transition-colors"
                  >
                    <Heart size={13} />
                    {item.likes || 0}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
