import { PracticeSession } from "@/components/practice/PracticeSession"
import { newCardDefaults } from "@/lib/algorithms/fsrs"
import type { Card } from "@/types"

// Hardcoded seed cards for Phase 1 MVP — replaced by DB query in Phase 2
const SEED_CARDS: Card[] = [
  {
    id: "seed-1",
    userId: "demo",
    title: "解释 TCP 三次握手",
    question:
      "请详细解释 TCP 建立连接的三次握手过程。为什么需要三次，而不是两次或四次？",
    referenceAnswer: `TCP 三次握手（Three-Way Handshake）是建立可靠连接的过程：

第一次握手：客户端发送 SYN 包（SYN=1, seq=x），进入 SYN_SENT 状态。
第二次握手：服务器回复 SYN+ACK 包（SYN=1, ACK=1, seq=y, ack=x+1），进入 SYN_RCVD 状态。
第三次握手：客户端发送 ACK 包（ACK=1, seq=x+1, ack=y+1），双方进入 ESTABLISHED 状态。

为什么必须三次：
- 两次不够：服务端无法确认客户端能收到自己的报文（无法验证"双向"通信）。
- 同时防止失效的连接请求突然传到服务端（历史 SYN 包问题）。
- 三次是确认双向通信能力的最小次数。`,
    tags: ["TCP", "网络"],
    category: "network",
    difficulty: 2,
    masteryStatus: "pending",
    lastScore: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...newCardDefaults(),
  },
  {
    id: "seed-2",
    userId: "demo",
    title: "数据库索引 B+ 树原理",
    question:
      "为什么 MySQL InnoDB 使用 B+ 树而不是 B 树或哈希表作为默认索引结构？请从数据结构特性和磁盘 I/O 两个角度回答。",
    referenceAnswer: `B+ 树 vs B 树：
- B 树的内部节点也存储数据，导致每个节点能存的键更少，树更高，I/O 更多。
- B+ 树的非叶节点只存 key，叶节点存全部 key+data，且叶节点指针链接，支持高效范围扫描。

B+ 树 vs 哈希表：
- 哈希表 O(1) 等值查找，但不支持范围查询、排序、前缀匹配。
- B+ 树范围查询只需找到起点后沿叶节点链表遍历。

磁盘 I/O 考量：
- 数据库以页（Page, 16KB）为单位读写，B+ 树每个节点对应一页，尽量填满减少 I/O。
- 树高通常 3-4 层，一条查询只需 3-4 次磁盘 I/O。`,
    tags: ["MySQL", "索引", "B+树"],
    category: "database",
    difficulty: 3,
    masteryStatus: "pending",
    lastScore: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...newCardDefaults(),
  },
  {
    id: "seed-3",
    userId: "demo",
    title: "React Fiber 架构",
    question:
      "React 16 引入的 Fiber 架构解决了什么核心问题？Fiber 的可中断渲染原理是什么？",
    referenceAnswer: `核心问题（Stack Reconciler 的痛点）：
旧版 React 使用递归同步协调，一旦开始无法中断，大型更新会阻塞主线程超 16ms，导致界面卡顿。

Fiber 的解法：
1. 将渲染工作拆成小单元（Fiber Node）：每个组件对应一个 Fiber 节点，形成链表而非调用栈。
2. 可中断与恢复：利用调度器（Scheduler）在浏览器空闲时分批执行，主线程有高优先级任务时可暂停。
3. 优先级调度（Lanes）：用户交互 > 数据获取 > 后台预渲染，高优先级打断低优先级。
4. 双缓冲（Double Buffering）：current tree 和 workInProgress tree 交替，提交阶段一次性更新 DOM。`,
    tags: ["React", "Fiber", "并发"],
    category: "language",
    difficulty: 4,
    masteryStatus: "pending",
    lastScore: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...newCardDefaults(),
  },
]

export default function PracticeSessionPage() {
  return (
    <div className="h-full">
      <PracticeSession cards={SEED_CARDS} />
    </div>
  )
}
