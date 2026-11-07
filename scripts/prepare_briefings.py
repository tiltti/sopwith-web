#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-2.0-or-later
from pathlib import Path
from test_trainer import main
main('briefings.c',Path(__file__).resolve().parents[1]/'dist/mission-briefings.json')
