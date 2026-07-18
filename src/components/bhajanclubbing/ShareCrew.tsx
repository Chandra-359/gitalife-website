"use client";

/**
 * ShareCrew — social share row, modelled as a grid of rounded quick-action
 * tiles (WhatsApp / X / Facebook / copy link / native share sheet).
 */

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { C } from "@/components/home/icons";
import { EVENT, SHARE } from "@/data/bhajanClubbing";

const text = `${SHARE.message} ${EVENT.url}`;

function openPopup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=560");
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied — go paste it in the group chat");
  } catch {
    toast.error("Couldn't copy — long-press the URL instead");
  }
}

async function nativeShare() {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: `${EVENT.title} — ${EVENT.volume}`, text: SHARE.message, url: EVENT.url });
    } catch {
      /* user dismissed the sheet — nothing to do */
    }
  } else {
    copyLink();
  }
}

const TILES: { key: string; label: string; sub: string; color: string; icon: React.ReactNode; onClick: () => void }[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    sub: "The group chat",
    color: "#25D366",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.6l.4-.4.3-.5a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1 5 5 0 0 0 1 2.7 11.4 11.4 0 0 0 4.4 3.9 14.6 14.6 0 0 0 1.5.5 3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z" />
      </svg>
    ),
    onClick: () => openPopup(`https://wa.me/?text=${encodeURIComponent(text)}`),
  },
  {
    key: "x",
    label: "Post on X",
    sub: "Tell the timeline",
    color: "#FBF5E6",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.1 3.7H5.2L17.8 20Z" />
      </svg>
    ),
    onClick: () =>
      openPopup(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE.message)}&url=${encodeURIComponent(EVENT.url)}&hashtags=${SHARE.hashtags}`,
      ),
  },
  {
    key: "facebook",
    label: "Facebook",
    sub: "Share the event",
    color: "#3b82f6",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4V14h2.7v8Z" />
      </svg>
    ),
    onClick: () => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(EVENT.url)}`),
  },
  {
    key: "copy",
    label: "Copy link",
    sub: "Paste anywhere",
    color: C.goldLight,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="9" y="9" width="12" height="12" rx="2.5" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    ),
    onClick: copyLink,
  },
  {
    key: "more",
    label: "More",
    sub: "Share sheet",
    color: C.lotusPink,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3v12" />
        <path d="M8 7l4-4 4 4" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      </svg>
    ),
    onClick: nativeShare,
  },
];

export default function ShareCrew() {
  return (
    <section id="crew" className="relative mx-auto max-w-4xl scroll-mt-20 px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--bc2-blue)" }}>
          Spread the Word
        </p>
        <h2 className="bc2-display mt-4 text-[28px] text-club-ink sm:text-[36px]">
          Bring your <span className="bc2-headline-grad">crew</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed" style={{ color: "var(--bc2-ink-dim)" }}>
          A kirtan night hits different with your people. One tap, straight to the group chat.
        </p>
      </motion.div>

      <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-5 sm:gap-4">
        {TILES.map((tile, i) => (
          <motion.button
            key={tile.key}
            type="button"
            onClick={tile.onClick}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className={`bc2-glass flex flex-col items-center gap-2.5 !rounded-2xl px-4 py-6 ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
            style={{ cursor: "pointer" }}
            aria-label={`Share via ${tile.label}`}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${tile.color}1c`, border: `1px solid ${tile.color}45`, color: tile.color }}
            >
              {tile.icon}
            </span>
            <span className="text-[13px] font-bold text-club-ink">{tile.label}</span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(251,245,230,0.45)" }}>
              {tile.sub}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
