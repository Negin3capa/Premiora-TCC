import { useCallback, useState } from "react";

/**
 * Hook personalizado que gerencia as abas do perfil
 * Controla a navegação entre as diferentes seções do perfil
 */
export const useProfileTabs = () => {
  const [activeTab, setActiveTab] = useState<
    "home" | "posts" | "community" | "shop" | "creator"
  >("home");

  // Handler para mudança de aba
  const handleTabChange = useCallback(
    (tab: "home" | "posts" | "community" | "shop" | "creator") => {
      setActiveTab(tab);
    },
    [],
  );

  return {
    // Estado da aba ativa
    activeTab,

    // Controle de abas
    handleTabChange,

    // Utilitários para verificar aba ativa
    isHomeTab: activeTab === "home",
    isPostsTab: activeTab === "posts",
    isCommunityTab: activeTab === "community",
    isShopTab: activeTab === "shop",
    isCreatorTab: activeTab === "creator",
  };
};
