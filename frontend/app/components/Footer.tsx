import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <Image src="/Me.webp" alt="logo" width={36} height={36} className="rounded-lg object-cover mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold tracking-tight text-white">
              img<span className="text-blue-400">2</span>webp
            </span>
            <p className="text-zinc-500 text-sm">
              Privacy-first image converter. Nothing you upload is stored on the server.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <a
            href="https://github.com/vannseavlong/Img2web-longcelot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
          <a
            href="https://dev.to/longcelot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45.56-.02c.41 0 .63-.07.83-.26.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.18zM0 4.94v14.12h24V4.94H0zM8.56 15.3c-.44.58-1.06.77-2.53.77H4.71V8.53h1.4c1.67 0 2.16.18 2.6.9.27.43.29.6.32 2.57.05 2.23-.02 2.73-.47 3.3zm5.09-5.47h-2.47v1.77h1.52v1.28l-.72.04-.75.03v1.77l1.22.03 1.2.04v1.28h-1.6c-1.53 0-1.6-.01-1.87-.3l-.3-.28v-3.16c0-3.02.01-3.18.25-3.48.23-.31.25-.31 1.88-.31h1.64v1.28zm4.68 5.45c-.17.43-.64.79-1 .79-.18 0-.45-.15-.67-.39-.32-.32-.45-.63-.82-2.08l-.9-3.39-.45-1.67h.76c.4 0 .75.02.75.05 0 .06 1.16 4.54 1.26 4.83.04.15.32-.7.73-2.3l.66-2.52.74-.04c.4-.02.73 0 .73.04 0 .14-1.67 6.38-1.8 6.68z" />
            </svg>
            DEV
          </a>
          <Link href="/suggest" className="text-zinc-400 hover:text-white transition-colors">
            Suggest a feature
          </Link>
          <a
            href="https://github.com/vannseavlong/Img2web-longcelot/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            MIT License
          </a>
        </div>

        <div className="pt-6 border-t border-zinc-800 text-zinc-600 text-xs">
          © 2026 img2webp · Open source
        </div>
      </div>
    </footer>
  );
}
