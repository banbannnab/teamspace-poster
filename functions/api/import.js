/**
 * Teamspace 海报生成器 — 腾讯文档导入代理（生产版）
 * Cloudflare Pages Functions 格式
 */

// ⚠️ 正式部署请改为从 context.env 读取
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
 * 调用腾讯文档智能表格 API（推荐）
 */
async function callSmartSheetAPI(fileId, sheetId, filterField, filterValue) {
  const base = 'https://docs.qq.com/openapi/smartsheet/v2';

  // 1. 获取字段列表
  const fieldsResp = await fetch(`${base}/files/${fileId}/sheets/${sheetId}/fields:list`, {
    method: 'POST',
    headers: {
      'Client-Id': CLIENT_ID,
      'Open-Id': OPEN_ID,
      'Access-Token': ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const fieldsData = await fieldsResp.json();

  // 2. 获取记录
  const recordsBody = { offset: 0, limit: 100 };
  if (filterField && filterValue) {
    recordsBody.filter = {
      conditions: [{ field_title: filterField, operator: 'equal', value: [filterValue] }],
      condition_type: 'and',
    };
  }

  const recordsResp = await fetch(`${base}/files/${fileId}/sheets/${sheetId}/records:list`, {
    method: 'POST',
    headers: {
      'Client-Id': CLIENT_ID,
      'Open-Id': OPEN_ID,
      'Access-Token': ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recordsBody),
  });
  const recordsData = await recordsResp.json();

  return {
    type: 'smartsheet',
    fields: fieldsData.fields || [],
    records: (recordsData.records || []).map(r => r.values || {}),
    raw: { fieldsData, recordsData },
  };
}

/**
 * 调用腾讯文档普通表格 API
 * 端点格式：POST /openapi/sheet/v1/spreadsheets/{fileId}/sheets/{sheetId}/values
 */
async function callSheetAPI(fileId, sheetId) {
  const url = `https://docs.qq.com/openapi/sheet/v1/spreadsheets/${fileId}/sheets/${sheetId}/values`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Client-Id': CLIENT_ID,
      'Open-Id': OPEN_ID,
      'Access-Token': ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ range: 'A1:Z100' }),
  });

  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return {
    type: 'sheet',
    status: resp.status,
    data,
  };
}

export async function onRequestPost(context) {
  try {
    const { docUrl, filterField, filterValue } = await context.request.json();

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

    // 先尝试智能表格 API
    let result;
    try {
      result = await callSmartSheetAPI(fileId, sheetId, filterField, filterValue);
    } catch (e) {
      // 失败则尝试普通表格 API
      try {
        result = await callSheetAPI(fileId, sheetId);
      } catch (e2) {
        return new Response(JSON.stringify({
          error: '所有 API 调用失败',
          message: e2.message,
          hint: '请检查 API 端点是否正确，或联系开发者',
          debug: {
            fileId,
            sheetId,
            filterField,
            filterValue,
          },
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify(result), {
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

// GET 请求用于健康检查
export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'teamspace-poster-import-proxy',
    version: '1.0.0',
    endpoints: {
      smartSheet: 'POST /api/import (智能表格)',
      sheet: 'POST /api/import (普通表格)',
    },
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
