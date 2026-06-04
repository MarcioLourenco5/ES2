const { reports, batches, measurements, auditLogs } = require('../data/mockData');
const { isPositiveInteger, getUserId } = require('../utils/validation');
const { audit } = require('../utils/audit');

const VALID_FORMATS = ['CSV', 'Excel'];
const VALID_TYPES = ['batch_summary', 'measurements', 'audit'];

function getAll(req, res) {
  return res.json(reports);
}

function getById(req, res) {
  const report = reports.find(r => r.id === Number(req.params.id));
  if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });
  return res.json(report);
}

function generate(req, res) {
  const { type, format, batchId } = req.body || {};
  if (!type || !format) {
    return res.status(400).json({ error: 'type e format são obrigatórios' });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type inválido. Valores aceites: ${VALID_TYPES.join(', ')}` });
  }
  if (!VALID_FORMATS.includes(format)) {
    return res.status(400).json({ error: `format inválido. Valores aceites: ${VALID_FORMATS.join(', ')}` });
  }
  if (batchId !== undefined && batchId !== null) {
    if (!isPositiveInteger(batchId)) {
      return res.status(400).json({ error: 'batchId deve ser um inteiro positivo' });
    }
    if (!batches.find(b => b.id === batchId)) {
      return res.status(404).json({ error: 'Lote não encontrado para o relatório' });
    }
  }

  const newReport = {
    id: reports.length + 1,
    type,
    format,
    batchId: batchId || null,
    generatedAt: new Date().toISOString(),
    generatedBy: getUserId(req),
  };
  reports.push(newReport);
  audit(req, 'GENERATE_REPORT', 'POST /reports', { reportId: newReport.id, type, format, batchId: newReport.batchId });
  return res.status(201).json(newReport);
}

function getRowsForReport(report) {
  if (report.type === 'batch_summary') {
    return batches
      .filter(b => !report.batchId || b.id === report.batchId)
      .map(b => ({ id: b.id, planId: b.planId, herbId: b.herbId, status: b.status, quantity: b.quantity, losses: b.losses, productivity: b.productivity }));
  }
  if (report.type === 'measurements') {
    return measurements
      .filter(m => !report.batchId || m.batchId === report.batchId)
      .map(m => ({ id: m.id, batchId: m.batchId, temperature: m.temperature, humidity: m.humidity, luminosity: m.luminosity, timestamp: m.timestamp }));
  }
  return auditLogs.map(l => ({ id: l.id, userId: l.userId, action: l.action, resource: l.resource, timestamp: l.timestamp }));
}

function escapeCsv(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n;]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  return [headers.join(','), ...rows.map(row => headers.map(h => escapeCsv(row[h])).join(','))].join('\n');
}

function escapeXml(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toExcelXml(rows) {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : ['sem_dados'];
  const headerCells = headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('');
  const dataRows = rows.map(row => {
    const cells = headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(row[h])}</Data></Cell>`).join('');
    return `<Row>${cells}</Row>`;
  }).join('');

  return `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="GREENHERB"><Table><Row>${headerCells}</Row>${dataRows}</Table></Worksheet></Workbook>`;
}

function exportReport(req, res) {
  const report = reports.find(r => r.id === Number(req.params.id));
  if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });

  const rows = getRowsForReport(report);
  audit(req, 'EXPORT_REPORT', 'GET /reports/:id/export', { reportId: report.id, format: report.format, rows: rows.length });

  if (report.format === 'CSV') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="greenherb-report-${report.id}.csv"`);
    return res.status(200).send(toCsv(rows));
  }

  res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="greenherb-report-${report.id}.xls"`);
  return res.status(200).send(toExcelXml(rows));
}

module.exports = { getAll, getById, generate, exportReport, getRowsForReport, toCsv, toExcelXml };
