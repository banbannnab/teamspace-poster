/**
 * 腾讯文档 Sheet 数据导入代理
 * 正确鉴权格式：Authorization Bearer Token
 */
export async function onRequestPost(context) {
  const CREDENTIALS = {
    clientId: "5a300439fb60492b9b94e3f459b3a83b",
    openId: "076337b085fc45638f2019040989957a",
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHQiOiI1YTMwMDQzOWZiNjA0OTJiOWI5NGUzZjQ1OWIzYTgzYiIsInR5cCI6MSwiZXhwIjoxNzgxODU0OTgzLjM0MTY3MSwiaWF0IjoxNzc5MjYyOTgzLjM0MTY3MSwic3ViIjoiMDc2MzM3YjA4NWZjNDU2MzhmMjAxOTA0MDk4OTk1N2EifQ.7ZJn7FQI0Vl9kbnDEefjDAI3l9aUn-TbOHpybSVMuxc"
  };

  try {
    const body = await context.request.json();
    const { docUrl, filterField, filterValue } = body;

    // 从 URL 提取 fileId 和 sheetId
    // URL 格式: https://docs.qq.com/sheet/DS3JVU1JWT1BVcVFL?tab=BB08J2
    const urlObj = new URL(docUrl);
    const fileId = urlObj.pathname.split('/').pop();
    const sheetId = urlObj.searchParams.get('tab') || '';

    // 尝试多个 API 端点
    const endpoints = [
      // 格式 1: /openapi/sheet/v1/...
      {
        url: `https://docs.qq.com/openapi/sheet/v1/spreadsheets/${fileId}/values`,
        body: JSON.stringify({ sheet_id: sheetId, range: "A1:Z500" })
      },
      // 格式 2: /openapi/v1/sheet/...
      {
        url: `https://docs.qq.com/openapi/v1/sheet/spreadsheets/${fileId}/values`,
        body: JSON.stringify({ sheet_id: sheetId, range: "A1:Z500" })
      },
      // 格式 3: 智能表格 API
      {
        url: `https://docs.qq.com/openapi/smartsheet/v2/files/${fileId}/sheets/${sheetId}/records:list`,
        body: JSON.stringify({})
      }
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Id': CREDENTIALS.clientId,
            'Open-Id': CREDENTIALS.openId,
            'Access-Token': CREDENTIALS.accessToken,
          },
          body: endpoint.body
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({
            success: true,
            endpoint: endpoint.url,
            data: data
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        lastError = await response.text();
      } catch (e) {
        lastError = e.message;
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: '所有 API 端点均失败',
      lastError,
      endpoints: endpoints.map(e => e.url)
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

export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    message: 'POST /api/import 导入腾讯文档数据',
    usage: {
      method: 'POST',
      body: {
        docUrl: 'https://docs.qq.com/sheet/DS3JVU1JWT1BVcVFL?tab=BB08J2',
        filterField: '当月是否已上新',
        filterValue: '已上新'
      }
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
