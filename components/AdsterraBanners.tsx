'use client';

import { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: 'iframe';
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
    __adsterraLoadQueue?: Promise<void>;
  }
}

type IframeBannerProps = {
  adKey: string;
  width: number;
  height: number;
  className?: string;
};

function IframeBanner({ adKey, width, height, className = '' }: IframeBannerProps) {
  const containerId = useMemo(
    () => `adsterra-${adKey}-${width}x${height}`,
    [adKey, width, height]
  );

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    container.innerHTML = '';

    const runSlot = () =>
      new Promise<void>((resolve) => {
        if (typeof window === 'undefined') {
          resolve();
          return;
        }

        window.atOptions = {
          key: adKey,
          format: 'iframe',
          height,
          width,
          params: {},
        };

        const script = document.createElement('script');
        script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => resolve();

        container.appendChild(script);
        window.setTimeout(() => resolve(), 3500);
      });

    window.__adsterraLoadQueue = (window.__adsterraLoadQueue ?? Promise.resolve())
      .then(runSlot)
      .catch(() => undefined);

    return () => {
      container.innerHTML = '';
    };
  }, [adKey, containerId, height, width]);

  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 text-center mb-1">
        Sponsored
      </div>
      <div
        id={containerId}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="overflow-hidden"
      />
    </div>
  );
}

function NativeBanner() {
  const containerId = 'container-7f36f2ddb9cc65c0d44306d248a80680';

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    container.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src =
      'https://pl29054897.profitablecpmratenetwork.com/7f36f2ddb9cc65c0d44306d248a80680/invoke.js';
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 text-center mb-2">
        Sponsored
      </div>
      <div id={containerId} className="min-h-20" />
    </div>
  );
}

function shouldHideAds(pathname: string) {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/dashboard')
  );
}

export function AdsterraTopSection() {
  const pathname = usePathname();

  if (shouldHideAds(pathname)) {
    return null;
  }

  return (
    <>
      <div className="hidden md:flex justify-center py-3 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <IframeBanner adKey="fe365377b904c1b425cbd3c91f6fa25b" width={728} height={90} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 flex justify-center bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700 py-1">
        <IframeBanner adKey="6540564426c68a480415cb969cae525c" width={320} height={50} />
      </div>

      <div className="h-[58px] md:hidden" aria-hidden="true" />
    </>
  );
}

export function AdsterraBottomSection() {
  const pathname = usePathname();

  if (shouldHideAds(pathname)) {
    return null;
  }

  return (
    <>
      <div className="w-full py-6 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="flex flex-col xl:flex-row items-center justify-center gap-6">
            <IframeBanner adKey="ef5c2371c4770a78a725cd14a6c3d837" width={300} height={250} />
            <div className="hidden xl:block">
              <IframeBanner adKey="d48c1445d762d4b1034c90bb2b371769" width={160} height={300} />
            </div>
          </div>
        </div>
      </div>

      <NativeBanner />
    </>
  );
}

export default function AdsterraBanners() {
  return (
    <>
      <AdsterraTopSection />
      <AdsterraBottomSection />
    </>
  );
}