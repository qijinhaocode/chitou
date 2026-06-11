import type { CardCategory } from "@/types"

export interface CardTemplate {
  title:           string
  question:        string
  referenceAnswer: string
  category:        CardCategory
  difficulty:      1 | 2 | 3 | 4 | 5
  tags:            string[]
}

export interface CardPack {
  id:          string
  name:        string
  description: string
  emoji:       string
  cards:       CardTemplate[]
}

export const CARD_PACKS: CardPack[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    id:          "algo-top",
    name:        "字节/阿里高频算法",
    description: "大厂面试必考的 10 道经典算法题，覆盖复杂度分析与核心思路",
    emoji:       "⚡",
    cards: [
      {
        title: "二分查找的三种模板",
        question: "请写出二分查找的标准实现，并说明 `while(left < right)` 与 `while(left <= right)` 两种写法的区别及各自适用场景。",
        referenceAnswer: `## 两种写法对比

**while(left <= right)（闭区间）**
适用于在数组中查找**精确目标值**：
\`\`\`python
def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: left = mid + 1
        else: right = mid - 1
    return -1
\`\`\`

**while(left < right)（左闭右开）**
适用于查找**左/右边界**：退出时 left == right 即为答案，无需额外处理。

**核心技巧：**
- 用 \`left + (right - left) // 2\` 防止溢出
- 时间复杂度 O(log n)，空间 O(1)`,
        category:   "algorithm",
        difficulty: 2,
        tags:       ["二分查找", "算法", "模板"],
      },
      {
        title: "快速排序的实现与分析",
        question: "实现快速排序，分析其平均 / 最坏时间复杂度，并说明如何通过随机化 pivot 避免退化。",
        referenceAnswer: `## 快速排序

\`\`\`python
import random

def quicksort(arr, left, right):
    if left >= right: return
    pivot_idx = random.randint(left, right)  # 随机化 pivot
    arr[pivot_idx], arr[right] = arr[right], arr[pivot_idx]
    pivot = arr[right]
    i = left - 1
    for j in range(left, right):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[right] = arr[right], arr[i+1]
    p = i + 1
    quicksort(arr, left, p - 1)
    quicksort(arr, p + 1, right)
\`\`\`

**复杂度分析：**
| 情况 | 时间 | 空间 |
|------|------|------|
| 平均 | O(n log n) | O(log n) |
| 最坏（已排序数组 + 固定 pivot）| O(n²) | O(n) |

**随机化 pivot**：将最坏情况概率降至接近 0，期望复杂度始终 O(n log n)。`,
        category:   "algorithm",
        difficulty: 3,
        tags:       ["排序", "快排", "分治"],
      },
      {
        title: "动态规划：最长公共子序列（LCS）",
        question: "给定两个字符串，求最长公共子序列的长度。写出状态转移方程和代码实现。",
        referenceAnswer: `## LCS 动态规划

**状态定义：** \`dp[i][j]\` = s1 前 i 个字符与 s2 前 j 个字符的 LCS 长度。

**转移方程：**
\`\`\`
if s1[i-1] == s2[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
\`\`\`

**代码：**
\`\`\`python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
\`\`\`

**时间/空间：** O(mn) / O(mn)，可用滚动数组优化至 O(n) 空间。`,
        category:   "algorithm",
        difficulty: 3,
        tags:       ["动态规划", "字符串", "LCS"],
      },
      {
        title: "BFS 与 DFS 的适用场景对比",
        question: "BFS 和 DFS 各自适合解决什么类型的问题？在图的最短路径问题中为什么优先选 BFS？",
        referenceAnswer: `## BFS vs DFS

| 特性 | BFS | DFS |
|------|-----|-----|
| 数据结构 | 队列 | 栈（或递归） |
| 空间复杂度 | O(宽度) | O(深度) |
| 找最短路径 | ✅ 有保证 | ❌ 无法保证 |
| 适合问题 | 最短路、层序遍历 | 拓扑排序、连通分量、回溯 |

**BFS 找最短路径的原因：**
BFS 按层扩展，第一次到达某节点时走的路径一定是**边数最少**的路径（无权图）。DFS 可能先找到较长路径，必须穷举才能确认最短。

**经典应用：**
- BFS：迷宫最短路、单词接龙、腐烂的橘子
- DFS：全排列、子集、岛屿数量`,
        category:   "algorithm",
        difficulty: 2,
        tags:       ["图算法", "BFS", "DFS"],
      },
      {
        title: "堆（优先队列）的核心操作",
        question: "解释最小堆的插入和删除操作原理，并说明 Top-K 问题为何用大小为 K 的最小堆而非最大堆。",
        referenceAnswer: `## 堆操作原理

**最小堆性质：** 父节点 ≤ 子节点，根节点为最小值。

**插入（上浮）：**
1. 将新元素放到末尾
2. 与父节点比较，若更小则交换（sift up）
3. 重复直到满足堆性质，O(log n)

**删除最小值（下沉）：**
1. 将根节点与末尾元素交换，删除末尾
2. 根节点与较小子节点比较，若更大则交换（sift down）
3. O(log n)

**Top-K 最大值为何用最小堆：**
维护一个大小为 K 的最小堆：
- 堆顶是当前 K 个最大值中最小的
- 新元素 > 堆顶 → 替换堆顶，维护堆
- 最终堆中 K 个元素即为 Top-K 最大值
- 时间 O(n log k)，优于排序的 O(n log n)`,
        category:   "algorithm",
        difficulty: 3,
        tags:       ["堆", "优先队列", "Top-K"],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id:          "system-design",
    name:        "系统设计经典场景",
    description: "覆盖分布式、缓存、消息队列等高频系统设计题核心思路",
    emoji:       "🏗️",
    cards: [
      {
        title: "如何设计一个消息队列",
        question: "请设计一个支持百万级 TPS 的消息队列系统，需要说明存储模型、消息持久化、消费者组和 At-Least-Once 语义。",
        referenceAnswer: `## 消息队列设计要点

**存储模型：** 采用 Append-Only Log（类 Kafka）
- 消息按 Topic 分 Partition，每个 Partition 是一个有序日志文件
- 生产者顺序写（高 I/O 效率），消费者按 Offset 读

**持久化：** 写 WAL（预写日志）+ Page Cache → 磁盘刷盘，可配置 sync 策略平衡性能与可靠性

**消费者组：** 同一组内每个 Partition 只被一个消费者消费，实现负载均衡；不同组各自维护独立 Offset

**At-Least-Once：**
- 消费者处理完消息后手动 commit Offset
- 若处理中崩溃，重启后从上次 Offset 重新消费
- 业务层需做幂等处理（消息去重）

**高可用：** 每个 Partition 有多个副本，Leader 处理读写，Follower 同步；ISR 机制保证可靠复制`,
        category:   "system_design",
        difficulty: 4,
        tags:       ["消息队列", "Kafka", "分布式"],
      },
      {
        title: "缓存雪崩、穿透、击穿的区别与解决方案",
        question: "分别解释缓存雪崩、缓存穿透、缓存击穿的定义，并给出每种场景的解决方案。",
        referenceAnswer: `## 三种缓存问题

**缓存雪崩（大批量 key 同时失效）**
- 原因：大量缓存 key 设置了相同的过期时间，集中失效
- 解决：过期时间加随机偏移量；熔断降级；多级缓存（本地 + Redis）

**缓存穿透（查询不存在的数据）**
- 原因：恶意请求或 bug 导致大量查询 DB 中不存在的数据，缓存无效
- 解决：布隆过滤器（Bloom Filter）快速判断 key 是否存在；对空结果也缓存（TTL 较短）

**缓存击穿（热点 key 过期瞬间）**
- 原因：高并发下单个热点 key 恰好过期，大量请求穿透到 DB
- 解决：
  - 热点 key 设置永不过期（逻辑过期 + 异步更新）
  - 互斥锁（Mutex）：只允许一个线程重建缓存，其余等待

**记忆口诀：** 雪崩→散时间，穿透→布隆/空值缓存，击穿→互斥/永不过期`,
        category:   "system_design",
        difficulty: 3,
        tags:       ["缓存", "Redis", "高可用"],
      },
      {
        title: "分布式 ID 生成方案对比",
        question: "列举至少三种分布式 ID 生成方案，对比其优缺点，并说明 Snowflake 算法的位结构。",
        referenceAnswer: `## 分布式 ID 方案

| 方案 | 优点 | 缺点 |
|------|------|------|
| UUID | 无中心化，简单 | 无序，存储大，索引性能差 |
| 数据库自增（号段模式）| 趋势递增 | 依赖 DB，性能有上限 |
| Redis INCR | 高性能 | 需持久化，强依赖 Redis |
| **Snowflake** | 趋势有序、高性能、无中心 | 依赖机器时钟，时钟回拨问题 |
| ULIDv2 | 字符串友好，趋势有序 | 时间精度较低 |

**Snowflake 64 位结构：**
\`\`\`
1位(符号) | 41位(毫秒时间戳) | 10位(机器ID) | 12位(序列号)
\`\`\`
- 41位时间戳：可用约 69 年
- 10位机器 ID：支持 1024 个节点
- 12位序列号：同毫秒内 4096 个 ID

**时钟回拨解决：** 等待 / 启动时检测 / 使用逻辑时钟`,
        category:   "system_design",
        difficulty: 3,
        tags:       ["分布式", "ID生成", "Snowflake"],
      },
      {
        title: "CAP 定理与 BASE 理论",
        question: "解释 CAP 定理的三个要素，为什么分布式系统不能同时满足三者？BASE 理论是如何作为替代方案的？",
        referenceAnswer: `## CAP 定理

**三要素：**
- **C（一致性）：** 所有节点在同一时刻看到相同数据
- **A（可用性）：** 每个请求都能得到响应（不保证最新数据）
- **P（分区容忍性）：** 网络分区时系统继续运行

**为何不可兼得：** 网络分区（P）在分布式系统中不可避免。分区时若继续提供服务（A），则两个节点数据可能不一致（违反 C）；若保证一致性（C），必须拒绝部分请求（违反 A）。因此只能选 **CP 或 AP**。

**实际选择：**
- CP：ZooKeeper、HBase（强一致，分区时拒绝写入）
- AP：Cassandra、DynamoDB（高可用，最终一致）

## BASE 理论（AP 系统的补充）
- **Basically Available：** 基本可用（允许响应降级）
- **Soft State：** 允许中间状态存在
- **Eventually Consistent：** 最终一致性（而非强一致）`,
        category:   "system_design",
        difficulty: 3,
        tags:       ["分布式", "CAP", "BASE"],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id:          "frontend-core",
    name:        "前端核心原理",
    description: "JavaScript 引擎、浏览器渲染、React 原理等前端深度题",
    emoji:       "⚛️",
    cards: [
      {
        title: "JavaScript 事件循环（Event Loop）",
        question: "请详细解释 JavaScript 的事件循环机制，宏任务和微任务的执行顺序，以及 Promise 和 setTimeout 哪个先执行。",
        referenceAnswer: `## Event Loop 机制

**单线程 + 异步的实现原理：**
JS 引擎主线程执行同步代码，遇到异步任务（I/O、定时器、Promise）交给 Web APIs 处理。

**任务队列分类：**
- **宏任务（Macrotask）：** setTimeout、setInterval、I/O、script 整体
- **微任务（Microtask）：** Promise.then、queueMicrotask、MutationObserver

**执行顺序：**
1. 执行当前宏任务（同步代码）
2. **清空微任务队列**（全部执行完）
3. 渲染（浏览器）
4. 执行下一个宏任务

**经典题：**
\`\`\`js
console.log('1');                          // 同步 → 1
setTimeout(() => console.log('2'), 0);    // 宏任务
Promise.resolve().then(() => console.log('3')); // 微任务
console.log('4');                          // 同步 → 4
// 输出顺序：1 → 4 → 3 → 2
\`\`\`
**Promise.then 先于 setTimeout**，因为微任务在当前宏任务结束后立即执行。`,
        category:   "language",
        difficulty: 3,
        tags:       ["JavaScript", "Event Loop", "异步"],
      },
      {
        title: "浏览器渲染流水线",
        question: "从输入 URL 到页面渲染完成，描述浏览器的关键渲染路径（Critical Rendering Path），重排和重绘如何触发和优化？",
        referenceAnswer: `## 关键渲染路径

**完整流程：**
1. **解析 HTML** → 构建 DOM 树
2. **解析 CSS** → 构建 CSSOM 树
3. **合并** → 渲染树（Render Tree，只含可见节点）
4. **Layout（重排）：** 计算每个元素的几何信息（位置/大小）
5. **Paint（重绘）：** 将节点转换为屏幕像素
6. **Composite：** 将多个图层合并输出到屏幕

**重排（Reflow）触发条件（代价最高）：**
- 修改几何属性：width、height、margin、padding、top、left
- DOM 增删、窗口 resize
- 读取 offsetWidth 等布局属性（强制同步布局）

**重绘（Repaint）触发：**
- 修改非几何样式：color、background、visibility

**优化手段：**
- 批量 DOM 操作（DocumentFragment、虚拟 DOM）
- 用 \`transform\` 和 \`opacity\` 实现动画（走合成层，不触发重排）
- 避免在循环中读取布局属性`,
        category:   "language",
        difficulty: 3,
        tags:       ["浏览器", "渲染", "性能优化"],
      },
      {
        title: "闭包的原理与内存泄漏",
        question: "解释 JavaScript 闭包的形成原理、常见用途，以及什么情况下会导致内存泄漏？",
        referenceAnswer: `## 闭包原理

**定义：** 函数能访问其定义时所在作用域的变量，即使该函数在作用域外执行。

**形成原因：** JS 采用词法作用域（Lexical Scope）+ 作用域链。内层函数持有外层函数作用域的引用，外层函数执行完毕后作用域不会被 GC 回收。

\`\`\`js
function counter() {
  let count = 0;
  return () => ++count;  // 闭包：持有 count 的引用
}
const inc = counter();
inc(); // 1
inc(); // 2  count 不会被回收
\`\`\`

**常见用途：**
- 数据私有化（模块模式）
- 函数柯里化
- 防抖/节流

**内存泄漏场景：**
1. 事件监听器持有 DOM 引用，DOM 被删除但监听器未移除
2. 定时器回调持有大对象引用，定时器未清除
3. 全局变量意外持有闭包（意外的 var 声明）

**解决：** 及时 removeEventListener、clearInterval/clearTimeout、弱引用 WeakMap`,
        category:   "language",
        difficulty: 2,
        tags:       ["JavaScript", "闭包", "内存"],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    id:          "database-storage",
    name:        "数据库与存储",
    description: "MySQL 事务、Redis 数据结构、索引优化等数据库高频考题",
    emoji:       "🗄️",
    cards: [
      {
        title: "MySQL 事务的四个隔离级别",
        question: "解释 MySQL 四个事务隔离级别，每个级别能解决哪些并发问题（脏读、不可重复读、幻读）？InnoDB 默认是哪个级别？",
        referenceAnswer: `## 四个隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|---------|------|-----------|------|
| READ UNCOMMITTED | ❌ | ❌ | ❌ |
| READ COMMITTED | ✅ | ❌ | ❌ |
| **REPEATABLE READ（默认）** | ✅ | ✅ | ⚠️（部分解决）|
| SERIALIZABLE | ✅ | ✅ | ✅ |

**三种并发问题定义：**
- **脏读：** 读到其他事务未提交的数据
- **不可重复读：** 同一事务两次读取同一行，结果不同（行被修改/删除）
- **幻读：** 同一事务两次范围查询，结果集行数不同（其他事务插入了新行）

**InnoDB 的特殊处理：**
默认 REPEATABLE READ，通过 **MVCC（多版本并发控制）** 避免脏读和不可重复读，通过 **间隙锁（Gap Lock）** 部分解决幻读。

**MVCC 原理：** 每行数据保存创建版本号和删除版本号，事务只读取创建版本 ≤ 当前事务版本的数据。`,
        category:   "database",
        difficulty: 3,
        tags:       ["MySQL", "事务", "MVCC", "隔离级别"],
      },
      {
        title: "Redis 五种数据结构及使用场景",
        question: "Redis 五种核心数据结构是什么？各自底层实现和最适合的业务场景是什么？",
        referenceAnswer: `## Redis 五种数据结构

| 类型 | 底层实现 | 典型场景 |
|------|---------|---------|
| **String** | SDS（动态字符串）| 缓存、计数器、分布式锁（SETNX）|
| **Hash** | ziplist / hashtable | 用户信息、对象属性存储 |
| **List** | quicklist（双向链表+压缩列表）| 消息队列、最新消息列表 |
| **Set** | hashtable / intset | 标签、去重、共同好友（交集）|
| **ZSet（有序集合）** | ziplist / skiplist+hashtable | 排行榜、带优先级队列 |

**补充（Redis 4.0+）：**
- **Stream：** 持久化消息流，类 Kafka 轻量版
- **HyperLogLog：** 基数统计（UV 统计），误差 0.81%，内存 12KB

**底层选择策略（以 ZSet 为例）：**
- 元素数量 < 128 且每个元素 < 64 字节 → ziplist（内存紧凑）
- 否则 → skiplist（跳表，O(log n) 查找）`,
        category:   "database",
        difficulty: 2,
        tags:       ["Redis", "数据结构", "缓存"],
      },
      {
        title: "MySQL 慢查询排查思路",
        question: "生产环境发现一条 SQL 执行时间从 10ms 变成了 10s，请给出完整的排查和优化思路。",
        referenceAnswer: `## 慢查询排查步骤

**1. 开启慢查询日志**
\`\`\`sql
SHOW VARIABLES LIKE 'slow_query_log%';
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过 1s 记录
\`\`\`

**2. EXPLAIN 分析执行计划**
重点关注：
- \`type\`：ALL（全表扫描）→ 需要加索引
- \`key\`：实际使用的索引，NULL 说明没走索引
- \`rows\`：预估扫描行数，越小越好
- \`Extra\`：Using filesort / Using temporary → 需要优化

**3. 常见原因及解决方案**
| 原因 | 解决 |
|------|------|
| 无索引 / 索引失效 | 加索引，避免函数包裹索引列 |
| 回表（二级索引 + 非覆盖）| 覆盖索引，SELECT 只取索引列 |
| 数据量暴增 | 分页优化（\`WHERE id > last_id\`），分库分表 |
| 锁等待 | \`SHOW PROCESSLIST\` 查找锁，优化事务 |
| 统计信息不准 | \`ANALYZE TABLE\` 更新统计`,
        category:   "database",
        difficulty: 4,
        tags:       ["MySQL", "性能优化", "索引", "EXPLAIN"],
      },
    ],
  },
]
