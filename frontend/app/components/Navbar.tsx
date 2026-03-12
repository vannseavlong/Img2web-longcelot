import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";

export default function Navbar(): React.JSX.Element {
  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <Image src="/Me.webp" alt="logo" width={28} height={28} className="rounded-lg object-cover" />
          img<span className="text-blue-400">2</span>webp
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/suggest"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Suggest a feature
          </Link>
          <a
            href="https://github.com/vannseavlong/Img2web-longcelot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </nav>
  );
}
