"use client";

import { useState } from "react";
import { CategoriesTable } from "./CategoriesTable";
import { CategoryModalForm } from "./CategoryModalForm";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useCategory } from "@/hooks/useEvent";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Category } from "@/types/event";

export function CategoriesSection({
  params,
}: {
  params: Record<string, string | string[] | undefined>;
}) {
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { deleteCategory: deleteMutation } = useCategory();

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    await deleteMutation.mutateAsync(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  return (
    <>
      <CategoriesTable
        params={params}
        onEdit={(c) => setEditCategory(c)}
        onDelete={(c) => setCategoryToDelete(c)}
      />

      <Dialog open={!!editCategory} onOpenChange={(o) => !o && setEditCategory(null)}>
        <DialogContent className="max-w-md">
          {editCategory && (
            <CategoryModalForm
              open={!!editCategory}
              onOpenChange={(o) => !o && setEditCategory(null)}
              mode="update"
              categoryId={editCategory.id}
              defaultValues={{
                Name: editCategory.name,
                Slug: editCategory.slug,
                Description: editCategory.description ?? "",
                IconUrl: editCategory.iconUrl ?? "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!categoryToDelete}
        onOpenChange={(o) => !o && setCategoryToDelete(null)}
        title="Xóa danh mục"
        description={`Bạn có chắc muốn xóa danh mục "${categoryToDelete?.name}"?`}
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  );
}
