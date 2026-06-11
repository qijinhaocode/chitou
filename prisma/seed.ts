/**
 * Phase 1 seed: hardcoded card library for initial MVP testing.
 * Run with: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SEED_CARDS = [
  {
    title: '解释 TCP 三次握手',
    question:
      '请详细解释 TCP 建立连接的三次握手过程。为什么需要三次，而不是两次或四次？',
    referenceAnswer: `TCP 三次握手（Three-Way Handshake）是建立可靠连接的过程：

**第一次握手：** 客户端发送 SYN 包（SYN=1, seq=x），进入 SYN_SENT 状态。
**第二次握手：** 服务器回复 SYN+ACK 包（SYN=1, ACK=1, seq=y, ack=x+1），进入 SYN_RCVD 状态。
**第三次握手：** 客户端发送 ACK 包（ACK=1, seq=x+1, ack=y+1），双方进入 ESTABLISHED 状态。

**为什么必须三次：**
- 两次不够：服务端无法确认客户端能收到自己的报文（无法验证"双向"通信）。
- 同时防止失效的连接请求突然传到服务端（历史 SYN 包问题）。
- 三次是确认双向通信能力的最小次数。`,
    tags: ['TCP', '网络', '握手'],
    category: 'network',
    difficulty: 2,
  },
  {
    title: '数据库索引底层原理（B+ 树）',
    question:
      '为什么 MySQL InnoDB 使用 B+ 树而不是 B 树或哈希表作为默认索引结构？请从数据结构特性和磁盘 I/O 两个角度回答。',
    referenceAnswer: `**B+ 树 vs B 树：**
- B 树的内部节点也存储数据，导致每个节点能存的键更少，树更高，I/O 次数更多。
- B+ 树的非叶节点只存 key，叶节点存所有 key+data，且叶节点通过指针链接，支持高效的范围扫描（ORDER BY, BETWEEN）。

**B+ 树 vs 哈希表：**
- 哈希表 O(1) 等值查找，但不支持范围查询、排序、前缀匹配——这些在 SQL 中非常常见。
- B+ 树范围查询只需找到起点后沿链表遍历。

**磁盘 I/O 考量：**
- 数据库以页（Page, 16KB）为单位读写磁盘，B+ 树每个节点对应一页，尽量填满以减少 I/O 次数。
- 树高通常 3-4 层，意味着查询一条记录只需 3-4 次磁盘 I/O。`,
    tags: ['MySQL', '索引', 'B+树', '数据库'],
    category: 'database',
    difficulty: 3,
  },
  {
    title: '解释 React 的 Fiber 架构',
    question:
      'React 16 引入的 Fiber 架构解决了什么核心问题？Fiber 的可中断渲染原理是什么？',
    referenceAnswer: `**核心问题（Stack Reconciler 的痛点）：**
旧版 React 使用递归同步协调（Stack Reconciler），一旦开始就无法中断，大型更新会阻塞主线程超过 16ms，导致界面掉帧卡顿。

**Fiber 的解法：**
1. **将渲染工作拆成小单元（Fiber Node）：** 每个组件对应一个 Fiber 节点，形成链表而非调用栈。
2. **可中断与恢复：** 利用 requestIdleCallback（或自制调度器）在浏览器空闲时分批执行，主线程有更高优先级任务时可以暂停。
3. **优先级调度（Lanes）：** 用户交互（onClick）优先级 > 数据获取 > 后台预渲染，高优先级打断低优先级。
4. **双缓冲（Double Buffering）：** current tree（当前显示）和 workInProgress tree（计算中）交替，提交阶段一次性 DOM 更新。`,
    tags: ['React', 'Fiber', '并发', '前端'],
    category: 'language',
    difficulty: 4,
  },
  {
    title: '设计一个短链接服务（TinyURL）',
    question:
      '系统设计题：请设计一个类似 TinyURL 的短链接系统。要求支持 1亿 DAU，每天新增 1 亿条短链，请给出整体架构设计。',
    referenceAnswer: `**需求澄清：** 读多写少（100:1），7 位短码，链接永久有效。

**短码生成方案：**
- Base62（a-z A-Z 0-9）7 位 = 62^7 ≈ 3.5 万亿，够用。
- 方案一：自增 ID 转 Base62（需分布式 ID 生成器，如 Snowflake）。
- 方案二：MD5 取前 7 位（有冲突，需重试）。

**数据库选型：**
- 写入用 MySQL（短码 PK），读取用 Redis 缓存（短码→长链，TTL 24h），Cache-Aside 策略。

**整体架构：**
用户 → CDN → API Gateway → 读服务（多副本） / 写服务
读服务优先查 Redis，Miss 再查 DB 并回填缓存。
写服务写 DB + 异步删除 Redis（防缓存旧数据）。

**扩展性：**
- DB 按短码哈希分片（避免热点）。
- 读服务无状态，水平扩容。
- 异步统计点击量（Kafka → ClickHouse）。`,
    tags: ['系统设计', '短链', '高并发', 'Redis'],
    category: 'system_design',
    difficulty: 4,
  },
  {
    title: 'Go Channel 底层实现原理',
    question:
      '请解释 Go 语言 Channel 的底层数据结构（hchan）以及阻塞/非阻塞发送时的具体流程。',
    referenceAnswer: `**hchan 结构体核心字段：**
\`\`\`go
type hchan struct {
    qcount   uint           // 当前队列中的数量
    dataqsiz uint           // 环形队列容量（make(chan T, n) 中的 n）
    buf      unsafe.Pointer // 环形缓冲区指针
    sendx    uint           // 发送索引
    recvx    uint           // 接收索引
    recvq    waitq          // 等待接收的 goroutine 队列
    sendq    waitq          // 等待发送的 goroutine 队列
    lock     mutex
}
\`\`\`

**有缓冲 Channel 发送流程（ch <- v）：**
1. 加锁。
2. 若 recvq 有等待的 goroutine，直接将数据拷贝给它，唤醒它（goready），无需走 buf。
3. 若 buf 未满，数据入队，解锁返回。
4. 若 buf 已满，当前 goroutine 封装为 sudog 挂入 sendq，调用 gopark 挂起，释放锁，等待接收方唤醒。

**关键设计：** 直接内存拷贝（避免中间堆分配）；使用 mutex 而非 CAS，保证多核一致性。`,
    tags: ['Go', 'Channel', '并发', '源码'],
    category: 'language',
    difficulty: 5,
  },
  {
    title: '讲讲你最有挑战的一个项目',
    question:
      '行为面试题（STAR 法则）：描述你职业生涯中遇到的最大技术挑战，你是如何解决的？从中学到了什么？',
    referenceAnswer: `**STAR 结构模板：**

**Situation（背景）：** 简洁描述项目背景、规模、你的角色（1-2 句）。

**Task（任务）：** 具体说明你需要解决什么问题，为什么它有挑战性（技术难点、时间压力、不确定性）。

**Action（行动）：** 重点！说明 "我做了什么"（非 "我们"），包括：
- 如何拆解问题
- 尝试了哪些方案，为什么放弃某些方案
- 关键技术决策

**Result（结果）：** 量化结果（"性能提升 60%"、"延迟从 500ms 降至 50ms"），以及对团队/业务的影响。

**加分项：** 说明从这次经历中学到了什么，以及如果重做会做哪些不同的决定——展示成长意识。

⚠️ 常见失误：过于关注团队而不是个人贡献；技术细节不够具体；没有量化结果。`,
    tags: ['行为面试', 'STAR', '软技能'],
    category: 'behavioral',
    difficulty: 2,
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo user (in real app, Clerk creates users)
  const user = await prisma.user.upsert({
    where: { email: 'demo@chitou.app' },
    update: {},
    create: {
      clerkId: 'demo_clerk_id',
      email: 'demo@chitou.app',
      name: '演示用户',
      dailyGoal: 10,
    },
  })

  for (const cardData of SEED_CARDS) {
    await prisma.card.create({
      data: {
        userId: user.id,
        ...cardData,
        category: cardData.category as any,
        due: new Date(),
      },
    })
  }

  console.log(`✅ Seeded ${SEED_CARDS.length} cards for user ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
