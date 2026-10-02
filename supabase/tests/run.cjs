// Roda supabase/tests/social_security.sql contra o banco linkado e imprime o resumo.
// Nada é gravado: o script termina com um erro proposital que desfaz a transação.
//
//   node supabase/tests/run.cjs                          # testa o banco como está
//   node supabase/tests/run.cjs <migration.sql> [...]    # testa COM migrations ainda não aplicadas
//                                                        # (injetadas na mesma transação desfeita)
//   Opções: --json  imprime também o relatório completo
//
// Sai com código 1 se algum item falhar.

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const migrations = args.filter((a) => !a.startsWith("--"));

const testSql = fs.readFileSync(path.join(__dirname, "social_security.sql"), "utf8");
const marker = "begin\n  -- Executa sql como um papel.";
if (!testSql.includes(marker)) throw new Error("marcador não encontrado em social_security.sql");

// Cada migration vira um EXECUTE dentro do bloco de teste (tudo é desfeito no rollback final).
const injected = migrations
  .map((file) => "execute $mig$" + fs.readFileSync(file, "utf8") + "$mig$;")
  .join("\n");

const body = injected
  ? // Função de substituição: com string, o JS trataria "$$" (comum em SQL) como um único "$".
    testSql.replace(
      marker,
      () =>
        "begin\n  -- >>> migrations sob teste (desfeitas no rollback)\n  " +
        injected
          .split("\n")
          .map((l) => "  " + l)
          .join("\n") +
        "\n  -- <<<\n  -- Executa sql como um papel.",
    )
  : testSql;

const tmp = path.join(os.tmpdir(), `social_security_${Date.now()}.sql`);
fs.writeFileSync(tmp, body);

const run = spawnSync("npx", ["supabase", "db", "query", "--linked", "-f", tmp], {
  encoding: "utf8",
  shell: true,
  timeout: 240000,
});
fs.rmSync(tmp, { force: true });

const out = (run.stdout || "") + (run.stderr || "");
const line = out.split(/\r?\n/).find((l) => l.startsWith('{"_tag"'));
if (!line) {
  console.error("Resposta inesperada da CLI:\n" + out.slice(0, 800));
  process.exit(2);
}
const envelope = JSON.parse(line);
const message = JSON.parse(envelope.error.message.replace(/^unexpected status 400: /, "")).message;
if (!message.includes("RESULTADOS:")) {
  console.error("O script falhou antes do relatório:\n" + message.slice(0, 1200));
  process.exit(2);
}
let json = message.slice(message.indexOf("RESULTADOS:") + 11);
json = json.slice(0, json.lastIndexOf("]") + 1);
const results = JSON.parse(json);
const failed = results.filter((r) => !r.ok);

console.log(
  `total ${results.length} | passou ${results.length - failed.length} | FALHOU ${failed.length}`,
);
for (const f of failed) {
  console.log(`FALHA | ${f.teste} | ${String(f.obtido).replace(/\s+/g, " ").slice(0, 120)}`);
}
if (asJson) console.log(JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
