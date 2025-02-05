const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const Handlebars = require('handlebars');
const HTMLParser = require('node-html-parser');

if (!process.argv[5]) {
  console.error('Please provide the process name as an argument.');
  process.exit(1);
}
const PROCESS_NAME = process.argv[5];

if (!process.argv[4]) {
  console.error('Please provide the timestamp file path as an argument.');
  process.exit(1);
}

const TIMESTAMP_FILE_PATH = process.argv[4];

const statsExtensionPath = path.join(
  os.homedir(),
  '.sqlpkg/nalgeon/stats/stats.dylib',
);

if (!fs.existsSync(statsExtensionPath)) {
  console.error(
    'Stats extension is not installed. Please install it using the following link: https://antonz.org/install-sqlite-extension/#download-manually',
  );
  process.exit(1);
}

if (!process.argv[3]) {
  console.error('Please provide the database file path as an argument.');
  process.exit(1);
}
const db = new sqlite3.Database(process.argv[3]);
db.loadExtension(statsExtensionPath);

if (!process.argv[2]) {
  console.error('Please provide the report directory path as an argument.');
  process.exit(1);
}

const reportDirectoryPath = process.argv[2];

const YELLOW_HEX = '#e6e22e';
const GREEN_HEX = '#8fb935';
const RED_HEX = '#e64747';

const helperHandler = (value, gt0 = GREEN_HEX, ls0 = RED_HEX, eps) => {
  let resolvedEps = eps;
  if (typeof resolvedEps !== 'number') {
    resolvedEps = 0;
  }
  if (value > resolvedEps) {
    return gt0;
  } else if (value < -resolvedEps) {
    return ls0;
  } else {
    return YELLOW_HEX;
  }
};

Handlebars.registerHelper('tableDataBackgroundColor', (value, eps) =>
  helperHandler(value, GREEN_HEX, RED_HEX, eps),
);
Handlebars.registerHelper('tableDataBackgroundColorInverted', (value, eps) =>
  helperHandler(value, RED_HEX, GREEN_HEX, eps),
);

const reportRawFile = fs.readFileSync(
  path.join(__dirname, './templates/report.handlebars'),
  'utf8',
);
const compReportRawFile = fs.readFileSync(
  path.join(__dirname, './templates/comparative-report.handlebars'),
  'utf8',
);
const reportTemplate = Handlebars.compile(reportRawFile);
const compReportTemplate = Handlebars.compile(compReportRawFile);

const convertTimestampsQuery = `
    WITH times AS (
        SELECT 
            MAX(CASE WHEN clock_name = 'boottime' THEN ts END) AS boottime,
            MAX(CASE WHEN clock_name = 'realtime' THEN ts END) AS realtime
        FROM 
            clock_snapshot
    )

    UPDATE callstack
    SET ts = CAST(SUBSTR((ts - (SELECT boottime FROM times) + (SELECT realtime FROM times)), 1, 13) AS INTEGER)
`;

const fpsQuery = (startRange = '-1e999', endRange = '1e999') => `
    SELECT COUNT(*) / ((${endRange} - ${startRange}) / 1000) as fps
    FROM callstack
    WHERE ts >= ${startRange} AND ts + (dur/1000000) <= ${endRange}
    GROUP BY callstack.name
    HAVING callstack.name LIKE "%Repaint%"
`;

const rnohMethodPerformanceMetricsQuery = (
  startRange = '-1e999',
  endRange = '1e999',
) => `
    SELECT callstack.name, COUNT(*) as callCount, MEDIAN(callstack.dur) as median, MAX(callstack.dur) as max, MIN(callstack.dur) as min
    FROM callstack
    LEFT JOIN thread ON callstack.callid = thread.itid
    WHERE ts >= ${startRange} AND ts + (dur/1000000) <= ${endRange} AND thread.name = "${PROCESS_NAME}"
    GROUP BY callstack.name
    HAVING callstack.name LIKE "H:%RNOH%"
    ORDER BY callCount DESC
`;

const rnMethodPerformanceMetricsQuery = (
  startRange = '-1e999',
  endRange = '1e999',
) => `
    SELECT callstack.name, COUNT(*) as callCount, MEDIAN(callstack.dur) as median, MAX(callstack.dur) as max, MIN(callstack.dur) as min
    FROM callstack
    LEFT JOIN thread ON callstack.callid = thread.itid
    WHERE ts >= ${startRange} AND ts + (dur/1000000) <= ${endRange} AND thread.name = "RNOH_JS"
    GROUP BY callstack.name
    HAVING callstack.name NOT LIKE "H:#RNOH%" AND callstack.name LIKE "H:%" AND callstack.name NOT LIKE "%JS_require%" AND callstack.name NOT LIKE "%JSTimers%"
    ORDER BY callCount DESC
`;

const processMetricsQuery = `
    SELECT SUM(cpu_time) as cpuTime, ROUND(MEDIAN(cpu_usage),4) as cpuUsage, MEDIAN(thread_num) as threadNumber, SUM(disk_writes) as diskWrites, SUM(disk_reads) as diskReads 
    FROM live_process 
    WHERE process_name="${PROCESS_NAME}"
`;

const hwInstructionsQuery = `
    SELECT CASE WHEN event_count IS NULL THEN "Enable root to get this value" ELSE SUM(event_count) END AS instructionsSent
    FROM perf_sample
    LEFT JOIN perf_thread ON perf_sample.thread_id = perf_thread.thread_id
    LEFT JOIN perf_report ON perf_sample.event_type_id = perf_report.id
    WHERE perf_thread.thread_name="com.rnoh.tester" AND perf_report.report_value="hw-instructions"
`;

const getRows = query =>
  new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });

const getRow = query =>
  new Promise((resolve, reject) => {
    db.get(query, (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });

const runQuery = query =>
  new Promise((resolve, reject) => {
    db.run(query, (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });

const getFormattedDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}:${minutes}:${seconds}`;
};

const htmlTableToArray = (root, tableId) => {
  const table = root.getElementById(tableId);
  if (!table) {
    return [];
  }
  const rows = table.getElementsByTagName('tr');
  const tableArray = [];

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td[data-key]');
    const rowArray = [];
    for (let j = 0; j < cells.length; j++) {
      rowArray.push({
        key: cells[j].getAttribute('data-key'),
        value: cells[j].innerText,
      });
    }
    if (rowArray.length > 0) {
      tableArray.push(rowArray);
    }
  }
  return tableArray;
};

const isNumeric = string => /^[+-]?(\d*\.\d+|\d+\.?\d*)$/.test(string);
const roundOrInt = num =>
  Number.isInteger(num) ? num : Math.round(num * 1000) / 1000;

const generateDiffObject = (previousReportHTMLRoot, reportData) => {
  const dataDiff = {testData: []};

  const calculateDiff = (prevValue, newValue) => {
    return isNumeric(newValue) && isNumeric(prevValue)
      ? roundOrInt(newValue - prevValue)
      : null;
  };

  const processMethodDurations = (prevData, currentData) => {
    return prevData
      .map(row => {
        const entryName = row.find(item => item.key === 'name').value;
        const currentEntry = currentData.find(item => item.name === entryName);
        if (!currentEntry) {
          return null;
        }

        return row.reduce(
          (acc, item) => {
            const key = item.key;
            const diff = calculateDiff(item.value, currentEntry[key]);
            if (key !== 'name') {
              acc[key] = diff ?? 'N/A';
            }
            return acc;
          },
          {name: entryName},
        );
      })
      .filter(row => row !== null);
  };

  // Common data
  const prevCommonData = htmlTableToArray(
    previousReportHTMLRoot,
    'common-data',
  );
  const commonDataDiff = prevCommonData.reduce((acc, row) => {
    const key = row[0].key;
    const prevValue = row[0].value;
    const newValue = reportData.commonData[key];
    acc[key] = calculateDiff(prevValue, newValue) ?? 'N/A';
    return acc;
  }, {});
  dataDiff.commonData = commonDataDiff;

  // Test data
  reportData.testData.forEach((testData, i) => {
    const prevBasicData = htmlTableToArray(
      previousReportHTMLRoot,
      `basic-data-${i}`,
    );
    const basicDataDiff = prevBasicData.reduce((acc, row) => {
      const key = row[0].key;
      const prevValue = row[0].value;
      const newValue = testData.basicData[key];
      acc[key] = calculateDiff(prevValue, newValue) ?? 'N/A';
      return acc;
    }, {});

    const prevRnohMethodDuration = htmlTableToArray(
      previousReportHTMLRoot,
      `rnoh-method-data-${i}`,
    );
    const rnohMethodDurationDiff = processMethodDurations(
      prevRnohMethodDuration,
      testData.rnohMethodDuration,
    );

    const prevRnMethodDuration = htmlTableToArray(
      previousReportHTMLRoot,
      `rn-method-data-${i}`,
    );
    const rnMethodDurationDiff = processMethodDurations(
      prevRnMethodDuration,
      testData.rnMethodDuration,
    );

    dataDiff.testData[i] = {
      ...testData,
      basicData: basicDataDiff,
      rnohMethodDuration: rnohMethodDurationDiff,
      rnMethodDuration: rnMethodDurationDiff,
    };
  });

  return dataDiff;
};

const main = async () => {
  await runQuery(convertTimestampsQuery);
  const processData = await getRow(processMetricsQuery);
  const hwInstructionsData = await getRow(hwInstructionsQuery);
  const date = getFormattedDate(new Date());

  const ranges = JSON.parse(fs.readFileSync(TIMESTAMP_FILE_PATH, 'utf8'));
  const data = {
    processName: PROCESS_NAME,
    date,
    commonData: {
      ...hwInstructionsData,
      ...processData,
    },
    testData: [],
  };

  for (let id = 0; id < ranges.length; id++) {
    const {
      startTimestamp,
      endTimestamp,
      testName,
      duration: testDuration,
    } = ranges[id];
    const rnohMethodDuration = await getRows(
      rnohMethodPerformanceMetricsQuery(startTimestamp, endTimestamp),
    );
    const rnMethodDuration = await getRows(
      rnMethodPerformanceMetricsQuery(startTimestamp, endTimestamp),
    );
    const fpsData = await getRow(fpsQuery(startTimestamp, endTimestamp));

    data.testData.push({
      id,
      testName,
      basicData: {
        fps: fpsData?.fps,
        testDuration,
      },
      rnohMethodDuration,
      rnMethodDuration,
    });
  }

  db.close();

  fs.writeFileSync(
    `${reportDirectoryPath}/performance-report-${date}.html`,
    reportTemplate(data),
    'utf8',
  );

  const previousReportPath = process.argv[6];
  if (previousReportPath) {
    let resolvedPreviousReportPath = previousReportPath;
    if (!path.isAbsolute(previousReportPath)) {
      resolvedPreviousReportPath = path.join(
        __dirname,
        '../../',
        previousReportPath,
      );
    }
    if (!resolvedPreviousReportPath.endsWith('.html')) {
      console.error(
        'Please provide a valid html file path as the fourth argument.',
      );
      process.exit(1);
    }
    const previousReportData = fs.readFileSync(
      resolvedPreviousReportPath,
      'utf8',
    );
    const previousReportHTMLRoot = HTMLParser.parse(previousReportData);
    const dataDiff = {
      ...generateDiffObject(previousReportHTMLRoot, data),
      date,
      prevReportDate:
        previousReportHTMLRoot.getElementById('report-date').innerText,
      processName: PROCESS_NAME,
    };
    fs.writeFileSync(
      `${reportDirectoryPath}/performance-comparative-report-${date}.html`,
      compReportTemplate(dataDiff),
      'utf8',
    );
  }
};

main();
