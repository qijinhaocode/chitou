import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export interface InterviewMessage {
  role:    "user" | "assistant"
  content: string
}

const SYSTEM = (topic: string, turn: number, total: number, isFinal: boolean) => `\
你是一位来自字节跳动的资深工程师，正在对一位候选人进行技术面试。
面试方向：${topic}

面试规则：
- 每次只问或追问一个问题，语气专业、简洁，有适度压迫感
- 不要对候选人的回答打分，只自然地推进对话
- 根据回答深度决定是否深挖细节
- 不要在每轮开头说"好的"或"谢谢"之类的客套话

当前第 ${turn} / ${total} 轮。${
  isFinal
    ? `\n\n这是最后一轮。请用以下格式给出综合评价：
---
**综合评分：XX / 100**

**亮点：**
- ...

**待改进：**
- ...

**面试结论：** 推荐通过 / 待定 / 不推荐通过

**总结：** （2-3句）`
    : turn === 1
    ? "\n\n请直接开门见山提出第一道技术问题，不要先自我介绍。"
    : ""
}`

export async function POST(req: NextRequest) {
  const { messages, topic, turn, total } = await req.json() as {
    messages: InterviewMessage[]
    topic:    string
    turn:     number
    total:    number
  }

  const isFinal = turn > total
  const encoder  = new TextEncoder()

  if (!process.env.ANTHROPIC_API_KEY) {
    const mock = isFinal
      ? "---\n**综合评分：72 / 100**\n\n**亮点：**\n- 基础概念清晰\n\n**待改进：**\n- 细节深度有待加强\n\n**面试结论：** 待定\n\n**总结：** 候选人掌握基本知识，建议继续深化核心原理。"
      : turn === 1
      ? `好，我们开始。请解释一下${topic}中你认为最重要的一个概念。`
      : "嗯，你刚才提到了关键点。能再深入说说底层实现吗？"

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(mock))
        controller.close()
      },
    })
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
  }

  const anthropicMsgs: Anthropic.MessageParam[] = messages.map(m => ({
    role:    m.role,
    content: m.content,
  }))

  const anthropicStream = client.messages.stream({
    model:     "claude-sonnet-4-6",
    max_tokens: isFinal ? 1024 : 512,
    system:    SYSTEM(topic, turn, total, isFinal),
    messages:  anthropicMsgs,
  })

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
