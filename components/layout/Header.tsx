"use client";

import { useSession } from "next-auth/react";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-60 z-30">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* 알림 버튼 (추후 연동) */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* 사용자 정보 */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 leading-tight">
              {session?.user?.name ?? "사용자"}
            </p>
            <p className="text-xs text-gray-400">
              {(session?.user as { role?: string })?.role === "ADMIN"
                ? "관리자"
                : "영업사원"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
