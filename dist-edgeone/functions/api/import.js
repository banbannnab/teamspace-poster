/**
 * Teamspace 海报生成器 — 腾讯文档导入代理
 * Cloudflare Pages Functions 格式
 * 
 * 功能：代理前端请求到腾讯文档 Open API，避免 CORS + 保护 Access-Token
 * 
 * 使用方法：
 *   POST /api/import
 *   Body: { "docUrl": "https://docs.qq.com/sheet/DS3JVU1JWT1BVcVFL?tab=BB08J2" }
 */

// 从环境变量读取凭证（在 Cloudflare Pages 后台设置）
const CLIENT_ID = '5a300439fb60492b9b94e3f459b3a83b';
const OPEN_ID    = '076337b085fc45638f2019040989957a';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbHQiOiI1YTMwMDQzOWZiNjA0OTJiOWI5NGUzZjQ1OWIzYTgzYiIsInR5cCI6MSwiZXhwIjoxNzgxODU0OTgzLjM0MTY3MSwiaWF0IjoxNzc5MjYyOTgzLjM0MTY3MSwic3ViIjoiMDc2MzM3YjA4NWZjNDU2MzhmMjAxOTA0MDk4OTk1N2EifQ.7ZJn7FQI0Vl9kbnDEefjDAI3l9aUn-TbOHpybSVMuxc';

// ⚠️ 安全提醒：上面硬编码了 Token，仅用于测试。
// 正式使用时请改为从 request.context.env 读取环境变量。

/**
 * 从腾讯文档 URL 提取 fileId 和 sheetId
 * 示例：https://docs.qq.com/sheet/DS3JVU1JWT1BVcVFL?tab=BB08J2
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
 * 调用腾讯文档 Open API（智能表格 / Smartsheet）
 */
async function callSmartsheetAPI(fileId, sheetId, filterField, filterValue) {
  const baseUrl = 'https://docs.qq.com/openapi/smartsheet/v2';
  
  // 1. 先获取字段列表（用于构建筛选条件）
  const fieldsUrl = `${baseUrl}/files/${fileId}/sheets/${sheetId}/fields:list`;
  const fieldsResp = await fetch(fieldsUrl, {
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
  
  // 2. 获取记录（支持筛选）
  const recordsUrl = `${baseUrl}/files/${fileId}/sheets/${sheetId}/records:list`;
  const recordsBody = {
    offset: 0,
    limit: 100,
  };
  
  // 如果指定了筛选条件，添加到 body
  if (filterField && filterValue) {
    recordsBody.filter = {
      conditions: [{
        field_title: filterField,
        operator: 'equal',
        value: [filterValue],
      }],
      condition_type: 'and',
    };
  }
  
  const recordsResp = await fetch(recordsUrl, {
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
    fields: fieldsData.fields || [],
    records: recordsData.records || [],
    raw: { fieldsData, recordsData },
  };
}

/**
 * 调用腾讯文档 Open API（普通表格 / Sheet）
 * ⚠️ 此函数需要根据实际 API 端点调整
 */
async function callSheetAPI(fileId, sheetId) {
  // 普通表格的 API 端点还在确认中
  // 参考：https://developer.work.weixin.qq.com/document/44380
  const apiUrl = `https://docs.qq.com/openapi/sheet/v1/spreadsheets/${fileId}/sheets/${sheetId}/values`;
  
  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Client-Id': CLIENT_ID,
      'Open-Id': OPEN_ID,
      'Access-Token': ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ range: 'A1:Z100' }),
  });
  const data = await resp.json();
  return data;
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
    
    // 先尝试智能表格 API
    let result;
    try {
      result = await callSmartsheetAPI(fileId, sheetId, filterField, filterValue);
    } catch (e) {
      // 如果失败，尝试普通表格 API
      try {
        result = await callSheetAPI(fileId, sheetId);
      } catch (e2) {
        return new Response(JSON.stringify({
          error: 'API 调用失败',
          message: e2.message,
          hint: '请检查 API 端点是否正确，或联系开发者',
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
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
