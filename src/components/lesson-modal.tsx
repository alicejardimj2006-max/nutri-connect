import React, { useState, useMemo } from "react";
import { X, CheckCircle2, XCircle, ArrowRight, Star, HeartCrack, Award } from "lucide-react";
import { toast } from "sonner";
import { Activity, Lesson, Character } from "@/lib/learning-trail";

export interface LessonModalProps {
  lesson: Lesson;
  unitTitle: string;
  onClose: () => void;
  onComplete: (lessonId: string, correctCount: number, totalQuestions: number) => void;
  isCompleted: boolean;
}

export function LessonModal({
  lesson,
  unitTitle,
  onClose,
  onComplete,
  isCompleted,
}: LessonModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<"activity" | "result">("activity");

  const activities = lesson.activities;
  const currentActivity = activities[currentIndex];

  const totalQuestions = useMemo(() => {
    return activities.filter((a) => a.type === "quiz" || a.type === "true_false").length;
  }, [activities]);

  const progressPct = ((currentIndex + (phase === "result" ? 1 : 0)) / activities.length) * 100;

  const handleVerify = () => {
    if (selectedAnswer === null) return;

    let correct = false;
    if (currentActivity.type === "quiz") {
      correct = selectedAnswer === currentActivity.correctIndex;
    } else if (currentActivity.type === "true_false") {
      correct = selectedAnswer === currentActivity.isTrue;
    }

    setIsCorrect(correct);
    setIsChecking(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setIsChecking(false);
    setSelectedAnswer(null);

    if (currentIndex < activities.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase("result");
    }
  };

  const scorePercentage = totalQuestions > 0 ? correctCount / totalQuestions : 1;
  const hasPassed = scorePercentage >= lesson.minPassScore;

  const handleFinalize = () => {
    if (hasPassed) {
      onComplete(lesson.id, correctCount, totalQuestions);
    }
    onClose();
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsChecking(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setPhase("activity");
  };

  // Renderer for character and speech bubble
  const renderDialogue = (character?: Character, text?: string) => {
    if (!character || !text) return null;
    return (
      <div className="flex flex-col sm:flex-row items-end sm:items-start gap-4 mb-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-7xl sm:text-8xl shrink-0 animate-bounce pt-2">{character.avatar}</div>
        <div className="bg-secondary/40 border-2 border-border p-5 rounded-3xl rounded-bl-none sm:rounded-bl-3xl sm:rounded-tl-none relative shadow-sm text-foreground/90 leading-relaxed text-lg sm:text-xl">
          {/* Seta do balãozinho em desktop vs mobile */}
          <div className="absolute hidden sm:block -left-[14px] top-6 w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-border border-b-[10px] border-b-transparent"></div>
          <div className="absolute hidden sm:block -left-[10px] top-[26px] w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-secondary/40 border-b-[8px] border-b-transparent"></div>

          <div className="absolute sm:hidden left-6 -bottom-[14px] w-0 h-0 border-l-[10px] border-l-transparent border-t-[14px] border-t-border border-r-[10px] border-r-transparent"></div>
          <div className="absolute sm:hidden left-[26px] -bottom-[10px] w-0 h-0 border-l-[8px] border-l-transparent border-t-[12px] border-t-secondary/40 border-r-[8px] border-r-transparent"></div>

          {text.split(/(\*\*.*?\*\*)/g).map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} className="text-foreground font-black">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm sm:p-4">
      {/* Modal Container */}
      <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto bg-card sm:rounded-[2rem] sm:border-2 border-border sm:shadow-2xl overflow-hidden relative">
        {/* Header - Progress Bar */}
        <div className="flex items-center gap-4 p-5 sm:p-6 bg-card z-10">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
          <div className="flex-1 h-3.5 sm:h-4 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-6 sm:p-10 pb-32">
          {phase === "activity" && (
            <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center">
              {currentActivity.type === "dialogue" && (
                <>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center sm:text-left">
                    Dica da Nutri
                  </h3>
                  {renderDialogue(currentActivity.character, currentActivity.text)}
                </>
              )}

              {currentActivity.type === "quiz" && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8 font-display">
                    {currentActivity.question}
                  </h2>
                  <div className="grid gap-3 sm:gap-4">
                    {currentActivity.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === idx;
                      return (
                        <button
                          key={idx}
                          disabled={isChecking}
                          onClick={() => setSelectedAnswer(idx)}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all text-lg font-medium ${
                            isSelected
                              ? "border-accent bg-accent/10 shadow-sm"
                              : "border-border hover:border-accent/40 bg-card hover:bg-secondary/30"
                          } ${isChecking && !isSelected ? "opacity-50" : ""}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentActivity.type === "true_false" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    {currentActivity.character && (
                      <div className="text-5xl">{currentActivity.character.avatar}</div>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display leading-tight">
                      {currentActivity.statement}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      disabled={isChecking}
                      onClick={() => setSelectedAnswer(true)}
                      className={`w-full p-6 sm:p-8 text-center rounded-2xl border-2 transition-all text-xl font-bold ${
                        selectedAnswer === true
                          ? "border-accent bg-accent/10 shadow-sm"
                          : "border-border hover:border-accent/40 bg-card hover:bg-secondary/30"
                      } ${isChecking && selectedAnswer !== true ? "opacity-50" : ""}`}
                    >
                      Verdadeiro
                    </button>
                    <button
                      disabled={isChecking}
                      onClick={() => setSelectedAnswer(false)}
                      className={`w-full p-6 sm:p-8 text-center rounded-2xl border-2 transition-all text-xl font-bold ${
                        selectedAnswer === false
                          ? "border-accent bg-accent/10 shadow-sm"
                          : "border-border hover:border-accent/40 bg-card hover:bg-secondary/30"
                      } ${isChecking && selectedAnswer !== false ? "opacity-50" : ""}`}
                    >
                      Falso
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === "result" && (
            <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              {hasPassed ? (
                <>
                  <div className="text-8xl mb-6 animate-bounce">🏆</div>
                  <h2 className="text-4xl font-extrabold text-green-500 mb-2 font-display">
                    Lição Concluída!
                  </h2>
                  <p className="text-lg text-foreground/80 mb-8">
                    Você mandou muito bem! O conhecimento é o primeiro passo para a mudança.
                  </p>

                  <div className="flex gap-4 w-full">
                    <div className="flex-1 bg-secondary/50 rounded-2xl p-4 border border-border">
                      <div className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">
                        Total de XP
                      </div>
                      <div className="text-3xl font-black text-amber-500">{lesson.xpReward}</div>
                    </div>
                    <div className="flex-1 bg-secondary/50 rounded-2xl p-4 border border-border">
                      <div className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">
                        Acertos
                      </div>
                      <div className="text-3xl font-black text-accent">
                        {correctCount}/{totalQuestions}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-6 opacity-80">😢</div>
                  <h2 className="text-4xl font-extrabold text-red-500 mb-2 font-display">
                    Poxa, quase lá!
                  </h2>
                  <p className="text-lg text-foreground/80 mb-8">
                    Para ganhar o XP e avançar na trilha, você precisa de pelo menos{" "}
                    <strong>{Math.round(lesson.minPassScore * 100)}%</strong> de acertos.
                    <br />
                    <br />
                    Você acertou{" "}
                    <strong>
                      {correctCount} de {totalQuestions}
                    </strong>
                    . Não desanime, a repetição é a mãe do aprendizado!
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Drawer (Fixed Action Bar) */}
        {phase === "activity" && (
          <div
            className={`absolute bottom-0 left-0 right-0 p-5 sm:p-6 transition-colors duration-300 border-t-2 ${
              isChecking
                ? isCorrect
                  ? "bg-green-100 dark:bg-green-950 border-green-300 dark:border-green-800"
                  : "bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800"
                : "bg-card border-border"
            }`}
          >
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Feedback Message */}
              {isChecking && (
                <div className="flex-1 w-full animate-in slide-in-from-left-4">
                  <div className="flex items-center gap-2 mb-1">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={`text-xl sm:text-2xl font-black ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {isCorrect ? "Mandou bem!" : "Ops, não foi dessa vez."}
                    </span>
                  </div>
                  {/* Explanation text */}
                  {(currentActivity as any).explanation && (
                    <p
                      className={`text-sm sm:text-base font-medium mt-2 leading-relaxed ${isCorrect ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}
                    >
                      {(currentActivity as any).explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className={`w-full ${isChecking ? "sm:w-auto shrink-0" : ""}`}>
                {currentActivity.type === "dialogue" || isChecking ? (
                  <button
                    onClick={handleContinue}
                    className={`w-full sm:w-48 py-4 rounded-2xl text-lg font-black text-white transition-transform active:scale-95 shadow-sm ${
                      isChecking
                        ? isCorrect
                          ? "bg-green-500 hover:bg-green-600 shadow-green-500/20"
                          : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                        : "bg-accent hover:bg-accent/90 shadow-accent/20"
                    }`}
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    onClick={handleVerify}
                    disabled={selectedAnswer === null}
                    className={`w-full py-4 rounded-2xl text-lg font-black transition-all active:scale-95 shadow-sm ${
                      selectedAnswer !== null
                        ? "bg-accent hover:bg-accent/90 text-white shadow-accent/20 cursor-pointer"
                        : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"
                    }`}
                  >
                    Verificar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Drawer for Result Phase */}
        {phase === "result" && (
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-card border-t-2 border-border">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              {hasPassed ? (
                <button
                  onClick={handleFinalize}
                  className="w-full py-4 rounded-2xl text-lg font-black text-white bg-green-500 hover:bg-green-600 transition-transform active:scale-95 shadow-md shadow-green-500/20"
                >
                  Continuar
                </button>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl text-lg font-bold text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    Voltar para Trilha
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-full py-4 rounded-2xl text-lg font-black text-white bg-accent hover:bg-accent/90 transition-transform active:scale-95 shadow-md shadow-accent/20"
                  >
                    Tentar Novamente
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
