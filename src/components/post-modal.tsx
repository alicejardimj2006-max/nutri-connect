// O post inteiro num modal, exatamente como aparece no feed (mesmo cartão, mesmas regras de tamanho
// máximo e "ver mais"). Usado ao clicar numa miniatura do Explorar ou em um link para um post.
import { PostCard } from "@/components/community-cards";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Post } from "@/lib/community";

export function PostModal({ post, onClose }: { post: Post | null; onClose: () => void }) {
  return (
    <Dialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-xl gap-0 overflow-y-auto overscroll-contain rounded-[1.75rem] border-0 bg-background p-3 sm:p-4">
        <DialogTitle className="sr-only">{post?.title || post?.authorName || "Post"}</DialogTitle>
        <DialogDescription className="sr-only">Publicação completa</DialogDescription>
        {post && <PostCard post={post} />}
      </DialogContent>
    </Dialog>
  );
}
