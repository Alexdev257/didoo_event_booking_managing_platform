"use client";

import { PageHeaderWithRefetch } from "@/components/base/PageHeaderWithRefetch";
import { KEY } from "@/utils/constant";

export default function AdminResalePage() {
  return (
    <div className="space-y-2">
      <PageHeaderWithRefetch
        title="Quản lý vé bán lại"
        subtitle="Trang quản trị vé bán lại đang được cập nhật."
        queryKeys={[KEY.resales, KEY.resaleTransactions]}
      />
    </div>
  );
}
