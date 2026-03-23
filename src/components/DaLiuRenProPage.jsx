import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Space,
  Table,
  TimePicker,
  Typography,
  message
} from 'antd';
import {
  ArrowLeftOutlined,
  CalculatorOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { getDaLiuRenPaiPan } from '../utils/daliuren';

const { RangePicker } = DatePicker;
const { Paragraph, Text, Title } = Typography;

const LOGGER_PREFIX = '[DaLiuRen][Pro]';
const DEFAULT_RANGE = [dayjs().startOf('day'), dayjs().startOf('day')];
const DEFAULT_TIME = dayjs().second(0);
const CONTROL_ROW_STYLE = {
  width: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 16
};
const ACTIONS_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 12
};

const buildRows = (dateRange, timePoint, birthYear, gender) => {
  if (!Array.isArray(dateRange) || dateRange.length !== 2) {
    throw new Error('请选择完整的日期范围');
  }

  const [startDate, endDate] = dateRange;
  if (!dayjs.isDayjs(startDate) || !startDate.isValid()) {
    throw new Error('开始日期无效');
  }

  if (!dayjs.isDayjs(endDate) || !endDate.isValid()) {
    throw new Error('结束日期无效');
  }

  if (!dayjs.isDayjs(timePoint) || !timePoint.isValid()) {
    throw new Error('时间无效');
  }

  const normalizedStart = startDate.startOf('day');
  const normalizedEnd = endDate.startOf('day');

  if (normalizedStart.isAfter(normalizedEnd, 'day')) {
    throw new Error('开始日期不能晚于结束日期');
  }

  const rows = [];
  let currentDate = normalizedStart;

  // 批量计算逐日固定时点的三传，避免引入第二套排盘逻辑。
  while (currentDate.isBefore(normalizedEnd, 'day') || currentDate.isSame(normalizedEnd, 'day')) {
    const targetDate = currentDate
      .hour(timePoint.hour())
      .minute(timePoint.minute())
      .second(0)
      .millisecond(0);

    try {
      const pan = getDaLiuRenPaiPan(targetDate.toDate(), birthYear || 2000, gender || '男');
      const [chu = {}, zhong = {}, mo = {}] = pan.sanChuan || [];

      rows.push({
        key: targetDate.format('YYYY-MM-DD'),
        date: targetDate.format('YYYY-MM-DD'),
        chu: chu.zhi || '-',
        zhong: zhong.zhi || '-',
        mo: mo.zhi || '-',
        hasError: false
      });
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('未知计算错误');
      console.error(`${LOGGER_PREFIX} 批量计算失败`, {
        date: targetDate.format('YYYY-MM-DD HH:mm'),
        message: wrappedError.message
      });

      rows.push({
        key: targetDate.format('YYYY-MM-DD'),
        date: targetDate.format('YYYY-MM-DD'),
        chu: '计算失败',
        zhong: '-',
        mo: '-',
        hasError: true
      });
    }

    currentDate = currentDate.add(1, 'day');
  }

  return rows;
};

const buildExportFileName = (dateRange, timePoint) => {
  const [startDate, endDate] = Array.isArray(dateRange) ? dateRange : [];
  const startText = dayjs.isDayjs(startDate) && startDate.isValid()
    ? startDate.format('YYYY-MM-DD')
    : '开始日期';
  const endText = dayjs.isDayjs(endDate) && endDate.isValid()
    ? endDate.format('YYYY-MM-DD')
    : '结束日期';
  const timeText = dayjs.isDayjs(timePoint) && timePoint.isValid()
    ? timePoint.format('HH-mm')
    : '时间';

  return `大六壬专业计算_${startText}_${endText}_${timeText}.xlsx`;
};

const DaLiuRenProPage = ({ birthYear, gender, onBack }) => {
  const [dateRange, setDateRange] = useState(DEFAULT_RANGE);
  const [timePoint, setTimePoint] = useState(DEFAULT_TIME);
  const [resultRows, setResultRows] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const errorCount = useMemo(
    () => resultRows.filter((row) => row.hasError).length,
    [resultRows]
  );

  const handleCalculate = async () => {
    try {
      setIsCalculating(true);
      console.log(`${LOGGER_PREFIX} 开始批量计算`, {
        start: dateRange?.[0]?.format('YYYY-MM-DD') || '',
        end: dateRange?.[1]?.format('YYYY-MM-DD') || '',
        time: timePoint?.format('HH:mm') || ''
      });
      const rows = buildRows(dateRange, timePoint, birthYear, gender);
      setResultRows(rows);
      console.log(`${LOGGER_PREFIX} 批量计算完成`, {
        total: rows.length,
        failed: rows.filter((row) => row.hasError).length
      });
      message.success(`计算完成，共生成 ${rows.length} 条记录`);
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('专业计算失败');
      console.error(`${LOGGER_PREFIX} 计算入口失败`, wrappedError);
      message.error(wrappedError.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = async () => {
    try {
      if (resultRows.length === 0) {
        throw new Error('暂无可导出的结果，请先完成计算');
      }

      setIsExporting(true);
      console.log(`${LOGGER_PREFIX} 开始导出 XLSX`, {
        total: resultRows.length,
        failed: resultRows.filter((row) => row.hasError).length
      });

      const XLSX = await import('xlsx');
      const exportRows = resultRows.map((row) => ({
        日期: row.date,
        初传: row.chu,
        中传: row.zhong,
        末传: row.mo
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, '三传结果');
      XLSX.writeFile(workbook, buildExportFileName(dateRange, timePoint));

      console.log(`${LOGGER_PREFIX} 导出 XLSX 成功`, {
        total: exportRows.length
      });
      message.success(`导出成功，共导出 ${exportRows.length} 条记录`);
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('导出 XLSX 失败');
      console.error(`${LOGGER_PREFIX} 导出 XLSX 失败`, wrappedError);
      message.error(wrappedError.message);
    } finally {
      setIsExporting(false);
    }
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 160
    },
    {
      title: '初传',
      dataIndex: 'chu',
      key: 'chu',
      align: 'center',
      width: 120
    },
    {
      title: '中传',
      dataIndex: 'zhong',
      key: 'zhong',
      align: 'center',
      width: 120
    },
    {
      title: '末传',
      dataIndex: 'mo',
      key: 'mo',
      align: 'center',
      width: 120
    }
  ];

  return (
    <div style={{ width: '100%', maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                大六壬专业计算
              </Title>
              <Paragraph style={{ margin: '8px 0 0', color: '#666' }}>
                按日期范围和固定时间批量计算每天的三传，仅输出地支结果。
              </Paragraph>
            </div>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              返回排盘
            </Button>
          </Space>

          <div style={CONTROL_ROW_STYLE}>
            <Space direction="vertical" size="small">
              <Text type="secondary">日期范围</Text>
              <RangePicker
                value={dateRange}
                onChange={(value) => {
                  if (value && value.length === 2) {
                    setDateRange(value);
                  }
                }}
                allowClear={false}
              />
            </Space>

            <Space direction="vertical" size="small">
              <Text type="secondary">固定时间</Text>
              <TimePicker
                value={timePoint}
                onChange={(value) => value && setTimePoint(value)}
                format="HH:mm"
                minuteStep={1}
                allowClear={false}
              />
            </Space>

            <div style={ACTIONS_STYLE}>
              <Button
                type="primary"
                icon={<CalculatorOutlined />}
                loading={isCalculating}
                onClick={handleCalculate}
              >
                计算
              </Button>
              <Button
                icon={<DownloadOutlined />}
                loading={isExporting}
                onClick={handleExport}
                disabled={resultRows.length === 0}
              >
                导出 XLSX
              </Button>
            </div>
          </div>

          {errorCount > 0 && (
            <Alert
              type="warning"
              showIcon
              message={`有 ${errorCount} 天计算失败，表格中已标记，详细原因请查看控制台日志。`}
            />
          )}
        </Space>
      </Card>

      <Card title="三传结果">
        <Table
          columns={columns}
          dataSource={resultRows}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          locale={{ emptyText: '请选择日期范围和时间后点击“计算”' }}
          scroll={{ x: 520 }}
        />
      </Card>
    </div>
  );
};

export default DaLiuRenProPage;
