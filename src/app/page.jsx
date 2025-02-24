import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 sm:p-20">
      <div className="flex flex-col sm:flex-row gap-6">
        <a
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-12 px-6 sm:min-w-44"
          href="/student/dashboard"
        >
          Student Portal
        </a>
        
        <a
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-12 px-6 sm:min-w-44"
          href="/admin/dashboard"
        >
          Admin Portal
        </a>
      </div>
    </div>
  );
}
