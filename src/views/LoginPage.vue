<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const password = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");
const isInitialSetup = ref(false);

// 检查是否需要初始化密码
onMounted(async () => {
  try {
    const response = await fetch("http://localhost:3000/api/check-init");
    const data = await response.json();
    isInitialSetup.value = data.needInit;
  } catch (error) {
    console.error("检查初始化状态失败:", error);
  }
});

const initializePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "两次输入的密码不一致";
    return;
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = "密码长度至少为6位";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/init-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword.value }),
    });

    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem("auth_token", token);
      router.push("/manage");
    } else {
      errorMessage.value = "初始化密码失败";
    }
  } catch (error) {
    console.error("初始化失败:", error);
    errorMessage.value = "初始化失败，请稍后重试";
  }
};

const login = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: password.value }),
    });

    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem("auth_token", token);
      router.push("/manage");
    } else {
      errorMessage.value = "密码错误";
    }
  } catch (error) {
    console.error("登录失败:", error);
    errorMessage.value = "登录失败，请稍后重试";
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>{{ isInitialSetup ? "初始化管理密码" : "管理员登录" }}</h2>
      <div class="login-form">
        <!-- 初始化密码表单 -->
        <template v-if="isInitialSetup">
          <div class="form-group">
            <label for="newPassword">设置密码</label>
            <input
              type="password"
              id="newPassword"
              v-model="newPassword"
              @keyup.enter="initializePassword"
              placeholder="请输入新密码"
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              @keyup.enter="initializePassword"
              placeholder="请再次输入密码"
            />
          </div>
          <div class="password-requirements">密码长度至少为6位</div>
        </template>

        <!-- 登录表单 -->
        <template v-else>
          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="password"
              @keyup.enter="login"
              placeholder="请输入管理员密码"
            />
          </div>
        </template>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button
          class="login-btn"
          @click="isInitialSetup ? initializePassword() : login()"
        >
          {{ isInitialSetup ? "初始化" : "登录" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-box {
  background: #e8e8e8;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #2c3e50;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.login-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #3aa876;
}

.error-message {
  color: #ff4444;
  text-align: center;
  font-size: 0.9rem;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .login-box {
    background: #2a2a2a;
  }

  .login-box h2,
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

.password-requirements {
  font-size: 0.9rem;
  color: #666;
  margin-top: -0.5rem;
}

@media (prefers-color-scheme: dark) {
  .password-requirements {
    color: #999;
  }
}
</style>
