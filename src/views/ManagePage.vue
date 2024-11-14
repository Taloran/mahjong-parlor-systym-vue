<template>
  <div class="manage">
    <div class="manage-header">
      <h2 class="page-title">数据管理</h2>
      <div class="header-buttons">
        <button class="change-password-btn" @click="openChangePasswordDialog">
          修改密码
        </button>
        <button class="reset-btn" @click="openResetDialog">清零分数</button>
        <button class="delete-btn" @click="openDeleteDialog">删除玩家</button>
        <button class="logout-btn" @click="logout">退出登录</button>
      </div>
    </div>

    <!-- 新建对局区块 -->
    <div class="manage-section">
      <h3 class="section-title">新建对局</h3>
      <div class="form-container">
        <!-- 玩家输入表单 -->
        <div
          v-for="(player, index) in players"
          :key="index"
          class="player-form"
        >
          <h4 class="player-title">玩家 {{ index + 1 }}</h4>
          <div class="player-inputs">
            <div class="form-group">
              <label :for="'name' + index">姓名：</label>
              <div class="input-wrapper">
                <input
                  type="text"
                  :id="'name' + index"
                  v-model="player.name"
                  @input="handleNameInput($event, index)"
                  @blur="closeSuggestions(index)"
                  placeholder="请输入玩家姓名"
                  autocomplete="off"
                />
                <!-- 建议列表 -->
                <div
                  v-if="
                    player.showSuggestions &&
                    suggestions.length > 0 &&
                    currentPlayerIndex === index
                  "
                  class="suggestions-list"
                >
                  <div
                    v-for="suggestion in suggestions"
                    :key="suggestion"
                    class="suggestion-item"
                    @mousedown="selectName(suggestion, index)"
                  >
                    {{ suggestion }}
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label :for="'score' + index">分数：</label>
              <input
                type="number"
                :id="'score' + index"
                v-model="player.score"
                placeholder="请输入分数"
              />
            </div>
          </div>
        </div>

        <!-- 总分显示 -->
        <div class="total-score" :class="{ invalid: totalScore !== 1000 }">
          总分: {{ totalScore }}/1000
        </div>

        <button class="submit-btn" @click="submitGame">提交对局</button>
      </div>
    </div>

    <!-- 修改玩家分数区块 -->
    <div class="manage-section">
      <h3 class="section-title">修改玩家分数</h3>
      <div class="form-container">
        <div class="form-group">
          <label for="modifyPlayerName">玩家姓名：</label>
          <div class="input-wrapper">
            <input
              type="text"
              id="modifyPlayerName"
              v-model="modifyPlayer.name"
              @input="handleModifyNameInput"
              @blur="closeSuggestions(-1)"
              placeholder="请输入玩家姓名"
              autocomplete="off"
            />
            <!-- 建议列表 -->
            <div
              v-if="
                modifyPlayer.showSuggestions &&
                suggestions.length > 0 &&
                currentPlayerIndex === -1
              "
              class="suggestions-list"
            >
              <div
                v-for="suggestion in suggestions"
                :key="suggestion"
                class="suggestion-item"
                @mousedown="selectModifyName(suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="modifyPlayerScore">新分数：</label>
          <input
            type="number"
            id="modifyPlayerScore"
            v-model="modifyPlayer.score"
            placeholder="请输入新分数"
          />
        </div>
        <button class="modify-btn" @click="submitModifyScore">修改分数</button>
      </div>
    </div>

    <!-- 设置区块 -->
    <div class="manage-section">
      <h3 class="section-title">系统设置</h3>
      <div class="settings-container">
        <div class="setting-group">
          <h4 class="setting-title">马点设置</h4>
          <div class="horse-points">
            <div
              class="form-group"
              v-for="(point, index) in horsePoints"
              :key="index"
            >
              <label :for="'horse' + (index + 1)">{{ index + 1 }}马</label>
              <input
                type="number"
                :id="'horse' + (index + 1)"
                v-model="horsePoints[index]"
                placeholder="请输入马点"
              />
            </div>
          </div>
        </div>

        <div class="setting-group">
          <h4 class="setting-title">返点设置</h4>
          <div class="form-group">
            <label for="returnPoint">返点值</label>
            <input
              type="number"
              id="returnPoint"
              v-model="returnPoint"
              placeholder="请输入返点"
            />
          </div>
        </div>

        <button class="save-settings-btn" @click="saveSettings">
          保存设置
        </button>
      </div>
    </div>

    <!-- 清零确认对话框 -->
    <div v-if="showResetDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>确认清零所有分数</h3>
        <p class="warning-text">此操作将清零所有玩家的分数，无法撤销！</p>
        <div class="form-group">
          <label for="resetPassword">请输入管理密码确认：</label>
          <input
            type="password"
            id="resetPassword"
            v-model="resetPassword"
            @keyup.enter="confirmReset"
            placeholder="请输入密码"
          />
        </div>
        <div v-if="resetError" class="error-message">
          {{ resetError }}
        </div>
        <div class="dialog-buttons">
          <button class="cancel-btn" @click="closeResetDialog">取消</button>
          <button class="danger-btn" @click="confirmReset">确认清零</button>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <div v-if="showChangePasswordDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>修改管理密码</h3>
        <div class="form-group">
          <label for="oldPassword">当前密码</label>
          <input
            type="password"
            id="oldPassword"
            v-model="passwordForm.oldPassword"
            placeholder="请输入当前密码"
          />
        </div>
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <input
            type="password"
            id="newPassword"
            v-model="passwordForm.newPassword"
            placeholder="请输入新密码"
          />
        </div>
        <div class="form-group">
          <label for="confirmNewPassword">确认新密码</label>
          <input
            type="password"
            id="confirmNewPassword"
            v-model="passwordForm.confirmNewPassword"
            @keyup.enter="submitPasswordChange"
            placeholder="请再次输入新密码"
          />
        </div>
        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>
        <div class="dialog-buttons">
          <button class="cancel-btn" @click="closeChangePasswordDialog">
            取消
          </button>
          <button class="confirm-btn" @click="submitPasswordChange">
            确认
          </button>
        </div>
      </div>
    </div>

    <!-- 删除玩家确认对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h3>删除所有玩家数据</h3>
        <p class="warning-text">此操作将删除所有玩家数据，无法恢复！</p>
        <div class="form-group">
          <label for="deletePassword">请输入管理密码确认：</label>
          <input
            type="password"
            id="deletePassword"
            v-model="deletePassword"
            @keyup.enter="confirmDelete"
            placeholder="请输入密码"
          />
        </div>
        <div v-if="deleteError" class="error-message">
          {{ deleteError }}
        </div>
        <div class="dialog-buttons">
          <button class="cancel-btn" @click="closeDeleteDialog">取消</button>
          <button class="danger-btn" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { debounce } from "lodash-es";
import { useRouter } from "vue-router";

const router = useRouter();

const players = ref([
  { name: "", score: "", showSuggestions: false },
  { name: "", score: "", showSuggestions: false },
  { name: "", score: "", showSuggestions: false },
  { name: "", score: "", showSuggestions: false },
]);

const suggestions = ref([]);
const currentPlayerIndex = ref(null);

// 设置相关的状态
const horsePoints = ref([0, 0, 0, 0]); // 四个马点
const returnPoint = ref(0); // 返点

// 添加清零相关的状态
const showResetDialog = ref(false);
const resetPassword = ref("");
const resetError = ref("");

// 修改密码相关的状态
const showChangePasswordDialog = ref(false);
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});
const passwordError = ref("");

// 添加删除相关的状态
const showDeleteDialog = ref(false);
const deletePassword = ref("");
const deleteError = ref("");

// 添加修改玩家分数相关的状态
const modifyPlayer = ref({
  name: "",
  score: "",
  showSuggestions: false,
});

// 防抖处理的搜索函数
const searchNames = debounce(async (searchText, playerIndex) => {
  if (searchText.length < 2) {
    suggestions.value = [];
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/search-names?q=${encodeURIComponent(
        searchText
      )}`
    );
    if (response.ok) {
      const data = await response.json();
      suggestions.value = data;
      players.value[playerIndex].showSuggestions = true;
    }
  } catch (error) {
    console.error("搜索失败:", error);
  }
}, 1000);

const handleNameInput = (event, playerIndex) => {
  const searchText = event.target.value;
  currentPlayerIndex.value = playerIndex;

  if (searchText.length < 2) {
    players.value[playerIndex].showSuggestions = false;
    suggestions.value = [];
    return;
  }

  searchNames(searchText, playerIndex);
};

const selectName = (name, playerIndex) => {
  players.value[playerIndex].name = name;
  players.value[playerIndex].showSuggestions = false;
  suggestions.value = [];
};

const closeSuggestions = (playerIndex) => {
  setTimeout(() => {
    players.value[playerIndex].showSuggestions = false;
  }, 200);
};

const totalScore = computed(() => {
  return players.value.reduce((sum, player) => {
    return sum + (Number(player.score) || 0);
  }, 0);
});

const validateForm = () => {
  const hasEmptyFields = players.value.some(
    (player) => !player.name.trim() || !player.score.toString().trim()
  );

  if (hasEmptyFields) {
    alert("请填写所有玩家的姓名和分数");
    return false;
  }

  if (totalScore.value !== 1000) {
    alert("四位玩家的总分必须为1000分");
    return false;
  }

  return true;
};

// 获取玩家当前分数
const getPlayerScore = async (name) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/get-single?name=${encodeURIComponent(name)}`
    );
    const data = await response.json();
    return data.score;
  } catch (error) {
    console.error(`获取玩家 ${name} 分数失败:`, error);
    return 0; // 如果获取失败，返回0分
  }
};

// 更新玩家分数
const updatePlayerScore = async (name, newScore) => {
  try {
    const response = await fetch("http://localhost:3000/api/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        newScore: newScore,
      }),
    });

    if (!response.ok) {
      throw new Error(`更新玩家 ${name} 分数失败`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// 计算单个玩家的分数变动
const calculateScoreChange = (gameScore, playerIndex) => {
  // 对局分数除以10
  const baseChange = gameScore / 10;
  // 减去返点
  const afterReturn = baseChange - returnPoint.value;
  // 加上马点
  const finalChange = afterReturn + horsePoints.value[playerIndex];
  return finalChange;
};

// 修改 submitGame 函数
const submitGame = async () => {
  if (!validateForm()) return;

  try {
    // 计算并更新每个玩家的分数
    for (let i = 0; i < players.value.length; i++) {
      const player = players.value[i];

      // 获取当前分数
      const currentScore = await getPlayerScore(player.name);

      // 计算分数变动
      const scoreChange = calculateScoreChange(Number(player.score), i);

      // 计算新分数
      const newScore = currentScore + scoreChange;

      // 更新玩家分数
      await updatePlayerScore(player.name, newScore);
    }

    alert("对局记录添加成功！");
    // 重置表单
    players.value = players.value.map(() => ({
      name: "",
      score: "",
      showSuggestions: false,
    }));
  } catch (error) {
    console.error("提交失败:", error);
    alert("提交失败，请检查网络连接");
  }
};

const logout = () => {
  localStorage.removeItem("auth_token");
  router.push("/login");
};

// 保存设置
const saveSettings = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("未登录或登录已过期，请重新登录");
      router.push("/login");
      return;
    }

    const response = await fetch("http://localhost:3000/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        horsePoints: horsePoints.value.map(Number), // 确保转换为数字
        returnPoint: Number(returnPoint.value), // 确保转换为数字
      }),
    });

    if (response.ok) {
      alert("设置保存成功！");
    } else if (response.status === 401) {
      alert("登录已过期，请重新登录");
      router.push("/login");
    } else {
      const data = await response.json();
      alert(data.message || "保存设置失败，请重试");
    }
  } catch (error) {
    console.error("保存设置失败:", error);
    alert("保存设置失败，请检查网络连接");
  }
};

// 获取设置
const getSettings = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("未登录或登录已过期，请重新登录");
      router.push("/login");
      return;
    }

    const response = await fetch("http://localhost:3000/api/settings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      horsePoints.value = data.horsePoints;
      returnPoint.value = data.returnPoint;
    } else if (response.status === 401) {
      alert("登录已过期，请重新登录");
      router.push("/login");
    } else {
      console.error("获取设置失败:", await response.text());
    }
  } catch (error) {
    console.error("获取设置失败:", error);
  }
};

// 在组件挂载时获取设置
onMounted(getSettings);

// 清零确认对话框
const openResetDialog = () => {
  showResetDialog.value = true;
  resetPassword.value = "";
  resetError.value = "";
};

const closeResetDialog = () => {
  showResetDialog.value = false;
  resetPassword.value = "";
  resetError.value = "";
};

// 确认清零
const confirmReset = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("未登录或登录已过期，请重新登录");
      router.push("/login");
      return;
    }

    const response = await fetch("http://localhost:3000/api/reset-scores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: resetPassword.value,
      }),
    });

    if (response.ok) {
      alert("所有分数已清零");
      closeResetDialog();
    } else if (response.status === 401) {
      resetError.value = "密码错误";
    } else {
      const data = await response.json();
      resetError.value = data.message || "操作失败，请重试";
    }
  } catch (error) {
    console.error("清零失败:", error);
    resetError.value = "操作失败，请稍后重试";
  }
};

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  showChangePasswordDialog.value = true;
  passwordForm.value = {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };
  passwordError.value = "";
};

// 关闭修改密码对话框
const closeChangePasswordDialog = () => {
  showChangePasswordDialog.value = false;
  passwordError.value = "";
};

// 提交密码修改
const submitPasswordChange = async () => {
  // 验证新密码
  if (
    passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword
  ) {
    passwordError.value = "两次输入的新密码不一致";
    return;
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = "新密码长度至少为6位";
    return;
  }

  try {
    const token = localStorage.getItem("auth_token");
    const response = await fetch("http://localhost:3000/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // 更新token
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      alert("密码修改成功！");
      closeChangePasswordDialog();
    } else if (response.status === 401) {
      passwordError.value = "当前密码错误";
    } else {
      const data = await response.json();
      passwordError.value = data.message || "修改密码失败，请重试";
    }
  } catch (error) {
    console.error("修改密码失败:", error);
    passwordError.value = "修改密码失败，请稍后重试";
  }
};

// 删除确认对话框
const openDeleteDialog = () => {
  showDeleteDialog.value = true;
  deletePassword.value = "";
  deleteError.value = "";
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  deletePassword.value = "";
  deleteError.value = "";
};

// 确认删除
const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("未登录或登录已过期，请重新登录");
      router.push("/login");
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/delete-all-players",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: deletePassword.value,
        }),
      }
    );

    if (response.ok) {
      alert("所有玩家数据已删除");
      closeDeleteDialog();
    } else if (response.status === 401) {
      deleteError.value = "密码错误";
    } else {
      const data = await response.json();
      deleteError.value = data.message || "操作失败，请重试";
    }
  } catch (error) {
    console.error("删除失败:", error);
    deleteError.value = "操作失败，请稍后重试";
  }
};

// 处理修改玩家名称输入
const handleModifyNameInput = (event) => {
  const searchText = event.target.value;
  currentPlayerIndex.value = -1; // 使用-1表示修改玩家的搜索

  if (searchText.length < 2) {
    modifyPlayer.value.showSuggestions = false;
    suggestions.value = [];
    return;
  }

  searchNames(searchText, -1);
};

// 选择修改玩家名称
const selectModifyName = async (name) => {
  modifyPlayer.value.name = name;
  modifyPlayer.value.showSuggestions = false;
  suggestions.value = [];

  // 获取当前分数
  try {
    const response = await fetch(
      `http://localhost:3000/api/get-single?name=${encodeURIComponent(name)}`
    );
    const data = await response.json();
    modifyPlayer.value.score = data.score;
  } catch (error) {
    console.error("获取玩家分数失败:", error);
  }
};

// 提交修改分数
const submitModifyScore = async () => {
  if (!modifyPlayer.value.name.trim()) {
    alert("请输入玩家姓名");
    return;
  }

  if (!modifyPlayer.value.score.toString().trim()) {
    alert("请输入新分数");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: modifyPlayer.value.name,
        newScore: Number(modifyPlayer.value.score),
      }),
    });

    if (response.ok) {
      alert("分数修改成功！");
      // 重置表单
      modifyPlayer.value = {
        name: "",
        score: "",
        showSuggestions: false,
      };
    } else {
      alert("修改失败，请重试");
    }
  } catch (error) {
    console.error("修改失败:", error);
    alert("修改失败，请检查网络连接");
  }
};
</script>

<style scoped>
.manage {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  margin-bottom: 30px;
  text-align: center;
  color: #2c3e50;
}

.manage-section {
  background: #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #2c3e50;
  color: #2c3e50;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
  color: #2c3e50;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: #f4f4f4;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.settings-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-group {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 6px;
}

.setting-title {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.1em;
}

.horse-points {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.save-settings-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  align-self: flex-start;
  margin-top: 20px;
}

.save-settings-btn:hover {
  background-color: #3aa876;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .setting-title {
    color: #fff;
  }
}

.coming-soon {
  color: #666;
  font-style: italic;
}

/* 响应式设计 */
@media screen and (max-width: 600px) {
  .manage {
    padding: 0 10px;
  }

  .manage-section {
    padding: 15px;
  }

  .submit-btn {
    width: 100%;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .page-title,
  .section-title {
    color: #fff;
  }

  .manage-section {
    background: #2a2a2a;
  }

  .form-group label {
    color: #fff;
  }

  .form-group input {
    background-color: #333;
    border-color: #404040;
    color: #fff;
  }

  .form-group input:focus {
    border-color: #42b983;
  }

  .coming-soon {
    color: #999;
  }

  .section-title {
    border-bottom-color: #404040;
  }
}

.player-form {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.player-title {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 1.1em;
}

.player-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.total-score {
  text-align: right;
  font-size: 1.1em;
  font-weight: bold;
  padding: 10px;
  margin: 10px 0;
  color: #2c3e50;
}

.total-score.invalid {
  color: #ff4444;
}

/* 响应式设计补充 */
@media screen and (max-width: 600px) {
  .player-inputs {
    grid-template-columns: 1fr;
  }
}

/* 暗色主题补充 */
@media (prefers-color-scheme: dark) {
  .player-title {
    color: #fff;
  }

  .player-form {
    background: rgba(255, 255, 255, 0.05);
  }

  .total-score {
    color: #fff;
  }

  .total-score.invalid {
    color: #ff6666;
  }
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .suggestions-list {
    background: #333;
    border-color: #404040;
  }

  .suggestion-item {
    color: #fff;
  }

  .suggestion-item:hover {
    background-color: #404040;
  }
}

/* 添加滚动条样式 */
.suggestions-list::-webkit-scrollbar {
  width: 8px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@media (prefers-color-scheme: dark) {
  .suggestions-list::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  .suggestions-list::-webkit-scrollbar-thumb {
    background: #666;
  }

  .suggestions-list::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
}

.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c82333;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.change-password-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.change-password-btn:hover {
  background-color: #3aa876;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.dialog-content h3 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.confirm-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-btn:hover {
  background-color: #3aa876;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .dialog-content {
    background: #2a2a2a;
  }

  .dialog-content h3 {
    color: #fff;
  }

  .form-group label {
    color: #fff;
  }

  .form-group input {
    background-color: #333;
    border-color: #404040;
    color: #fff;
  }

  .form-group input:focus {
    border-color: #42b983;
  }
}

.reset-btn {
  background-color: #ffc107;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 10px;
}

.reset-btn:hover {
  background-color: #e0a800;
}

.warning-text {
  color: #dc3545;
  margin-bottom: 20px;
  font-weight: bold;
}

.danger-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.danger-btn:hover {
  background-color: #c82333;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .reset-btn {
    background-color: #ffd54f;
  }

  .reset-btn:hover {
    background-color: #ffca28;
  }

  .warning-text {
    color: #ff6b6b;
  }
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #c82333;
}

.modify-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.modify-btn:hover {
  background-color: #3aa876;
}

/* 确保暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .modify-btn {
    background-color: #42b983;
  }

  .modify-btn:hover {
    background-color: #3aa876;
  }
}
</style>
