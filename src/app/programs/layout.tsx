/**
 * Programs layout — viewport-locked wrapper
 *
 * The programs page uses a full-viewport split-view (map + list)
 * that must not scroll. This layout enforces that constraint.
 */
export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden">{children}</div>
  );
}
