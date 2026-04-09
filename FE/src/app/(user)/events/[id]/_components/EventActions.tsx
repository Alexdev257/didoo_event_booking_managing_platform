"use client";

import { Bookmark, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useGetMe } from "@/hooks/useAuth";
import { useFavorite, useGetFavorites, useGetInteractions, useInteraction } from "@/hooks/useEvent";
import { InteractionType } from "@/utils/enum";

interface EventActionsProps {
  eventId: string;
}

const baseButtonClass =
  "inline-flex h-12 md:h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card/80 backdrop-blur-md px-5 text-sm font-bold uppercase tracking-widest text-foreground shadow-sm transition-all hover:border-border hover:bg-card hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"

export default function EventActions({ eventId }: EventActionsProps) {
  const { data: userData } = useGetMe();
  const userId = userData?.data?.id;

  const { data: favoritesRes } = useGetFavorites({
    userId: userId || undefined,
    eventId,
    pageSize: 1,
  });

  const { data: interactionsRes } = useGetInteractions({
    userId: userId || undefined,
    eventId,
    pageSize: 20,
  });

  const { create: createFavorite, remove: removeFavorite } = useFavorite();
  const { create: createInteraction, remove: removeInteraction } = useInteraction();

  const isFavorited = (favoritesRes?.data?.items?.length ?? 0) > 0;
  const isSaved = (interactionsRes?.data?.items ?? []).some(
    (item) => item.type === InteractionType.SAVE,
  );

  const favoriteBusy = createFavorite.isPending || removeFavorite.isPending;
  const saveBusy = createInteraction.isPending || removeInteraction.isPending;

  const requireLogin = () => {
    toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
  };

  const handleFavorite = () => {
    if (!userId) {
      requireLogin();
      return;
    }

    if (isFavorited) {
      removeFavorite.mutate({ userId, eventId });
      return;
    }

    createFavorite.mutate({ userId, eventId });
  };

  const handleSave = () => {
    if (!userId) {
      requireLogin();
      return;
    }

    if (isSaved) {
      removeInteraction.mutate({ userId, eventId, type: InteractionType.SAVE });
      return;
    }

    createInteraction.mutate({ type: InteractionType.SAVE, eventId, userId });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép liên kết sự kiện");
      }
    } catch {
      toast.info("Đã hủy chia sẻ");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <button
        type="button"
        onClick={handleFavorite}
        disabled={favoriteBusy}
        className={`${baseButtonClass} w-full sm:w-auto ${isFavorited ? "border-rose-500/50 bg-rose-500/10 text-rose-500" : ""}`}
        title={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
      >
        <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isFavorited ? "fill-current" : ""}`} />
        <span>{isFavorited ? "Đã yêu thích" : "Yêu thích"}</span>
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saveBusy}
        className={`${baseButtonClass} w-full sm:w-auto ${isSaved ? "border-sky-500/50 bg-sky-500/10 text-sky-500" : ""}`}
        title={isSaved ? "Bỏ lưu" : "Lưu sự kiện"}
      >
        <Bookmark className={`h-4 w-4 md:h-5 md:w-5 ${isSaved ? "fill-current" : ""}`} />
        <span>{isSaved ? "Đã lưu" : "Lưu"}</span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        className={`${baseButtonClass} w-full sm:w-auto`}
        title="Chia sẻ sự kiện"
      >
        <Share2 className="h-4 w-4 md:h-5 md:w-5" />
        <span>Chia sẻ</span>
      </button>
    </div>
  );
}
