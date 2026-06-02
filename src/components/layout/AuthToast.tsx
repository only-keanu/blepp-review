export function AuthToast({ message }: {message: string;}) {
  return (
    <div className="fixed right-4 top-4 z-[1000] w-[calc(100%-2rem)] max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-lg">
      <div className="text-sm font-medium">{message}</div>
    </div>
  );
}
