export const API_BASE_URL = "111.35.151.200";

// API 路径配置
export const API_ROUTES = {
  // 认证相关
  CHECK_INIT: "/api/check-init",
  INIT_PASSWORD: "/api/init-password",
  AUTH: "/api/auth",
  CHANGE_PASSWORD: "/api/change-password",

  // 玩家数据相关
  GET_ALL: "/api/get-all",
  GET_SINGLE: "/api/get-single",
  UPDATE: "/api/update",
  SEARCH_NAMES: "/api/search-names",

  // 系统操作
  SETTINGS: "/api/settings",
  RESET_SCORES: "/api/reset-scores",
  DELETE_ALL_PLAYERS: "/api/delete-all-players",
};

// 构建完整的 API URL
export const getApiUrl = (route) => `${API_BASE_URL}${route}`;
