"use client";
export default function AdminError({ reset }: { reset: () => void }) {
  return <div className="admin-card p-8"><span className="admin-eyebrow">CONNECTION INTERRUPTED</span><h1 className="mt-3">The workspace couldn’t load.</h1><p className="admin-note">Your saved content is still in place. Try reconnecting.</p><button className="admin-primary" onClick={reset}>Try again</button></div>;
}
