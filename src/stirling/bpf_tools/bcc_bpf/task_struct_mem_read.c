/*
 * This code runs using bpf in the Linux kernel.
 * Copyright 2018- The Pixie Authors.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * SPDX-License-Identifier: GPL-2.0
 */

// LINT_C_FILE: Do not remove this line. It ensures cpplint treats this as a C file.

#include "src/stirling/bpf_tools/bcc_bpf_intf/types.h"

// Map that holds a copy of the raw memory of the task struct.
BPF_ARRAY(task_struct_buf, struct buf, 1);

// Map that holds the address of the task struct.
// Used to look for a task_struct pointer to itself,
// which would be an indication of the group leader.
BPF_ARRAY(task_struct_address_map, uint64_t, 1);

int task_struct_probe(struct pt_regs* ctx) {
  int kIndex = 0;

  // Get the task struct.
  struct task_struct* task = (struct task_struct*)bpf_get_current_task();

  // Copy the raw memory of the task_struct.
  struct buf* buf = task_struct_buf.lookup(&kIndex);
  if (buf == NULL) {
    return 0;
  }
  bpf_probe_read(buf, sizeof(struct buf), task);

  // Copy the task struct address.
  uint64_t task_addr = (uint64_t)task;
  task_struct_address_map.update(&kIndex, &task_addr);

  return 0;
}
