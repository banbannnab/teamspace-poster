/**
 * 最简测试 Function - 验证 Cloudflare Pages Functions 是否工作
 */

export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    method: 'GET',
    message: 'Function 正常工作',
    timestamp: new Date().toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  return new Response(JSON.stringify({
    status: 'ok',
    method: 'POST',
    receivedBody: body,
    message: 'POST 请求已收到',
    timestamp: new Date().toISOString(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
