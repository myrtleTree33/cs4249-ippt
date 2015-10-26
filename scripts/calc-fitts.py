#!/usr/bin/env python
# -*- coding: utf-8 -*-

import math

def calc_fitts(a, w):
    return math.log(2 * a / w ,2)

if __name__ == '__main__':
    calc_fitts(2,3)
