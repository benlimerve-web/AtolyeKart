// Kilden sohbet asistanı — n8n "Kilden - Chat Agent" workflow'una bağlanır.
// Sağ alt köşede sohbet balonu olarak görünür.
//
// ÖNEMLİ: Tünel adresi değişirse (cloudflared yeniden başlatılırsa)
// sadece aşağıdaki CHAT_URL satırını güncelleyip git push yapman yeterli.
import { useEffect } from "react";
import "@n8n/chat/style.css";
import "./chat-theme.css";
import { createChat } from "@n8n/chat";

const CHAT_URL =
  "https://coated-landscape-amber-producing.trycloudflare.com/webhook/0c57d202-df41-4e59-a7fc-8a4f5d002b8e/chat";

export default function ChatWidget() {
  useEffect(() => {
    const chat = createChat({
      webhookUrl: CHAT_URL,
      mode: "window",
      showWelcomeScreen: false,
      loadPreviousSession: false,
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      defaultLanguage: "en",
      initialMessages: [
        "Merhaba! Ben Kilden asistanı.",
        "El yapımı ürünlerimizin bakımı ve kullanımı hakkında sorularını yanıtlayabilirim.",
      ],
      i18n: {
        en: {
          title: "Kilden Asistan",
          subtitle: "El yapımı ürünlerimiz hakkında sor",
          footer: "",
          getStarted: "Sohbete başla",
          inputPlaceholder: "Sorunu yaz...",
          closeButtonTooltip: "Kapat",
        },
      },
    });

    // React geliştirme modunda iki kez çalışmasın diye temizlik
    return () => chat?.unmount?.();
  }, []);

  return null;
}
