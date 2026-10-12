-- Calendário da feira (N5): o estado (UF) que a pessoa escolhe para ver as frutas, verduras e
-- legumes da estação. Fica na conta; o calendário em si é uma tabela do app (sem dados no banco).
alter table public.user_settings
  add column if not exists season_uf text
    check (season_uf in ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
                         'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
                         'SP', 'SE', 'TO'));
