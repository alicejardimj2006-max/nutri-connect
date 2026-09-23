// Dicionário canônico (Português do Brasil). As demais línguas são checadas contra as chaves daqui.
// Chaves em formato plano ("secao.subsecao.item") para não haver ambiguidade de aninhamento.

const ptBR = {
  // Comum -------------------------------------------------------------
  "common.save": "Salvar",
  "common.saving": "Salvando…",
  "common.cancel": "Cancelar",
  "common.close": "Fechar",
  "common.back": "Voltar",
  "common.confirm": "Confirmar",
  "common.delete": "Excluir",
  "common.edit": "Editar",
  "common.loading": "Carregando…",
  "common.optional": "Opcional",
  "common.enabled": "Ativado",
  "common.disabled": "Desativado",
  "common.on": "Ligado",
  "common.off": "Desligado",
  "common.comingSoon": "Em breve",

  // Navegação principal -------------------------------------------------
  "nav.space": "Espaço",
  "nav.communities": "Comunidades",
  "nav.challenges": "Desafios",
  "nav.profile": "Perfil",
  "nav.post": "Postar",
  "nav.search": "Pesquisar",
  "nav.notifications": "Notificações",
  "nav.loading": "Carregando…",

  // Hub de configurações --------------------------------------------------
  "settings.title": "Configurações",
  "settings.subtitle":
    "Gerencie sua conta, privacidade, notificações e como o NutriConnect aparece para você.",
  "settings.section.account.title": "Conta e segurança",
  "settings.section.account.hint": "Dados pessoais, senha e exclusão de conta",
  "settings.section.privacy.title": "Privacidade",
  "settings.section.privacy.hint": "Quem pode ver seu perfil e suas informações",
  "settings.section.notifications.title": "Notificações",
  "settings.section.notifications.hint": "Alertas do navegador e conquistas",
  "settings.section.appearance.title": "Aparência",
  "settings.section.appearance.hint": "Cores, fontes, modo escuro e mais",
  "settings.section.language.title": "Idioma",
  "settings.section.language.hint": "Escolha o idioma da plataforma",
  "settings.section.about.title": "Sobre o NutriConnect",
  "settings.section.about.link.about": "Sobre nós",
  "settings.section.about.link.contact": "Fale conosco",
  "settings.signout": "Sair da conta",
  "settings.signout.success": "Você saiu da sua conta.",

  // Conta -----------------------------------------------------------------
  "settings.account.title": "Conta e segurança",
  "settings.account.back": "Configurações",
  "settings.account.personalInfo.title": "Informações pessoais",
  "settings.account.personalInfo.hint": "Nome, biografia e objetivo ficam em Editar perfil",
  "settings.account.personalInfo.editLink": "Editar nome, foto e biografia",
  "settings.account.email": "E-mail",
  "settings.account.phone": "Telefone",
  "settings.account.phone.placeholder": "(11) 91234-5678",
  "settings.account.cpf": "CPF",
  "settings.account.cpf.placeholder": "000.000.000-00",
  "settings.account.birthDate": "Data de nascimento",
  "settings.account.contactInfo.title": "Dados de contato e documento",
  "settings.account.contactInfo.saved": "Dados atualizados!",
  "settings.account.password.title": "Alterar senha",
  "settings.account.password.current": "Senha atual",
  "settings.account.password.new": "Nova senha",
  "settings.account.password.confirm": "Confirmar nova senha",
  "settings.account.password.submit": "Alterar senha",
  "settings.account.password.success": "Senha alterada com sucesso!",
  "settings.account.password.mismatch": "A confirmação não é igual à nova senha.",
  "settings.account.password.tooShort": "A nova senha precisa ter pelo menos 6 caracteres.",
  "settings.account.password.wrongCurrent": "Senha atual incorreta.",
  "settings.account.data.title": "Meus dados",
  "settings.account.data.export": "Baixar meus dados (JSON)",
  "settings.account.data.exportHint": "Uma cópia de tudo que sabemos sobre sua conta.",
  "settings.account.danger.title": "Zona de risco",
  "settings.account.danger.delete.title": "Excluir minha conta",
  "settings.account.danger.delete.hint":
    "Essa ação é permanente. Sua conta e seu acesso à plataforma serão removidos.",
  "settings.account.danger.delete.button": "Excluir conta",
  "settings.account.danger.delete.confirmTitle": "Tem certeza?",
  "settings.account.danger.delete.confirmHint":
    'Digite "excluir" abaixo para confirmar. Não é possível desfazer esta ação.',
  "settings.account.danger.delete.confirmPlaceholder": "excluir",
  "settings.account.danger.delete.confirmButton": "Sim, excluir minha conta",
  "settings.account.danger.delete.success": "Conta excluída. Sentiremos sua falta!",

  // Privacidade -------------------------------------------------------------
  "settings.privacy.title": "Privacidade",
  "settings.privacy.profile.title": "Visibilidade do perfil",
  "settings.privacy.profile.private": "Perfil privado",
  "settings.privacy.profile.privateHint":
    "Só você vê sua jornada e publicações. Outras pessoas veem apenas seu nome e biografia.",
  "settings.privacy.contact.title": "Informações de contato",
  "settings.privacy.contact.showEmail": "Mostrar meu e-mail no meu perfil público",
  "settings.privacy.contact.showPhone": "Mostrar meu telefone no meu perfil público",
  "settings.privacy.blocked.title": "Contas bloqueadas",
  "settings.privacy.blocked.hint":
    "Pessoas bloqueadas não podem ver seu perfil nem interagir com você.",
  "settings.privacy.blocked.empty": "Você não bloqueou ninguém ainda.",
  "settings.privacy.blocked.unblock": "Desbloquear",
  "settings.privacy.blocked.unblocked": "Conta desbloqueada.",

  // Notificações -------------------------------------------------------------
  "settings.notifications.title": "Notificações",
  "settings.notifications.push.title": "Notificações do navegador",
  "settings.notifications.push.hint":
    "Receba avisos mesmo com o NutriConnect em segundo plano, direto do seu navegador.",
  "settings.notifications.push.enable": "Ativar notificações",
  "settings.notifications.push.status.default": "Ainda não autorizado neste navegador",
  "settings.notifications.push.status.granted": "Autorizado neste navegador",
  "settings.notifications.push.status.denied":
    "Bloqueado nas configurações do navegador — libere o site para ativar",
  "settings.notifications.push.status.unsupported":
    "Este navegador não é compatível com notificações",
  "settings.notifications.push.test": "Enviar notificação de teste",
  "settings.notifications.push.testTitle": "NutriConnect",
  "settings.notifications.push.testBody": "Assim vão aparecer seus avisos por aqui 🌿",
  "settings.notifications.categories.title": "O que avisar",
  "settings.notifications.categories.achievements": "Conquistas e desafios concluídos",
  "settings.notifications.categories.achievementsHint":
    "Um aviso sempre que você completar um desafio e ganhar um distintivo.",

  // Idioma -----------------------------------------------------------------
  "settings.language.title": "Idioma",
  "settings.language.hint": "Escolha o idioma em que o NutriConnect é exibido para você.",
  "settings.language.current": "Idioma atual",
  "settings.language.changed": "Idioma alterado!",
} as const;

export default ptBR;
export type DictKey = keyof typeof ptBR;
