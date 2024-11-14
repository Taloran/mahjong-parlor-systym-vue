<script setup>
import { ref, onMounted } from "vue";
import { getApiUrl, API_ROUTES } from "../config";

const tableData = ref([]);
const sortOrder = ref("desc");

// 获取并排序数据
const fetchAndSortData = async () => {
  try {
    const response = await fetch(getApiUrl(API_ROUTES.GET_ALL));
    const data = await response.json();
    // 对数据进行排序
    tableData.value = data.sort((a, b) => {
      return sortOrder.value === "desc" ? b.score - a.score : a.score - b.score;
    });
  } catch (error) {
    console.error("获取数据失败:", error);
  }
};

// 切换排序方向
const toggleSort = () => {
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
  // 重新排序当前数据
  tableData.value = tableData.value.sort((a, b) => {
    return sortOrder.value === "desc" ? b.score - a.score : a.score - b.score;
  });
};

onMounted(fetchAndSortData);
</script>

<template>
  <div class="home">
    <h2 class="page-title">成绩排行榜</h2>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th @click="toggleSort" class="sortable">
              分数
              <span class="sort-icon">
                {{ sortOrder === "desc" ? "↓" : "↑" }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in tableData" :key="item._id">
            <td>{{ item.name }}</td>
            <td>{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.page-title {
  margin-bottom: 20px;
  text-align: center;
  color: #2c3e50;
}

.table-container {
  max-width: 800px;
  margin: 0 auto;
  overflow-x: auto;
  background: #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 300px;
}

.data-table th,
.data-table td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: left;
}

.data-table th {
  background-color: #d4d4d4;
  font-weight: bold;
}

.data-table tr {
  background-color: #e8e8e8;
}

.data-table tr:nth-child(even) {
  background-color: #f4f4f4;
}

.data-table tr:hover {
  background-color: #dadada;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-icon {
  margin-left: 5px;
  display: inline-block;
}

.sortable:hover {
  background-color: #e8e8e8;
}

/* 响应式设计 */
@media screen and (max-width: 600px) {
  .table-container {
    margin: 0 10px;
    border-radius: 4px;
  }

  .data-table th,
  .data-table td {
    padding: 8px;
    font-size: 14px;
  }

  .page-title {
    font-size: 1.5rem;
    margin: 10px 0;
  }
}

/* 暗色主题支持 */
@media (prefers-color-scheme: dark) {
  .page-title {
    color: #fff;
  }

  .table-container {
    background: #2a2a2a;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  .data-table th {
    background-color: #333333;
    color: #fff;
  }

  .data-table td {
    color: #fff;
  }

  .data-table tr {
    background-color: #2a2a2a;
  }

  .data-table tr:nth-child(even) {
    background-color: #333333;
  }

  .data-table tr:hover {
    background-color: #3a3a3a;
  }

  .data-table th,
  .data-table td {
    border-color: #404040;
  }

  .sortable:hover {
    background-color: #404040;
  }
}
</style>
