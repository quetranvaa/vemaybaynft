import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Toaster } from "react-hot-toast";

export const Layout = ({
  children,
  formatRpc,
}: {
  children: React.ReactNode;
  formatRpc: string;
}) => (
  <div className="flex flex-col h-screen">
    <div className="flex items-center border-b-2 border-gray-100 py-2 px-10 sm:justify-between sm:space-x-10">
      <div className="flex flex-row items-baseline">
        <Link href="/" passHref>
          <a>
            <div className="font-mono text-2xl font-light text-pink-500 text-left"></div>
          </a>
        </Link>
        <div className="font-mono text-xs text-gray-600 px-3"></div>
      </div>
      <div className="flex flex-row items-center">
        <div className="font-mono text-base text-gray-600 px-3">
          {formatRpc}
        </div>
        <WalletMultiButton />
      </div>
    </div>
    <div className="w-fullscreen flex-grow">{children}</div>
    <Toaster />
  </div>
);
