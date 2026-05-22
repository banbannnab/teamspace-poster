/**
 * Teamspace 海报生成器 — 腾讯文档导入代理（多端点重试版）
 * Cloudflare Pages Functions 格式
 */

// 从环境变量读取凭证（正式使用时请改为从 context.env 读取）
const CLIENT_ID = '5a300439fb60492b9b94e3f459b3a83b';
const OPEN_ID = '076337b085fc45638f2019040989957a';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHQiOiI1YTMwMDQzOWZiNjA0OTJiOWI5NGUzZjQ1OWIzYTgzYiIsInR5cCI6MSwiZXhwIjoxNzgxODU0OTgzLjM0MTY3MSwiaWF0IjoxNzc5MjYyOTgzLjM0MTY3MSwic3ViIjoiMDc2MzM3YjA4NWZjNDU2MzhmMjAxOTA0MDk4OTk1N2EifQ.7ZJn7FQI0Vl9kbnDEefjDAI3l9aUn-TbOHpybSVMuxc';

/**
 * 从腾讯文档 URL 提取 fileId 和 sheetId
 */
function parseDocUrl(url) {
  const fileMatch = url.match(/docs\.qq\.com\/(?:sheet|smartsheet)\/([A-Za-z0-9_-]+)/);
  const sheetMatch = url.match(/[?&]tab=([A-Za-z0-9_-]+)/);
  return {
    fileId: fileMatch ? fileMatch[1] : null,
    sheetId: sheetMatch ? sheetMatch[1] : null,
  };
}

/**
 * 尝试多个 API 端点，返回第一个成功的响应
 */
async function tryMultipleEndpoints(fileId, sheetId, filterField, filterValue) {
  // 定义多个可能的 API 端点
  const endpoints = [
    // 端点 1: 智能表格 API（推荐）
    {
      name: 'Smartsheet API v2 (list records)',
      url: `https://docs.qq.com/openapi/smartsheet/v2/files/${fileId}/sheets/${sheetId}/records:list`,
      method: 'POST',
      body: JSON.stringify({
        offset: 0,
        limit: 100,
        ...(filterField && filterValue ? {
          filter: {
            conditions: [{
              field_title: filterField,
              operator: 'equal',
              value: [filterValue],
            }],
            condition_type: 'and',
          }
        } : {}),
      }),
    },
    // 端点 2: 智能表格 API（获取字段）
    {
      name: 'Smartsheet API v2 (list fields)',
      url: `https://docs.qq.com/openapi/smartsheet/v2/files/${fileId}/sheets/${sheetId}/fields:list`,
      method: 'POST',
      body: JSON.stringify({}),
    },
    // 端点 3: 普通表格 API（尝试 v1）
    {
      name: 'Sheet API v1 (values)',
      url: `https://docs.qq.com/openapi/sheet/v1/spreadsheets/${fileId}/sheets/${sheetId}/values`,
      method: 'POST',
      body: JSON.stringify({ range: 'A1:Z100' }),
    },
    // 端点 4: 普通表格 API（尝试 v2）
    {
      name: 'Sheet API v2 (values)',
      url: `https://docs.qq.com/openapi/sheet/v2/spreadsheets/${fileId}/sheets/${sheetId}/values:batchGet`,
      method: 'POST',
      body: JSON.stringify({ ranges: [`${sheetId}!A1:Z100`] }),
    },
  ];

  const headers = {
    'Client-Id': CLIENT_ID,
    'Open-Id': OPEN_ID,
    'Access-Token': ACCESS_TOKEN,
    'Content-Type': 'application/json',
  };

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint.url, {
        method: endpoint.method,
        headers,
        body: endpoint.body,
      });
      const text = await resp.text();
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        status: resp.status,
        statusText: resp.statusText,
        bodyPreview: text.substring(0, 500),
        success: resp.status >= 200 && resp.status < 300,
      });

      // 如果成功，返回结果
      if (resp.status >= 200 && resp.status < 300) {
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
        return {
          success: true,
          endpoint: endpoint.name,
          url: endpoint.url,
          data,
          allResults: results,
        };
      }
    } catch (e) {
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        error: e.message,
        success: false,
      });
    }
  }

  // 所有端点都失败
  return {
    success: false,
    message: '所有 API 端点均失败',
    allResults: results,
  };
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { docUrl, filterField, filterValue } = body;

    if (!docUrl) {
      return new Response(JSON.stringify({ error: '缺少 docUrl 参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { fileId, sheetId } = parseDocUrl(docUrl);
    if (!fileId || !sheetId) {
      return new Response(JSON.stringify({ error: '无法解析文档链接，请检查 URL 格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 尝试多个 API 端点
    const result = await tryMultipleEndpoints(fileId, sheetId, filterField, filterValue);

    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: '服务器内部错误',
      message: err.message,
      stack: err.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
