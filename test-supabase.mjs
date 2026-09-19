import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://pdotnqmmtskjxysvsgxj.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkb3RucW1tdHNranh5c3ZzZ3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTc1OTksImV4cCI6MjEwNDk5MzU5OX0.LH4Cha_deNdfgsb_VHagL30UbZ8n-AHj1F48TfJ7fN4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log("=== API Smoke Test ===");
  console.log(
    "AVISO: Este script é APENAS um smoke test básico para verificar a conectividade da API REST e do banco de dados.",
  );
  console.log(
    "Ele NÃO executa a suíte de testes de segurança pgTAP (RLS) definida em supabase/tests/security.test.sql.",
  );
  console.log(
    "\nPara executar a suíte completa de segurança localmente, utilize a CLI do Supabase com o Docker em execução:",
  );
  console.log("  $ npx supabase test db");
  console.log("\nExecutando teste básico de conexão...");

  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  console.log("Profiles Result:", { data, error });

  if (error) {
    console.error("Falha no teste de conexão.");
    process.exit(1);
  } else {
    console.log("Conexão bem sucedida.");
  }
}

test();
