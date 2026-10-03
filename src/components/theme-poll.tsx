import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import type { LocalizedTheme } from "@/lib/social/themes";
import { useVoteInPoll } from "@/lib/social/themes-queries";

/**
 * Enquete do tema da semana: cada pessoa tem um voto (e pode mudá-lo); o resultado é a contagem
 * do banco, sem mostrar quem votou em quê.
 */
export function ThemePoll({ themeId, theme }: { themeId: string; theme: LocalizedTheme }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const vote = useVoteInPoll();
  const totalVotes = theme.options.reduce((sum, o) => sum + o.votes, 0);

  if (theme.options.length === 0) return null;

  const handleVote = (optionId: string) => {
    if (!user) {
      toast.info(t("weekly.loginToVote"));
      return;
    }
    vote.mutate(
      { themeId, optionId },
      { onSuccess: () => toast.success(t("weekly.voteRegistered")) },
    );
  };

  return (
    <div className="mt-6 border-t border-border/80 pt-5">
      {theme.pollQuestion && (
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("weekly.pollPrefix")} {theme.pollQuestion}
        </h3>
      )}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {theme.options.map((opt) => {
          const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={vote.isPending}
              onClick={() => handleVote(opt.id)}
              aria-pressed={opt.mine}
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition cursor-pointer disabled:opacity-70 ${
                opt.mine
                  ? "border-accent bg-accent-soft/40 shadow-xs"
                  : "border-border bg-card hover:border-accent/60 hover:bg-secondary/40"
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-accent/15 transition-all"
                style={{ width: `${percentage}%` }}
              />
              <div className="relative flex items-center justify-between text-xs font-medium">
                <span className="pr-2 text-foreground">{opt.text}</span>
                <span className="font-bold text-accent">{percentage}%</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-right text-[11px] text-muted-foreground">
        {totalVotes} {t("weekly.membersParticipated")}
      </p>
    </div>
  );
}
