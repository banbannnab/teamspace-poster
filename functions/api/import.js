/**
 * 腾讯文档 Sheet 数据导入代理 - v3
 * 使用 Authorization Bearer Token 鉴权
 */
export async function onRequestPost(context) {
  const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHQiOiI1YTMwMDQzOWZiNjA0OTJiOWI5NGUzZjQ1OWIzYTgzYiIsInR5cCI6MSwiZXhwIjoxNzgxODU0OTgzLjM0MTY3MSwiaWF0IjoxNzc5MjYyOTgzLjM0MTY3MSwic3ViIjoiMDc2MzM3YjA4NWZjNDU2MzhmMjAxOTA0MDk4OTk1N2EifQ.7ZJn7FQI0Vl9kbnDEefjDAI3l9aUn-TbOHpybSVMuxc";

  try {
    const body = await context.request.json();
    const { docUrl } = body;

    const urlObj = new URL(docUrl);
    const fileId = urlObj.pathname.split('/').pop();
    const sheetId = urlObj.searchParams.get('tab') || '';

    // 尝试多个 API 端点格式
    const endpoints = [
      {
        name: 'WeCom格式 + Bearer鉴权',
        url: `https://docs.qq.com/openapi/sheet/v1/spreadsheets/${fileId}/values`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({ sheet_id: sheetId, range: "A1:Z500" })
      },
      {
        name: 'docs.qq.com MCP格式',
        url: `https://docs.qq.com/openapi/mcp`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'sheet.values.get',
            arguments: { file_id: fileId, sheet_id: sheetId, range: "A1:Z500" }
          }
        })
      },
      {
        name: '智能表格 API',
        url: `https://docs.qq.com/openapi/smartsheet/v2/files/${fileId}/sheets/${sheetId}/records:list`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        },
        body: '{}'
      }
    ];

    let lastError = null;
    for (const ep of endpoints) {
      try {
        const response = await fetch(ep.url, {
          method: ep.method,
          headers: ep.headers,
          body: ep.body
        });
        const text = await response.text();
        if (response.ok) {
          return new Response(JSON.stringify({
            success: true,
            endpoint: ep.name,
            url: ep.url,
            data: JSON.parse(text)
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        lastError = `HTTP ${response.status}: ${text.substring(0, 200)}`;
      } catch (e) {
        lastError = e.message;
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: '所有 API 端点均失败',
      details: lastError,
      tried: endpoints.map(e => ({ name: e.name, url: e.url }))
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
