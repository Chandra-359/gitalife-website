/**
 * Programs layout — viewport-locked wrapper
 *
 * The programs page uses a full-viewport split-view (map + list)
 * that must not scroll. This layout enforces that constraint.
 * Includes the shared Navbar for consistent navigation.
 */
import Navbar from "@/components/Navbar";

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Navbar />
      {children}
    </div>
  );
}
