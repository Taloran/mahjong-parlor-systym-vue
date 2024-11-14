<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/" class="nav-logo">麻将分数管理系统</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/manage" class="nav-item">管理</router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <footer class="main-footer">
      <p>&copy; 2024 麻将分数管理系统</p>
    </footer>
  </div>
</template>

<script setup>
// 使用 setup 语法糖
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background-color: #2c3e50;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.nav-logo {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: #34495e;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background-color: #f0f2f5;
}

.main-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* 全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  background-color: #f0f2f5;
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .main-nav,
  .main-footer {
    background-color: #1a2634;
  }

  .nav-item:hover {
    background-color: #2c3e50;
  }

  body {
    background-color: #1a1a1a;
  }

  .main-content {
    background-color: #1a1a1a;
  }
}
</style>
