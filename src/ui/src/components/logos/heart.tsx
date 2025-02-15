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

export const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  /* eslint-disable max-len */
  <svg
    {...props}
    width='15'
    height='15'
    viewBox='0 0 15 15'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
  >
    <path
      d='M0.257263 14.7749H15.0001V0.0320628H0.257263V14.7749Z'
      fill='url(#pattern0)'
    />
    <defs>
      <pattern
        id='pattern0'
        patternContentUnits='objectBoundingBox'
        width='1'
        height='1'
      >
        <use xlinkHref='#image0' transform='scale(0.015625)' />
      </pattern>
      <image
        id='image0'
        width='64'
        height='64'
        xlinkHref='data:image/png;base64,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'
      />
    </defs>
  </svg>
  /* eslint-enable max-len */
);
