-- Modo sem números (N7): a pessoa escolhe acompanhar pela fome, saciedade e emoção, sem ver
-- números (copos, metas em %, peso, tabela nutricional). E o diário ganha "como me senti", com
-- sinais de alerta que levam a ajuda profissional (a tela mostra o apoio; nada é automático).

alter table public.user_settings
  add column if not exists no_numbers boolean not null default false;

alter table public.diary_entries
  add column if not exists feelings text[] not null default '{}'
    check (
      feelings <@ array[
        'tranquilidade', 'prazer', 'gratidao', 'pressa', 'distracao', 'tedio', 'ansiedade',
        'tristeza', 'culpa', 'compulsao', 'escondido', 'compensar', 'restricao', 'purgar'
      ]::text[]
      and cardinality(feelings) <= 8
    );
