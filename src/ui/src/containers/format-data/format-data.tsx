/*
 * Copyright 2018- The Pixie Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import { formatBoolData, formatFloat64Data, formatUInt128Protobuf } from 'app/utils/format-data';
import {
  GaugeLevel,
  getCPULevel,
  getLatencyNSLevel,
} from 'app/utils/metric-thresholds';
import { buildClass } from 'app/components';
import { DataType, SemanticType } from 'app/types/generated/vizierapi_pb';

const useAlertDataStyles = makeStyles(({ palette }: Theme) => createStyles({
  true: {
    color: palette.error.dark,
  },
  false: {},
}), { name: 'AlertData' });

export const AlertData: React.FC<{ data: any }> = React.memo(function AlertData({ data }) {
  const classes = useAlertDataStyles();
  return <div className={classes[data]}>{formatBoolData(data)}</div>;
});

interface GaugeDataProps {
  data: any;
  getLevel: (number) => GaugeLevel;
}

const useGaugeStyles = makeStyles(({ palette }: Theme) => createStyles({
  low: {
    color: palette.success.dark,
  },
  med: {
    color: palette.warning.dark,
  },
  high: {
    color: palette.error.dark,
  },
}), { name: 'GaugeData' });

export const GaugeDataBase: React.FC<GaugeDataProps> = React.memo(function GaugeDataBase({ getLevel, data }) {
  const classes = useGaugeStyles();
  const floatVal = parseFloat(data);
  return <div className={classes[getLevel(floatVal)]}>{formatFloat64Data(data)}</div>;
});

export const GaugeData: React.FC<{ data: any, level: GaugeLevel }> = React.memo(function GuageData({ data, level }) {
  const classes = useGaugeStyles();
  return <div className={classes[level]}>{data}</div>;
});

export const CPUData: React.FC<{ data: any }> = React.memo(function CPUData({ data }) {
  return <GaugeDataBase data={data} getLevel={getCPULevel} />;
});

const usePortRendererStyles = makeStyles(() => createStyles({
  value: {
    fontFamily: '"Roboto Mono", serif',
    fontSize: '14px',
  },
}), { name: 'PortRenderer' });

export const PortRenderer: React.FC<{ data: any }> = React.memo(function PortRenderer({ data }) {
  return <span className={usePortRendererStyles().value}>{data}</span>;
});

export interface DataWithUnits {
  val: string;
  units: string;
}

export const formatScaled = (data: number, scale: number, suffixes: string[], decimals = 2): DataWithUnits => {
  const dm = decimals < 0 ? 0 : decimals;
  let i = Math.floor(Math.log(Math.abs(data)) / Math.log(scale));
  i = Math.max(0, Math.min(i, suffixes.length - 1));

  const val = `${parseFloat((data / (scale ** i)).toFixed(dm))}`;
  const units = suffixes[i];

  return {
    val,
    units,
  };
};

export const formatBytes = (data: number): DataWithUnits => (
  formatScaled(data,
    1024,
    ['\u00a0B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    1)
);

export const formatDuration = (data: number): DataWithUnits => (
  formatScaled(data,
    1000,
    ['ns', '\u00b5s', 'ms', '\u00a0s'],
    1)
);

export const formatThroughput = (data: number): DataWithUnits => (
  formatScaled(data * 1E9,
    1000,
    ['\u00a0/s', 'K/s', 'M/s', 'B/s'],
    1)
);

export const formatThroughputBytes = (data: number): DataWithUnits => (
  formatScaled(data * 1E9,
    1024,
    ['\u00a0B/s', 'KB/s', 'MB/s', 'GB/s'],
    1)
);

const useRenderValueWithUnitsStyles = makeStyles(() => createStyles({
  units: {
    opacity: 0.5,
    fontFamily: '"Roboto Mono", serif',
    fontSize: '14px',
  },
  value: {
    fontFamily: '"Roboto Mono", serif',
    fontSize: '14px',
  },
}), { name: 'RenderValueWithUnits' });

const RenderValueWithUnits: React.FC<{ data: DataWithUnits }> = React.memo(function RenderValueWithUnits({ data }) {
  const classes = useRenderValueWithUnitsStyles();
  return (
    <>
      <span className={classes.value}>{`${data.val}\u00A0`}</span>
      <span className={classes.units}>{data.units}</span>
    </>
  );
});

export const BytesRenderer: React.FC<{ data: number }> = React.memo(function BytesRenderer({ data }) {
  return <RenderValueWithUnits data={formatBytes(data)} />;
});

export const DurationRenderer: React.FC<{ data: number }> = React.memo(function DurationRenderer({ data }) {
  const value = React.useMemo(() => <RenderValueWithUnits data={formatDuration(data)} />, [data]);
  return (
    <GaugeData
      data={value}
      level={getLatencyNSLevel(data)}
    />
  );
});

const useHttpStatusCodeRendererStyles = makeStyles((theme: Theme) => createStyles({
  root: {},
  unknown: {
    color: theme.palette.foreground.grey1,
  },
  oneHundredLevel: {
    color: theme.palette.success.main,
  },
  twoHundredLevel: {
    color: theme.palette.success.main,
  },
  threeHundredLevel: {
    color: theme.palette.success.main,
  },
  fourHundredLevel: {
    color: theme.palette.error.main,
  },
  fiveHundredLevel: {
    color: theme.palette.error.main,
  },
}), { name: 'HttpStatusCodeRenderer' });

export const HTTPStatusCodeRenderer: React.FC<{ data: string }> = React.memo(function HTTPStatusCodeRenderer({ data }) {
  const classes = useHttpStatusCodeRendererStyles();
  const intVal = parseInt(data, 10);
  const cls = buildClass(
    classes.root,
    intVal < 0 && classes.unknown,
    intVal > 0 && intVal < 200 && classes.oneHundredLevel,
    intVal >= 200 && intVal < 300 && classes.twoHundredLevel,
    intVal >= 300 && intVal < 400 && classes.threeHundredLevel,
    intVal >= 400 && intVal < 500 && classes.fourHundredLevel,
    intVal >= 500 && classes.fiveHundredLevel);

  return (
    <>
      <span className={cls}>{data}</span>
    </>
  );
});

export const formatPercent = (data: number): DataWithUnits => {
  const val = (100 * parseFloat(data.toString())).toFixed(1);
  const units = '%';

  return {
    val,
    units,
  };
};

interface PercentRendererProps {
  data: number;
}

export const PercentRenderer: React.FC<PercentRendererProps> = React.memo(function PercentRenderer({ data }) {
  return <RenderValueWithUnits data={formatPercent(data)} />;
});

export const ThroughputRenderer: React.FC<PercentRendererProps> = React.memo(function ThroughputRenderer({ data }) {
  return <RenderValueWithUnits data={formatThroughput(data)} />;
});

export const ThroughputBytesRenderer: React.FC<PercentRendererProps> = React.memo(
  function ThroughputBytesRenderer({ data }) {
    return <RenderValueWithUnits data={formatThroughputBytes(data)} />;
  },
);

// FormatFnMetadata stores a function with the string rep of that function.
// We need this datastructure to support formatting in Vega Axes.
export interface FormatFnMetadata {
  name: string;
  formatFn: (data: number) => DataWithUnits;
}

export const getFormatFnMetadata = (semType: SemanticType): FormatFnMetadata => {
  switch (semType) {
    case SemanticType.ST_BYTES:
      return { formatFn: formatBytes, name: 'formatBytes' };
    case SemanticType.ST_DURATION_NS:
      return { formatFn: formatDuration, name: 'formatDuration' };
    case SemanticType.ST_PERCENT:
      return { formatFn: formatPercent, name: 'formatPercent' };
    case SemanticType.ST_THROUGHPUT_PER_NS:
      return { formatFn: formatThroughput, name: 'formatThroughput' };
    case SemanticType.ST_THROUGHPUT_BYTES_PER_NS:
      return { formatFn: formatThroughputBytes, name: 'formatThroughputBytes' };
    default:
      break;
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const formatBySemType = (semType: SemanticType, val: any): DataWithUnits => {
  const formatFnMd = getFormatFnMetadata(semType);
  if (formatFnMd) {
    return formatFnMd.formatFn(val);
  }
  return {
    val,
    units: '',
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const formatByDataType = (dataType: DataType, val: any): string => {
  switch (dataType) {
    case DataType.FLOAT64:
      return formatFloat64Data(val);
    case DataType.BOOLEAN:
      return formatBoolData(val);
    case DataType.UINT128:
      return formatUInt128Protobuf(val);
    case DataType.STRING:
    default:
      return val;
  }
};
