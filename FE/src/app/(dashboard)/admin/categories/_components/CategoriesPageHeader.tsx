"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/base/SectionHeader";
import { KEY } from "@/utils/constant";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CategoryModalForm } from "./CategoryModalForm";

export function CategoriesPageHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full items-center justify-between">
      <SectionHeader
        title="Danh mục"
        subtitle="Quản lý danh mục sự kiện"
        createOnClick={() => setOpen(true)}
        createLabel="Tạo danh mục"
        refetchQueryKeys={[KEY.categories]}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <CategoryModalForm open={open} onOpenChange={setOpen} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
