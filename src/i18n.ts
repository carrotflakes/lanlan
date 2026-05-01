import type { LanguageCode } from "./types";

export type UiText = {
  appLoading: string;
  practiceSessions: string;
  newSession: string;
  emptySessions: string;
  startConversation: string;
  anonymousUser: string;
  guest: string;
  account: string;
  deleteSession: string;
  settings: string;
  firebaseMissing: string;
  dismiss: string;
  thinking: string;
  writeInLanguage: (language: string) => string;
  send: string;
  welcomeEyebrow: string;
  welcomeTitle: string;
  nativeLanguage: string;
  practiceLanguage: string;
  startPractice: string;
  loading: string;
  translate: string;
  notes: string;
  listen: string;
  learningAndAi: string;
  accountSection: string;
  guestAccount: string;
  googleAccount: string;
  googleHint: string;
  continueWithGoogle: string;
  signOut: string;
  languagesSection: string;
  native: string;
  practice: string;
  uiLanguage: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  aiProvider: string;
  audioSection: string;
  autoPlayAssistantAudio: string;
  autoPlayAssistantAudioHint: string;
  supportSection: string;
  preloadAnnotations: string;
  preloadAnnotationsHint: string;
  confirmDeleteSession: (title: string) => string;
  openaiUnavailable: string;
  genericError: string;
};

const en: UiText = {
  appLoading: "Preparing your practice space...",
  practiceSessions: "Practice sessions",
  newSession: "New session",
  emptySessions: "No sessions yet. Start one when you are ready.",
  startConversation: "Start a conversation",
  anonymousUser: "Anonymous user",
  guest: "Guest",
  account: "Account",
  deleteSession: "Delete session",
  settings: "Settings",
  firebaseMissing:
    "Firebase environment variables are missing. Copy `.env.example` to `.env.local` and fill the Firebase web app config before running against a real project.",
  dismiss: "Dismiss",
  thinking: "Thinking...",
  writeInLanguage: (language) => `Write in ${language}...`,
  send: "Send",
  welcomeEyebrow: "AI conversation practice",
  welcomeTitle: "Start with a short exchange and ask for help only when you need it.",
  nativeLanguage: "Native language",
  practiceLanguage: "Practice language",
  startPractice: "Start practice",
  loading: "Loading...",
  translate: "Translate",
  notes: "Notes",
  listen: "Listen",
  learningAndAi: "Learning and AI",
  accountSection: "Account",
  guestAccount: "Guest account",
  googleAccount: "Google account",
  googleHint: "Sign in with Google to keep access across devices.",
  continueWithGoogle: "Continue with Google",
  signOut: "Sign out",
  languagesSection: "Languages",
  native: "Native",
  practice: "Practice",
  uiLanguage: "UI language",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
  aiProvider: "AI provider",
  audioSection: "Audio",
  autoPlayAssistantAudio: "Auto-play AI replies",
  autoPlayAssistantAudioHint: "Play the assistant's voice automatically when a new reply arrives.",
  supportSection: "Support",
  preloadAnnotations: "Preload notes",
  preloadAnnotationsHint: "Generate note popovers in the background after each AI reply.",
  confirmDeleteSession: (title) => `Delete "${title}"?`,
  openaiUnavailable: "OpenAI access is not enabled for this account.",
  genericError: "Something went wrong."
};

const ja: UiText = {
  appLoading: "練習スペースを準備しています...",
  practiceSessions: "練習セッション",
  newSession: "新しいセッション",
  emptySessions: "まだセッションがありません。準備できたら始めましょう。",
  startConversation: "会話を始める",
  anonymousUser: "匿名ユーザー",
  guest: "ゲスト",
  account: "アカウント",
  deleteSession: "セッションを削除",
  settings: "設定",
  firebaseMissing:
    "Firebase の環境変数が不足しています。実際のプロジェクトで動かす前に `.env.example` を `.env.local` にコピーして Firebase Web アプリ設定を入力してください。",
  dismiss: "閉じる",
  thinking: "考えています...",
  writeInLanguage: (language) => `${language}で入力...`,
  send: "送信",
  welcomeEyebrow: "AI会話練習",
  welcomeTitle: "短いやりとりから始めて、必要なときだけサポートを使いましょう。",
  nativeLanguage: "母国語",
  practiceLanguage: "練習する言語",
  startPractice: "練習を始める",
  loading: "読み込み中...",
  translate: "翻訳",
  notes: "注釈",
  listen: "聞く",
  learningAndAi: "学習とAI",
  accountSection: "アカウント",
  guestAccount: "ゲストアカウント",
  googleAccount: "Googleアカウント",
  googleHint: "Googleでログインすると別の端末からも使えます。",
  continueWithGoogle: "Googleで続ける",
  signOut: "ログアウト",
  languagesSection: "言語",
  native: "母国語",
  practice: "練習言語",
  uiLanguage: "UI言語",
  theme: "テーマ",
  light: "ライト",
  dark: "ダーク",
  system: "システム",
  aiProvider: "AIプロバイダー",
  audioSection: "音声",
  autoPlayAssistantAudio: "AIの返信を自動再生",
  autoPlayAssistantAudioHint: "新しいAI返信が届いたら自動で読み上げます。",
  supportSection: "サポート",
  preloadAnnotations: "注釈を先読み",
  preloadAnnotationsHint: "AIの返信後に、注釈ポップオーバーを裏で生成します。",
  confirmDeleteSession: (title) => `「${title}」を削除しますか？`,
  openaiUnavailable: "このアカウントでは OpenAI を利用できません。",
  genericError: "問題が発生しました。"
};

const ko: UiText = {
  ...en,
  appLoading: "연습 공간을 준비하는 중...",
  settings: "설정",
  practiceSessions: "연습 세션",
  newSession: "새 세션",
  emptySessions: "아직 세션이 없습니다. 준비되면 시작하세요.",
  startConversation: "대화 시작",
  anonymousUser: "익명 사용자",
  guest: "게스트",
  account: "계정",
  deleteSession: "세션 삭제",
  dismiss: "닫기",
  thinking: "생각하는 중...",
  writeInLanguage: (language) => `${language}로 입력...`,
  send: "보내기",
  welcomeEyebrow: "AI 회화 연습",
  welcomeTitle: "짧은 대화부터 시작하고 필요할 때만 도움을 사용하세요.",
  translate: "번역",
  notes: "노트",
  listen: "듣기",
  loading: "불러오는 중...",
  learningAndAi: "학습과 AI",
  accountSection: "계정",
  guestAccount: "게스트 계정",
  googleAccount: "Google 계정",
  googleHint: "Google로 로그인하면 여러 기기에서 계속 사용할 수 있습니다.",
  continueWithGoogle: "Google로 계속",
  signOut: "로그아웃",
  languagesSection: "언어",
  native: "모국어",
  practice: "연습 언어",
  nativeLanguage: "모국어",
  practiceLanguage: "연습 언어",
  uiLanguage: "UI 언어",
  theme: "테마",
  light: "라이트",
  dark: "다크",
  system: "시스템",
  aiProvider: "AI 제공자",
  audioSection: "오디오",
  autoPlayAssistantAudio: "AI 답변 자동 재생",
  autoPlayAssistantAudioHint: "새 AI 답변이 오면 자동으로 음성을 재생합니다.",
  startPractice: "연습 시작",
  confirmDeleteSession: (title) => `"${title}" 세션을 삭제할까요?`,
  openaiUnavailable: "이 계정에서는 OpenAI를 사용할 수 없습니다.",
  genericError: "문제가 발생했습니다."
};

const zhHans: UiText = {
  ...en,
  appLoading: "正在准备练习空间...",
  settings: "设置",
  practiceSessions: "练习会话",
  newSession: "新会话",
  emptySessions: "还没有会话。准备好后就开始吧。",
  startConversation: "开始对话",
  anonymousUser: "匿名用户",
  guest: "访客",
  account: "账号",
  deleteSession: "删除会话",
  dismiss: "关闭",
  thinking: "正在思考...",
  writeInLanguage: (language) => `用${language}输入...`,
  send: "发送",
  welcomeEyebrow: "AI 会话练习",
  welcomeTitle: "从简短对话开始，只在需要时使用辅助功能。",
  translate: "翻译",
  notes: "注释",
  listen: "收听",
  loading: "加载中...",
  learningAndAi: "学习与 AI",
  accountSection: "账号",
  guestAccount: "访客账号",
  googleAccount: "Google 账号",
  googleHint: "使用 Google 登录后，可在不同设备上继续使用。",
  continueWithGoogle: "使用 Google 继续",
  signOut: "退出登录",
  languagesSection: "语言",
  native: "母语",
  practice: "练习语言",
  nativeLanguage: "母语",
  practiceLanguage: "练习语言",
  uiLanguage: "界面语言",
  theme: "主题",
  light: "浅色",
  dark: "深色",
  system: "系统",
  aiProvider: "AI 提供商",
  audioSection: "音频",
  autoPlayAssistantAudio: "自动播放 AI 回复",
  autoPlayAssistantAudioHint: "收到新的 AI 回复时自动播放语音。",
  startPractice: "开始练习",
  confirmDeleteSession: (title) => `要删除“${title}”吗？`,
  openaiUnavailable: "此账号尚未启用 OpenAI。",
  genericError: "出现问题。"
};

const zhHant: UiText = {
  ...en,
  appLoading: "正在準備練習空間...",
  settings: "設定",
  practiceSessions: "練習會話",
  newSession: "新會話",
  emptySessions: "還沒有會話。準備好後就開始吧。",
  startConversation: "開始對話",
  anonymousUser: "匿名使用者",
  guest: "訪客",
  account: "帳號",
  deleteSession: "刪除會話",
  dismiss: "關閉",
  thinking: "正在思考...",
  writeInLanguage: (language) => `用${language}輸入...`,
  send: "傳送",
  welcomeEyebrow: "AI 會話練習",
  welcomeTitle: "從簡短對話開始，只在需要時使用輔助功能。",
  translate: "翻譯",
  notes: "註釋",
  listen: "聆聽",
  loading: "載入中...",
  learningAndAi: "學習與 AI",
  accountSection: "帳號",
  guestAccount: "訪客帳號",
  googleAccount: "Google 帳號",
  googleHint: "使用 Google 登入後，可在不同裝置上繼續使用。",
  continueWithGoogle: "使用 Google 繼續",
  signOut: "登出",
  languagesSection: "語言",
  native: "母語",
  practice: "練習語言",
  nativeLanguage: "母語",
  practiceLanguage: "練習語言",
  uiLanguage: "介面語言",
  theme: "主題",
  light: "淺色",
  dark: "深色",
  system: "系統",
  aiProvider: "AI 提供者",
  audioSection: "音訊",
  autoPlayAssistantAudio: "自動播放 AI 回覆",
  autoPlayAssistantAudioHint: "收到新的 AI 回覆時自動播放語音。",
  startPractice: "開始練習",
  confirmDeleteSession: (title) => `要刪除「${title}」嗎？`,
  openaiUnavailable: "此帳號尚未啟用 OpenAI。",
  genericError: "發生問題。"
};

const es: UiText = {
  ...en,
  appLoading: "Preparando tu espacio de práctica...",
  settings: "Ajustes",
  practiceSessions: "Sesiones de práctica",
  newSession: "Nueva sesión",
  emptySessions: "Aún no hay sesiones. Empieza cuando quieras.",
  startConversation: "Iniciar conversación",
  anonymousUser: "Usuario anónimo",
  guest: "Invitado",
  account: "Cuenta",
  deleteSession: "Eliminar sesión",
  dismiss: "Cerrar",
  thinking: "Pensando...",
  writeInLanguage: (language) => `Escribe en ${language}...`,
  send: "Enviar",
  welcomeEyebrow: "Práctica de conversación con IA",
  welcomeTitle: "Empieza con un intercambio breve y pide ayuda solo cuando la necesites.",
  translate: "Traducir",
  notes: "Notas",
  listen: "Escuchar",
  loading: "Cargando...",
  learningAndAi: "Aprendizaje e IA",
  accountSection: "Cuenta",
  guestAccount: "Cuenta de invitado",
  googleAccount: "Cuenta de Google",
  googleHint: "Inicia sesión con Google para continuar en varios dispositivos.",
  continueWithGoogle: "Continuar con Google",
  signOut: "Cerrar sesión",
  languagesSection: "Idiomas",
  native: "Nativo",
  practice: "Práctica",
  nativeLanguage: "Lengua nativa",
  practiceLanguage: "Idioma de práctica",
  uiLanguage: "Idioma de la interfaz",
  theme: "Tema",
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
  aiProvider: "Proveedor de IA",
  audioSection: "Audio",
  autoPlayAssistantAudio: "Reproducir respuestas de IA",
  autoPlayAssistantAudioHint: "Reproduce la voz del asistente automáticamente cuando llega una nueva respuesta.",
  startPractice: "Empezar práctica",
  confirmDeleteSession: (title) => `¿Eliminar "${title}"?`,
  openaiUnavailable: "OpenAI no está habilitado para esta cuenta.",
  genericError: "Algo salió mal."
};

const fr: UiText = {
  ...en,
  appLoading: "Préparation de votre espace de pratique...",
  settings: "Paramètres",
  practiceSessions: "Sessions de pratique",
  newSession: "Nouvelle session",
  emptySessions: "Aucune session pour le moment. Commencez quand vous êtes prêt.",
  startConversation: "Commencer une conversation",
  anonymousUser: "Utilisateur anonyme",
  guest: "Invité",
  account: "Compte",
  deleteSession: "Supprimer la session",
  dismiss: "Fermer",
  thinking: "Réflexion...",
  writeInLanguage: (language) => `Écrivez en ${language}...`,
  send: "Envoyer",
  welcomeEyebrow: "Pratique de conversation avec l'IA",
  welcomeTitle: "Commencez par un court échange et demandez de l'aide seulement si nécessaire.",
  translate: "Traduire",
  notes: "Notes",
  listen: "Écouter",
  loading: "Chargement...",
  learningAndAi: "Apprentissage et IA",
  accountSection: "Compte",
  guestAccount: "Compte invité",
  googleAccount: "Compte Google",
  googleHint: "Connectez-vous avec Google pour continuer sur plusieurs appareils.",
  continueWithGoogle: "Continuer avec Google",
  signOut: "Se déconnecter",
  languagesSection: "Langues",
  native: "Maternelle",
  practice: "Pratique",
  nativeLanguage: "Langue maternelle",
  practiceLanguage: "Langue d'entraînement",
  uiLanguage: "Langue de l'interface",
  theme: "Thème",
  light: "Clair",
  dark: "Sombre",
  system: "Système",
  aiProvider: "Fournisseur IA",
  audioSection: "Audio",
  autoPlayAssistantAudio: "Lire les réponses IA",
  autoPlayAssistantAudioHint: "Lit automatiquement la voix de l'assistant quand une nouvelle réponse arrive.",
  startPractice: "Commencer",
  confirmDeleteSession: (title) => `Supprimer "${title}" ?`,
  openaiUnavailable: "OpenAI n'est pas activé pour ce compte.",
  genericError: "Un problème est survenu."
};

const de: UiText = {
  ...en,
  appLoading: "Übungsbereich wird vorbereitet...",
  settings: "Einstellungen",
  practiceSessions: "Übungssitzungen",
  newSession: "Neue Sitzung",
  emptySessions: "Noch keine Sitzungen. Starte, wenn du bereit bist.",
  startConversation: "Gespräch starten",
  anonymousUser: "Anonymer Benutzer",
  guest: "Gast",
  account: "Konto",
  deleteSession: "Sitzung löschen",
  dismiss: "Schließen",
  thinking: "Denkt nach...",
  writeInLanguage: (language) => `Schreibe auf ${language}...`,
  send: "Senden",
  welcomeEyebrow: "KI-Konversationsübung",
  welcomeTitle: "Beginne mit einem kurzen Austausch und nutze Hilfe nur bei Bedarf.",
  translate: "Übersetzen",
  notes: "Notizen",
  listen: "Anhören",
  loading: "Wird geladen...",
  learningAndAi: "Lernen und KI",
  accountSection: "Konto",
  guestAccount: "Gastkonto",
  googleAccount: "Google-Konto",
  googleHint: "Melde dich mit Google an, um auf mehreren Geräten weiterzumachen.",
  continueWithGoogle: "Mit Google fortfahren",
  signOut: "Abmelden",
  languagesSection: "Sprachen",
  native: "Muttersprache",
  practice: "Übung",
  nativeLanguage: "Muttersprache",
  practiceLanguage: "Übungssprache",
  uiLanguage: "UI-Sprache",
  theme: "Design",
  light: "Hell",
  dark: "Dunkel",
  system: "System",
  aiProvider: "KI-Anbieter",
  audioSection: "Audio",
  autoPlayAssistantAudio: "KI-Antworten automatisch abspielen",
  autoPlayAssistantAudioHint: "Spielt die Stimme des Assistenten automatisch ab, wenn eine neue Antwort eintrifft.",
  startPractice: "Übung starten",
  confirmDeleteSession: (title) => `"${title}" löschen?`,
  openaiUnavailable: "OpenAI ist für dieses Konto nicht aktiviert.",
  genericError: "Etwas ist schiefgelaufen."
};

const dictionaries: Record<LanguageCode, UiText> = {
  ja,
  en,
  ko,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  es,
  fr,
  de
};

export function getUiText(language: LanguageCode): UiText {
  return dictionaries[language] ?? en;
}
