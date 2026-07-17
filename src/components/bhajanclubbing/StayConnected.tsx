"use client";

/**
 * StayConnected — community capture at the end of the page: Instagram
 * follow, YouTube subscribe, and an optional WhatsApp community row
 * (hidden while CONNECT.whatsapp is empty). Deliberately no email form:
 * real email capture happens through the ticket form's opt-in, and the
 * copy says so instead of shipping a form that goes nowhere.
 */

import { motion } from "framer-motion";
import { CONNECT, SOCIALS } from "@/data/bhajanClubbing";

const CHANNELS = [
  {
    key: "instagram",
    href: SOCIALS.instagram,
    label: "Instagram",
    sub: "@gitalifenyc",
    color: "#F0A0C4",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "youtube",
    href: SOCIALS.youtube,
    label: "YouTube",
    sub: "Gita Life NYC",
    color: "#F2B95C",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23 7.6a3 3 0 0 0-2.1-2.2C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.6 32.6 32.6 0 0 0 .5 12 32.6 32.6 0 0 0 1 16.4a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A32.6 32.6 0 0 0 23.5 12 32.6 32.6 0 0 0 23 7.6ZM9.7 15.1V8.9l6 3.1-6 3.1Z" />
      </svg>
    ),
  },
  ...(CONNECT.whatsapp
    ? [
        {
          key: "whatsapp",
          href: CONNECT.whatsapp,
          label: "WhatsApp",
          sub: "Community group",
          color: "#25D366",
          icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.6l.4-.4.3-.5a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.1 5 5 0 0 0 1 2.7 11.4 11.4 0 0 0 4.4 3.9 14.6 14.6 0 0 0 1.5.5 3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3Z" />
            </svg>
          ),
        },
      ]
    : []),
];

export default function StayConnected() {
  return (
    <section id="connect" className="relative mx-auto max-w-3xl scroll-mt-20 px-6 py-16 text-center sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="bc3-eyebrow">{CONNECT.eyebrow}</p>
        <h2 className="bc3-display mt-4 text-[28px] leading-[1.1] text-white sm:text-[36px]">
          Don&rsquo;t let the night <span className="bc3-headline-warm">end here</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[14.5px] leading-relaxed" style={{ color: "var(--bc3-ink-dim)" }}>
          {CONNECT.blurb}
        </p>
      </motion.div>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        {CHANNELS.map((channel, i) => (
          <motion.a
            key={channel.key}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className="bc3-panel bc3-panel-hover flex w-[150px] flex-col items-center gap-2.5 !rounded-2xl px-4 py-6"
            aria-label={`${channel.label} — ${channel.sub}`}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${channel.color}1a`, border: `1px solid ${channel.color}45`, color: channel.color }}
            >
              {channel.icon}
            </span>
            <span className="text-[13px] font-bold text-white">{channel.label}</span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--bc3-ink-faint)" }}>
              {channel.sub}
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
