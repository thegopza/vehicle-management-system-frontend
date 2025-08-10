import React from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// ปรับ path ให้ตรงกับโปรเจกต์ของคุณ
import headerImage from '../../../assets/header.png';      // รูปหัวกระดาษ
import bottomImage from '../../../assets/ot_footer.png';    // รูปส่วนท้ายที่ให้มา

dayjs.locale('th');

// ===== Helpers =====
const calculateOvernightHours = (startTimeStr, endTimeStr) => {
  const startTime = dayjs(startTimeStr, 'HH:mm:ss');
  const endTime = dayjs(endTimeStr, 'HH:mm:ss');
  if (!startTime.isValid() || !endTime.isValid()) return 0;
  let diffMin = endTime.diff(startTime, 'minute');
  if (diffMin < 0) diffMin += 24 * 60; // ข้ามเที่ยงคืน
  return diffMin / 60;
};

const generateTaskSummary = (req) => {
  if (req.reason || req.project) {
    return req.reason || req.project;
  }
  if (!req.tasks || req.tasks.length === 0) {
    return '-';
  }
  return req.tasks.map(task => {
    const subject = task?.customRepairItem || task?.equipmentName || 'งาน';
    const description = task?.customFixDescription || 'ไม่มีคำอธิบาย';
    return `${subject}: ${description}`;
  }).join('\n');
};

// ===== Component =====
const PrintableOTSummary = React.forwardRef(({ reportData = [], otMultiplier = '' }, ref) => {

  const rows = reportData.flatMap((req) =>
    (req.otDates || []).flatMap((date) => {
      const hours = calculateOvernightHours(req.startTime, req.endTime);

      const mainRow = {
        isMainRow: true,
        key: `${req.id}-${date.id}-main`,
        employee: `${req.requester.firstName} ${req.requester.lastName}`,
        task: generateTaskSummary(req),
        date: `${dayjs(date.workDate).format('D MMM')} ${dayjs(date.workDate).year() + 543}`,
        time: `${dayjs(req.startTime, 'HH:mm:ss').format('H:mm')} - ${dayjs(req.endTime, 'HH:mm:ss').format('H:mm')}`,
        hours: hours.toFixed(2),
        multi: otMultiplier || '',
      };

      const coworkerRows = (req.coworkers || []).map((cw, index) => ({
        isMainRow: false,
        key: `${req.id}-${date.id}-cw-${index}`,
        employee: `${cw.firstName} ${cw.lastName}`,
      }));

      return [mainRow, ...coworkerRows];
    })
  );

  return (
    <div ref={ref} style={{ fontFamily: "'Sarabun', system-ui, sans-serif", color: '#000' }}>
      {/* ===== PRINT STYLES ===== */}
      <style type="text/css" media="print">
        {`
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-break { page-break-inside: avoid; }
        `}
      </style>

      {/* ===== SCREEN STYLES ===== */}
      <style>
        {`
          .sheet {
            width: 297mm;
            min-height: 210mm;
            position: relative;
            box-sizing: border-box;
          }

          .head-img {
            width: 50%;
            display: block;
            margin: 0 0 0mm 0;
          }

          .meta-row {
            display: grid;
            grid-template-columns: 1fr auto;
            column-gap: 8mm;
            align-items: start;
            margin: 0 2mm 4mm 2mm;
          }

          .notice-box {
            border: 0.3mm solid #000;
            padding: 2.5mm 3mm;
            font-size: 3.4mm;
            line-height: 1.35;
            white-space: pre-line;
          }

          .date-box {
            text-align: right;
            font-size: 3.6mm;
            padding-top: 1mm;
            white-space: nowrap;
          }

          .title-center {
            text-align: center;
            font-weight: 700;
            font-size: 4.2mm;
            margin: 1mm 0 3mm 0;
          }

          .ot-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 3.4mm;
          }
          .ot-table th, .ot-table td {
            border: 0.3mm solid #000;
            padding: 1mm 0mm;
            vertical-align: top;
          }
          .ot-table th {
            text-align: center;
            font-weight: 700;
            background: #f2f2f2;
          }
          .ot-table .sub-row-employee {
            font-style: italic;
            color: #444;
          }

          .col-emp   { width: 17%; }
          .col-task  { width: 20%; }
          .col-date  { width: 10%; }
          .col-time  { width: 8%; }
          .col-hrs   { width: 6%;  }
          .col-mult  { width: 6%;  }
          .col-rate  { width: 7%;  }
          .col-pay   { width: 7%;  }
          .col-day   { width: 7%;  }
          .col-total { width: 8%;  }
          .col-sign  { width: 14%; }

          .center { text-align: center; }
          .right { text-align: right; }

          .footer-img {
            width: 100%;
            display: block;
            margin-top: 0mm;
          }
        `}
      </style>

      <div className="sheet">
        <img className="head-img" src={headerImage} alt="Header" />
        <div className="meta-row">
          <div className="notice-box">
            โปรดทราบ : การทำงานล่วงเวลาทำให้บริษัทต้องเสียค่าใช้จ่าย
            ตามปกติหากวางแผนงานอย่างระมัดระวังแล้วจะสามารถหลีกเลี่ยงการทำงานล่วงเวลาได้
          </div>
          <div className="date-box">
            วัน{dayjs().format('dddd')} ที่ {dayjs().format('D MMMM')} {dayjs().year() + 543}
          </div>
        </div>
        <div className="title-center">รายงานสรุปการทำงานล่วงเวลา</div>
        <table className="ot-table no-break">
          <thead>
            <tr>
              <th className="col-emp">ชื่อพนักงาน</th>
              <th className="col-task">งานที่ต้องทำ</th>
              <th className="col-date">วันที่</th>
              <th className="col-time">เวลาที่ต้องทำ</th>
              <th className="col-hrs">ชั่วโมง OT</th>
              <th className="col-mult">OT คูณ</th>
              <th className="col-rate">อัตราค่าจ้าง ต่อชม.</th>
              <th className="col-pay">รับเงิน</th>
              <th className="col-day">วันหยุด/ชม.</th>
              <th className="col-total">รวมค่าจ้าง</th>
              <th className="col-sign">ลายเซ็น</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`blank-${i}`} style={{ height: '0mm' }}>
                  <td /><td /><td /><td /><td /><td /><td /><td /><td /><td /><td />
                </tr>
              ))
            ) : (
              rows.map((r) => (
                <tr key={r.key} style={{ height: r.isMainRow ? '1mm' : 'auto' }}>
                  <td className={!r.isMainRow ? 'sub-row-employee' : ''}>{r.employee}</td>
                  <td style={{ whiteSpace: 'pre-line' }}>{r.isMainRow ? r.task : ''}</td>
                  <td className="center">{r.isMainRow ? r.date : ''}</td>
                  <td className="center">{r.isMainRow ? r.time : ''}</td>
                  <td className="center">{r.isMainRow ? r.hours : ''}</td>
                  <td className="center">{r.isMainRow ? r.multi : ''}</td>
                  <td className="right"></td>
                  <td className="right"></td>
                  <td className="center"></td>
                  <td className="right"></td>
                  <td></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <img className="footer-img" src={bottomImage} alt="OT Footer" />
      </div>
    </div>
  );
});

export default PrintableOTSummary;
