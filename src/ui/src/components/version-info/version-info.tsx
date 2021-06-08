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
import {
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';
import { createStyles } from '@material-ui/styles';

const styles = ({ palette }: Theme) => createStyles({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    color: palette.grey['800'],
    fontSize: '12px',
  },
});

interface VersionInfoProps extends WithStyles<typeof styles> {
  cloudVersion: string;
}

const VersionInfoImpl = (props: VersionInfoProps) => {
  const { classes, cloudVersion } = props;
  return <div className={classes.root}>{cloudVersion}</div>;
};

export const VersionInfo = withStyles(styles)(VersionInfoImpl);