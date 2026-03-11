import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import './BatchAnalysis.css';

const INPUT_FEATURES = [
  'koi_period','koi_impact','koi_duration','koi_depth','koi_model_snr',
  'koi_steff','koi_slogg','koi_srad','koi_smass','koi_smet',
];

const SAMPLE_DATA = [
  // ── confirmed-like planets (clear transit signals) ─────────────────────
  {koi_period:2.2046, koi_impact:0.146,koi_duration:2.706,koi_depth:1490, koi_model_snr:151.7,koi_steff:5455,koi_slogg:4.467,koi_srad:0.927,koi_smass:0.877,koi_smet:-0.183},
  {koi_period:54.318, koi_impact:0.256,koi_duration:6.246,koi_depth:7380, koi_model_snr:83.7, koi_steff:5765,koi_slogg:4.375,koi_srad:1.057,koi_smass:0.986,koi_smet:0.017},
  {koi_period:14.651, koi_impact:0.025,koi_duration:4.492,koi_depth:1108, koi_model_snr:67.6, koi_steff:5880,koi_slogg:4.362,koi_srad:1.064,koi_smass:1.023,koi_smet:0.108},
  {koi_period:22.411, koi_impact:0.102,koi_duration:4.810,koi_depth:2840, koi_model_snr:96.3, koi_steff:5690,koi_slogg:4.420,koi_srad:0.980,koi_smass:0.950,koi_smet:0.020},
  {koi_period:9.863,  koi_impact:0.330,koi_duration:3.540,koi_depth:1620, koi_model_snr:55.1, koi_steff:5510,koi_slogg:4.440,koi_srad:0.910,koi_smass:0.870,koi_smet:-0.050},
  {koi_period:5.311,  koi_impact:0.038,koi_duration:2.934,koi_depth:1820, koi_model_snr:77.4, koi_steff:5620,koi_slogg:4.410,koi_srad:0.950,koi_smass:0.910,koi_smet:-0.020},
  {koi_period:118.38, koi_impact:0.140,koi_duration:9.811,koi_depth:3960, koi_model_snr:44.2, koi_steff:5782,koi_slogg:4.430,koi_srad:1.000,koi_smass:1.000,koi_smet:0.000},
  {koi_period:33.600, koi_impact:0.510,koi_duration:7.120,koi_depth:6700, koi_model_snr:71.0, koi_steff:5100,koi_slogg:4.480,koi_srad:0.860,koi_smass:0.820,koi_smet:-0.120},
  {koi_period:4.888,  koi_impact:0.270,koi_duration:2.180,koi_depth:740,  koi_model_snr:35.6, koi_steff:6050,koi_slogg:4.310,koi_srad:1.200,koi_smass:1.120,koi_smet:0.090},
  {koi_period:41.086, koi_impact:0.680,koi_duration:5.920,koi_depth:510,  koi_model_snr:18.4, koi_steff:5940,koi_slogg:4.350,koi_srad:1.100,koi_smass:1.050,koi_smet:0.110},
  {koi_period:112.3,  koi_impact:0.180,koi_duration:8.940,koi_depth:840,  koi_model_snr:45.2, koi_steff:4402,koi_slogg:4.650,koi_srad:0.600,koi_smass:0.540,koi_smet:-0.120},
  {koi_period:289.9,  koi_impact:0.310,koi_duration:12.10,koi_depth:520,  koi_model_snr:38.7, koi_steff:5518,koi_slogg:4.430,koi_srad:1.000,koi_smass:0.970,koi_smet:0.020},
  {koi_period:384.8,  koi_impact:0.050,koi_duration:13.25,koi_depth:188,  koi_model_snr:22.1, koi_steff:5757,koi_slogg:4.400,koi_srad:1.020,koi_smass:1.010,koi_smet:0.080},
  {koi_period:129.9,  koi_impact:0.080,koi_duration:9.100,koi_depth:350,  koi_model_snr:28.4, koi_steff:3788,koi_slogg:4.830,koi_srad:0.500,koi_smass:0.440,koi_smet:-0.240},
  {koi_period:19.5,   koi_impact:0.120,koi_duration:2.840,koi_depth:110,  koi_model_snr:14.6, koi_steff:3240,koi_slogg:4.980,koi_srad:0.380,koi_smass:0.340,koi_smet:-0.310},
  {koi_period:6.1,    koi_impact:0.220,koi_duration:1.470,koi_depth:188,  koi_model_snr:21.5, koi_steff:2566,koi_slogg:5.020,koi_srad:0.320,koi_smass:0.290,koi_smet:-0.150},
  {koi_period:37.4,   koi_impact:0.280,koi_duration:4.880,koi_depth:280,  koi_model_snr:19.7, koi_steff:3480,koi_slogg:4.870,koi_srad:0.450,koi_smass:0.410,koi_smet:-0.050},
  {koi_period:32.9,   koi_impact:0.340,koi_duration:4.510,koi_depth:4100, koi_model_snr:53.8, koi_steff:3457,koi_slogg:4.890,koi_srad:0.440,koi_smass:0.400,koi_smet:-0.100},
  {koi_period:24.7,   koi_impact:0.210,koi_duration:5.620,koi_depth:1380, koi_model_snr:41.3, koi_steff:3216,koi_slogg:4.950,koi_srad:0.390,koi_smass:0.350,koi_smet:-0.220},
  {koi_period:11.2,   koi_impact:0.180,koi_duration:2.100,koi_depth:130,  koi_model_snr:16.8, koi_steff:3042,koi_slogg:4.940,koi_srad:0.410,koi_smass:0.370,koi_smet:-0.080},
  {koi_period:12.4,   koi_impact:0.020,koi_duration:3.620,koi_depth:580,  koi_model_snr:48.2, koi_steff:5850,koi_slogg:4.390,koi_srad:1.080,koi_smass:1.040,koi_smet:0.060},
  {koi_period:28.5,   koi_impact:0.140,koi_duration:6.180,koi_depth:1420, koi_model_snr:62.4, koi_steff:5690,koi_slogg:4.410,koi_srad:1.010,koi_smass:0.970,koi_smet:0.010},
  {koi_period:6.88,   koi_impact:0.440,koi_duration:2.380,koi_depth:3200, koi_model_snr:88.5, koi_steff:5420,koi_slogg:4.430,koi_srad:0.920,koi_smass:0.880,koi_smet:-0.040},
  {koi_period:3.12,   koi_impact:0.280,koi_duration:1.840,koi_depth:1650, koi_model_snr:71.2, koi_steff:5550,koi_slogg:4.420,koi_srad:0.950,koi_smass:0.910,koi_smet:-0.010},
  {koi_period:92.1,   koi_impact:0.360,koi_duration:11.40,koi_depth:2800, koi_model_snr:44.8, koi_steff:5700,koi_slogg:4.400,koi_srad:1.020,koi_smass:0.990,koi_smet:0.020},
  {koi_period:58.4,   koi_impact:0.080,koi_duration:8.920,koi_depth:1940, koi_model_snr:58.3, koi_steff:5800,koi_slogg:4.390,koi_srad:1.060,koi_smass:1.020,koi_smet:0.040},
  {koi_period:4.42,   koi_impact:0.180,koi_duration:2.140,koi_depth:980,  koi_model_snr:55.9, koi_steff:5900,koi_slogg:4.370,koi_srad:1.090,koi_smass:1.040,koi_smet:0.070},
  {koi_period:74.3,   koi_impact:0.290,koi_duration:9.840,koi_depth:3800, koi_model_snr:52.7, koi_steff:5640,koi_slogg:4.410,koi_srad:0.990,koi_smass:0.950,koi_smet:0.000},
  {koi_period:21.7,   koi_impact:0.440,koi_duration:4.880,koi_depth:1120, koi_model_snr:37.8, koi_steff:5480,koi_slogg:4.430,koi_srad:0.930,koi_smass:0.890,koi_smet:-0.030},
  {koi_period:142.8,  koi_impact:0.180,koi_duration:14.80,koi_depth:4500, koi_model_snr:41.2, koi_steff:5720,koi_slogg:4.400,koi_srad:1.030,koi_smass:1.000,koi_smet:0.020},
  // ── hot jupiters ────────────────────────────────────────────────────────
  {koi_period:3.52,   koi_impact:0.160,koi_duration:3.180,koi_depth:21000,koi_model_snr:195.2,koi_steff:6065,koi_slogg:4.240,koi_srad:1.310,koi_smass:1.220,koi_smet:0.140},
  {koi_period:1.27,   koi_impact:0.080,koi_duration:1.840,koi_depth:38000,koi_model_snr:218.7,koi_steff:6460,koi_slogg:4.180,koi_srad:1.550,koi_smass:1.410,koi_smet:0.220},
  {koi_period:2.2,    koi_impact:0.120,koi_duration:2.550,koi_depth:28000,koi_model_snr:172.1,koi_steff:6350,koi_slogg:4.210,koi_srad:1.450,koi_smass:1.350,koi_smet:0.180},
  {koi_period:0.74,   koi_impact:0.290,koi_duration:1.150,koi_depth:4200, koi_model_snr:85.4, koi_steff:5196,koi_slogg:4.410,koi_srad:0.950,koi_smass:0.920,koi_smet:0.010},
  {koi_period:1.88,   koi_impact:0.520,koi_duration:1.120,koi_depth:2450, koi_model_snr:48.4, koi_steff:5180,koi_slogg:4.470,koi_srad:0.880,koi_smass:0.840,koi_smet:-0.080},
  {koi_period:1.22,   koi_impact:0.140,koi_duration:1.180,koi_depth:8200, koi_model_snr:96.8, koi_steff:5500,koi_slogg:4.430,koi_srad:0.930,koi_smass:0.890,koi_smet:-0.030},
  {koi_period:1.14,   koi_impact:0.220,koi_duration:1.080,koi_depth:5800, koi_model_snr:88.4, koi_steff:5600,koi_slogg:4.420,koi_srad:0.960,koi_smass:0.920,koi_smet:-0.010},
  {koi_period:2.68,   koi_impact:0.180,koi_duration:1.620,koi_depth:1120, koi_model_snr:58.4, koi_steff:5880,koi_slogg:4.370,koi_srad:1.090,koi_smass:1.050,koi_smet:0.070},
  {koi_period:1.44,   koi_impact:0.440,koi_duration:1.280,koi_depth:6200, koi_model_snr:82.4, koi_steff:5540,koi_slogg:4.420,koi_srad:0.940,koi_smass:0.900,koi_smet:-0.020},
  {koi_period:0.54,   koi_impact:0.420,koi_duration:0.610,koi_depth:1240, koi_model_snr:22.4, koi_steff:6200,koi_slogg:4.190,koi_srad:1.480,koi_smass:1.380,koi_smet:0.240},
  // ── cold giants (long period) ────────────────────────────────────────────
  {koi_period:228.8,  koi_impact:0.450,koi_duration:18.40,koi_depth:45000,koi_model_snr:88.3, koi_steff:4450,koi_slogg:4.590,koi_srad:0.680,koi_smass:0.610,koi_smet:-0.060},
  {koi_period:255.6,  koi_impact:0.080,koi_duration:16.20,koi_depth:320,  koi_model_snr:14.8, koi_steff:5760,koi_slogg:4.400,koi_srad:1.010,koi_smass:0.980,koi_smet:0.010},
  {koi_period:195.8,  koi_impact:0.220,koi_duration:18.40,koi_depth:7400, koi_model_snr:32.8, koi_steff:5820,koi_slogg:4.380,koi_srad:1.070,koi_smass:1.030,koi_smet:0.050},
  {koi_period:316.8,  koi_impact:0.180,koi_duration:22.40,koi_depth:580,  koi_model_snr:11.8, koi_steff:5740,koi_slogg:4.400,koi_srad:1.030,koi_smass:0.990,koi_smet:0.010},
  {koi_period:252.4,  koi_impact:0.280,koi_duration:20.40,koi_depth:9200, koi_model_snr:24.8, koi_steff:5760,koi_slogg:4.400,koi_srad:1.010,koi_smass:0.980,koi_smet:0.010},
  {koi_period:166.2,  koi_impact:0.240,koi_duration:16.80,koi_depth:6200, koi_model_snr:36.8, koi_steff:5820,koi_slogg:4.380,koi_srad:1.070,koi_smass:1.030,koi_smet:0.050},
  {koi_period:165.2,  koi_impact:0.140,koi_duration:15.80,koi_depth:1840, koi_model_snr:18.4, koi_steff:5780,koi_slogg:4.400,koi_srad:1.040,koi_smass:1.000,koi_smet:0.020},
  {koi_period:102.4,  koi_impact:0.380,koi_duration:13.20,koi_depth:1180, koi_model_snr:21.4, koi_steff:5700,koi_slogg:4.400,koi_srad:1.010,koi_smass:0.980,koi_smet:0.010},
  {koi_period:138.5,  koi_impact:0.520,koi_duration:12.40,koi_depth:14800,koi_model_snr:58.4, koi_steff:5680,koi_slogg:4.410,koi_srad:1.000,koi_smass:0.970,koi_smet:0.000},
  {koi_period:108.8,  koi_impact:0.340,koi_duration:13.80,koi_depth:3200, koi_model_snr:34.8, koi_steff:5720,koi_slogg:4.400,koi_srad:1.030,koi_smass:0.990,koi_smet:0.010},
  // ── false positive-like (high impact / grazing / shallow) ───────────────
  {koi_period:0.937,  koi_impact:0.943,koi_duration:1.191,koi_depth:3630, koi_model_snr:23.3, koi_steff:5300,koi_slogg:4.450,koi_srad:0.870,koi_smass:0.800,koi_smet:-0.300},
  {koi_period:1.462,  koi_impact:1.120,koi_duration:0.890,koi_depth:410,  koi_model_snr:9.2,  koi_steff:6120,koi_slogg:4.210,koi_srad:1.340,koi_smass:1.180,koi_smet:0.250},
  {koi_period:3.217,  koi_impact:0.920,koi_duration:1.540,koi_depth:230,  koi_model_snr:7.8,  koi_steff:5890,koi_slogg:4.380,koi_srad:1.080,koi_smass:1.010,koi_smet:0.050},
  {koi_period:0.643,  koi_impact:1.080,koi_duration:0.530,koi_depth:180,  koi_model_snr:6.1,  koi_steff:5340,koi_slogg:4.520,koi_srad:0.840,koi_smass:0.780,koi_smet:-0.180},
  {koi_period:8.4,    koi_impact:0.880,koi_duration:1.240,koi_depth:2100, koi_model_snr:18.4, koi_steff:5400,koi_slogg:4.440,koi_srad:0.910,koi_smass:0.870,koi_smet:-0.020},
  {koi_period:16.2,   koi_impact:1.050,koi_duration:2.180,koi_depth:3400, koi_model_snr:22.7, koi_steff:5800,koi_slogg:4.380,koi_srad:1.050,koi_smass:1.000,koi_smet:0.040},
  {koi_period:0.96,   koi_impact:1.180,koi_duration:0.680,koi_depth:580,  koi_model_snr:7.2,  koi_steff:5600,koi_slogg:4.420,koi_srad:0.950,koi_smass:0.900,koi_smet:-0.060},
  {koi_period:2.81,   koi_impact:1.240,koi_duration:1.020,koi_depth:420,  koi_model_snr:6.8,  koi_steff:5900,koi_slogg:4.360,koi_srad:1.080,koi_smass:1.030,koi_smet:0.070},
  {koi_period:45.3,   koi_impact:1.080,koi_duration:4.210,koi_depth:9800, koi_model_snr:35.2, koi_steff:5500,koi_slogg:4.430,koi_srad:0.920,koi_smass:0.880,koi_smet:-0.030},
  {koi_period:178.4,  koi_impact:0.950,koi_duration:9.800,koi_depth:22000,koi_model_snr:48.1, koi_steff:5750,koi_slogg:4.400,koi_srad:1.000,koi_smass:0.980,koi_smet:0.000},
  {koi_period:0.62,   koi_impact:1.020,koi_duration:0.580,koi_depth:280,  koi_model_snr:5.8,  koi_steff:5450,koi_slogg:4.430,koi_srad:0.920,koi_smass:0.880,koi_smet:-0.020},
  {koi_period:3.84,   koi_impact:0.880,koi_duration:1.420,koi_depth:420,  koi_model_snr:6.4,  koi_steff:5620,koi_slogg:4.410,koi_srad:0.970,koi_smass:0.930,koi_smet:0.000},
  {koi_period:0.88,   koi_impact:1.150,koi_duration:0.720,koi_depth:310,  koi_model_snr:5.4,  koi_steff:5380,koi_slogg:4.440,koi_srad:0.910,koi_smass:0.870,koi_smet:-0.050},
  {koi_period:0.78,   koi_impact:0.980,koi_duration:0.620,koi_depth:340,  koi_model_snr:5.2,  koi_steff:5560,koi_slogg:4.420,koi_srad:0.960,koi_smass:0.920,koi_smet:-0.010},
  {koi_period:0.92,   koi_impact:1.120,koi_duration:0.680,koi_depth:420,  koi_model_snr:6.2,  koi_steff:5420,koi_slogg:4.430,koi_srad:0.920,koi_smass:0.880,koi_smet:-0.030},
  {koi_period:2.44,   koi_impact:0.920,koi_duration:0.940,koi_depth:640,  koi_model_snr:8.8,  koi_steff:5700,koi_slogg:4.400,koi_srad:1.020,koi_smass:0.980,koi_smet:0.010},
  {koi_period:1.68,   koi_impact:0.840,koi_duration:1.180,koi_depth:1840, koi_model_snr:24.6, koi_steff:5480,koi_slogg:4.430,koi_srad:0.930,koi_smass:0.890,koi_smet:-0.030},
  {koi_period:11.8,   koi_impact:0.780,koi_duration:2.180,koi_depth:5800, koi_model_snr:38.6, koi_steff:5560,koi_slogg:4.420,koi_srad:0.960,koi_smass:0.920,koi_smet:-0.010},
  {koi_period:18.8,   koi_impact:0.720,koi_duration:3.640,koi_depth:4200, koi_model_snr:42.4, koi_steff:5560,koi_slogg:4.420,koi_srad:0.960,koi_smass:0.920,koi_smet:-0.010},
  {koi_period:27.8,   koi_impact:0.620,koi_duration:5.280,koi_depth:3400, koi_model_snr:44.2, koi_steff:5640,koi_slogg:4.410,koi_srad:0.990,koi_smass:0.960,koi_smet:0.000},
  // ── mixed / edge cases ──────────────────────────────────────────────────
  {koi_period:25.3,   koi_impact:0.040,koi_duration:5.840,koi_depth:2640, koi_model_snr:85.2, koi_steff:5660,koi_slogg:4.410,koi_srad:0.990,koi_smass:0.950,koi_smet:0.000},
  {koi_period:48.8,   koi_impact:0.320,koi_duration:8.120,koi_depth:4100, koi_model_snr:62.4, koi_steff:5710,koi_slogg:4.400,koi_srad:1.020,koi_smass:0.980,koi_smet:0.010},
  {koi_period:5.88,   koi_impact:0.240,koi_duration:2.580,koi_depth:1260, koi_model_snr:64.2, koi_steff:5840,koi_slogg:4.380,koi_srad:1.080,koi_smass:1.040,koi_smet:0.060},
  {koi_period:62.4,   koi_impact:0.160,koi_duration:9.420,koi_depth:5800, koi_model_snr:48.8, koi_steff:5760,koi_slogg:4.400,koi_srad:1.010,koi_smass:0.980,koi_smet:0.020},
  {koi_period:88.6,   koi_impact:0.060,koi_duration:11.80,koi_depth:890,  koi_model_snr:28.6, koi_steff:5700,koi_slogg:4.400,koi_srad:1.020,koi_smass:0.990,koi_smet:0.010},
  {koi_period:13.6,   koi_impact:0.360,koi_duration:3.940,koi_depth:1840, koi_model_snr:54.8, koi_steff:5580,koi_slogg:4.420,koi_srad:0.960,koi_smass:0.920,koi_smet:-0.010},
  {koi_period:7.44,   koi_impact:0.550,koi_duration:2.280,koi_depth:2900, koi_model_snr:78.4, koi_steff:5480,koi_slogg:4.430,koi_srad:0.930,koi_smass:0.890,koi_smet:-0.020},
  {koi_period:3.66,   koi_impact:0.480,koi_duration:1.960,koi_depth:780,  koi_model_snr:38.4, koi_steff:5940,koi_slogg:4.360,koi_srad:1.100,koi_smass:1.060,koi_smet:0.080},
  {koi_period:17.9,   koi_impact:0.620,koi_duration:3.420,koi_depth:2180, koi_model_snr:44.1, koi_steff:5380,koi_slogg:4.440,koi_srad:0.910,koi_smass:0.870,koi_smet:-0.040},
  {koi_period:8.21,   koi_impact:0.080,koi_duration:2.920,koi_depth:1580, koi_model_snr:72.4, koi_steff:5780,koi_slogg:4.400,koi_srad:1.040,koi_smass:1.000,koi_smet:0.020},
  {koi_period:38.2,   koi_impact:0.080,koi_duration:7.280,koi_depth:2400, koi_model_snr:56.8, koi_steff:5680,koi_slogg:4.410,koi_srad:1.000,koi_smass:0.970,koi_smet:0.000},
  {koi_period:43.8,   koi_impact:0.140,koi_duration:7.840,koi_depth:3600, koi_model_snr:58.2, koi_steff:5720,koi_slogg:4.400,koi_srad:1.030,koi_smass:0.990,koi_smet:0.020},
  {koi_period:77.6,   koi_impact:0.440,koi_duration:10.80,koi_depth:6400, koi_model_snr:44.8, koi_steff:5700,koi_slogg:4.400,koi_srad:1.020,koi_smass:0.990,koi_smet:0.010},
  {koi_period:14.4,   koi_impact:0.580,koi_duration:3.280,koi_depth:2100, koi_model_snr:36.8, koi_steff:5540,koi_slogg:4.420,koi_srad:0.940,koi_smass:0.900,koi_smet:-0.020},
  {koi_period:4.18,   koi_impact:0.240,koi_duration:2.080,koi_depth:1520, koi_model_snr:68.8, koi_steff:5820,koi_slogg:4.380,koi_srad:1.070,koi_smass:1.030,koi_smet:0.050},
  {koi_period:19.2,   koi_impact:0.080,koi_duration:4.880,koi_depth:2800, koi_model_snr:88.4, koi_steff:5660,koi_slogg:4.410,koi_srad:1.000,koi_smass:0.960,koi_smet:0.000},
  {koi_period:31.4,   koi_impact:0.480,koi_duration:6.480,koi_depth:4800, koi_model_snr:52.4, koi_steff:5620,koi_slogg:4.410,koi_srad:0.970,koi_smass:0.930,koi_smet:0.000},
  {koi_period:6.22,   koi_impact:0.040,koi_duration:2.720,koi_depth:920,  koi_model_snr:46.8, koi_steff:5780,koi_slogg:4.400,koi_srad:1.040,koi_smass:1.000,koi_smet:0.020},
  {koi_period:9.44,   koi_impact:0.180,koi_duration:3.240,koi_depth:1420, koi_model_snr:62.4, koi_steff:5880,koi_slogg:4.370,koi_srad:1.090,koi_smass:1.050,koi_smet:0.070},
  {koi_period:68.4,   koi_impact:0.280,koi_duration:9.840,koi_depth:2100, koi_model_snr:36.4, koi_steff:5660,koi_slogg:4.410,koi_srad:0.990,koi_smass:0.960,koi_smet:0.000},
  {koi_period:5.62,   koi_impact:0.340,koi_duration:2.480,koi_depth:1680, koi_model_snr:74.8, koi_steff:5840,koi_slogg:4.380,koi_srad:1.080,koi_smass:1.040,koi_smet:0.060},
  {koi_period:2.08,   koi_impact:0.120,koi_duration:1.420,koi_depth:760,  koi_model_snr:42.8, koi_steff:5920,koi_slogg:4.360,koi_srad:1.100,koi_smass:1.060,koi_smet:0.090},
  {koi_period:85.2,   koi_impact:0.260,koi_duration:11.60,koi_depth:3100, koi_model_snr:38.2, koi_steff:5700,koi_slogg:4.400,koi_srad:1.010,koi_smass:0.980,koi_smet:0.010},
  {koi_period:15.8,   koi_impact:0.040,koi_duration:4.280,koi_depth:2200, koi_model_snr:78.6, koi_steff:5760,koi_slogg:4.400,koi_srad:1.030,koi_smass:0.990,koi_smet:0.020},
  {koi_period:4.04,   koi_impact:0.550,koi_duration:2.020,koi_depth:1050, koi_model_snr:28.4, koi_steff:5380,koi_slogg:4.440,koi_srad:0.910,koi_smass:0.870,koi_smet:-0.040},
  {koi_period:226.4,  koi_impact:0.100,koi_duration:19.60,koi_depth:440,  koi_model_snr:12.6, koi_steff:5780,koi_slogg:4.400,koi_srad:1.040,koi_smass:1.000,koi_smet:0.020},
  {koi_period:11.6,   koi_impact:0.320,koi_duration:3.480,koi_depth:1720, koi_model_snr:66.4, koi_steff:5540,koi_slogg:4.420,koi_srad:0.940,koi_smass:0.900,koi_smet:-0.020},
  {koi_period:0.82,   koi_impact:1.060,koi_duration:0.640,koi_depth:380,  koi_model_snr:5.6,  koi_steff:5480,koi_slogg:4.430,koi_srad:0.930,koi_smass:0.890,koi_smet:-0.030},
  {koi_period:52.8,   koi_impact:0.420,koi_duration:8.640,koi_depth:2600, koi_model_snr:44.2, koi_steff:5680,koi_slogg:4.410,koi_srad:1.000,koi_smass:0.960,koi_smet:0.000},
  {koi_period:7.18,   koi_impact:0.080,koi_duration:2.860,koi_depth:1340, koi_model_snr:72.8, koi_steff:5820,koi_slogg:4.380,koi_srad:1.070,koi_smass:1.030,koi_smet:0.050},
];

const C = {
  green:'#00ffa3', red:'#ff5f7e', purple:'#7c6eff',
  pink:'#ff6ef7',  yellow:'#ffd166', blue:'#38bdf8', orange:'#fb923c',
};
const RADIUS_COLORS = [C.blue, C.green, C.yellow, C.orange, C.red, C.pink];
const PIE_COLORS    = [C.green, C.red];

const RUNNER_STEPS = [
  { label: 'Loading & validating your data',   desc: 'Checking 10 features per object for completeness',   duration: 350 },
  { label: 'Engineering physics features',     desc: 'Computing 12 derived measurements from raw inputs',   duration: 500 },
  { label: 'Running the AI stacking ensemble', desc: 'XGBoost + Random Forest + Extra Trees → meta-learner', duration: 880 },
  { label: 'Predicting planet sizes',          desc: 'Estimating planetary radius (× Earth) per object',      duration: 420 },
  { label: 'Calculating confidence bounds',    desc: 'Quantile regression for uncertainty (±) per object',   duration: 330 },
  { label: 'Building your summary',            desc: 'Aggregating stats, charts & per-object table',        duration: 240 },
];
const RUNNER_TOTAL = RUNNER_STEPS.reduce((s, r) => s + r.duration, 0);

function exportCSV(results) {
  const hdrs = ['#', 'result', 'confidence_%', 'planet_size_x_Earth',
    'size_margin_of_error', 'planet_class', ...INPUT_FEATURES];
  const body = results.map(r => [
    r.row + 1,
    r.label === 'CONFIRMED' ? 'Real Planet' : 'False Alarm',
    (r.confidence * 100).toFixed(2),
    r.predicted_radius, r.radius_uncertainty, r.planet_class,
    ...INPUT_FEATURES.map(f => r.input[f]),
  ]);
  const csv = [hdrs, ...body].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'batch_results_100.csv'; a.click();
  URL.revokeObjectURL(url);
}

const DarkTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ba-tip">
      <p className="ba-tip-lbl">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.purple }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function BatchAnalysis({ apiBase }) {
  const [runner,     setRunner]     = useState(null);
  const [result,     setResult]     = useState(null);
  const [apiError,   setApiError]   = useState('');
  const [sortCol,    setSortCol]    = useState('row');
  const [sortDir,    setSortDir]    = useState('asc');
  const runnerCancelRef = useRef(false);

  const runAnalysis = async () => {
    if (runner !== null) return;
    setApiError(''); setResult(null);
    runnerCancelRef.current = false;
    setRunner({ step: 0 });

    const delay = ms => new Promise(r => setTimeout(r, ms));

    const apiPromise = axios.post(`${apiBase}/api/batch-predict`, { rows: SAMPLE_DATA });

    const animPromise = (async () => {
      for (let i = 0; i < RUNNER_STEPS.length; i++) {
        if (runnerCancelRef.current) return;
        setRunner({ step: i });
        await delay(RUNNER_STEPS[i].duration);
      }
      if (!runnerCancelRef.current) setRunner({ step: RUNNER_STEPS.length });
    })();

    try {
      const [, res] = await Promise.all([animPromise, apiPromise]);
      await delay(500); // hold “all done” state briefly so user can see it
      setResult(res.data);
      setRunner(null);
    } catch (err) {
      runnerCancelRef.current = true;
      setRunner(null);
      setApiError(err.response?.data?.error || 'Analysis failed — is the backend running?');
    }
  };

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortedResults = result?.results ? [...result.results].sort((a, b) => {
    const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  }) : [];

  const classData = result ? [
    { name: 'Confirmed',      value: result.confirmed },
    { name: 'False Positive', value: result.false_positives },
  ].filter(d => d.value > 0) : [];

  const THD = ({ col, label }) => (
    <th className={`ba-th ${sortCol === col ? 'ba-th-sorted' : ''}`} onClick={() => handleSort(col)}>
      {label}{sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  );

  return (
    <div className="ba-root">

      {/* ── SECTION HEADER ── */}
      <div className="ba-section-head">
        <div className="ba-sh-left">
          <span className="ba-sh-icon">⚡</span>
          <div>
            <h3 className="ba-sh-title">Batch Analysis Engine</h3>
            <p className="ba-sh-sub">
              Run our AI across <strong>100 pre-loaded star systems</strong> in one click,
              then download all results as a CSV spreadsheet.
            </p>
          </div>
        </div>
        {result && (
          <button className="ba-primary-btn ba-download-btn" onClick={() => exportCSV(result.results)}>
            ↓ Download 100 Results (.csv)
          </button>
        )}
      </div>

      {/* ── ACTION BAR ── */}
      <div className="ba-cta-wrap">
        <button
          className={`ba-run-btn${runner !== null ? ' ba-btn-disabled' : ''}`}
          onClick={runAnalysis}
          disabled={runner !== null}
        >
          {runner !== null
            ? <><span className="ba-spinner" /> Running…</>
            : result
            ? '🔄 Re-run 100 Analysis'
            : '▶️ Run 100 Star Systems Analysis'}
        </button>
        <p className="ba-cta-hint">
          {result
            ? `✅ Analysis done · ${result.confirmed} real planets, ${result.false_positives} false alarms found`
            : '100 carefully selected star systems covering all planet types — takes about 3 seconds'}
        </p>
      </div>

      {/* ── RUNNER PANEL ── */}
      {runner !== null && (
        <div className="ba-runner">
          <div className="ba-runner-hd">
            <span className="ba-runner-emoji">🔬</span>
            <div>
              <p className="ba-runner-title">
                {runner.step >= RUNNER_STEPS.length
                  ? '🎉 Analysis complete — loading your results…'
                  : 'Analysing 100 star systems…'}
              </p>
              <p className="ba-runner-sub">
                {runner.step < RUNNER_STEPS.length
                  ? `Step ${runner.step + 1} of ${RUNNER_STEPS.length} · ${RUNNER_STEPS[runner.step]?.label}`
                  : 'All steps complete'}
              </p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="ba-runner-pb-wrap">
            <div
              className="ba-runner-pb-fill"
              style={{
                width: `${
                  runner.step >= RUNNER_STEPS.length
                    ? 100
                    : Math.round(
                        RUNNER_STEPS.slice(0, runner.step).reduce((s, r) => s + r.duration, 0)
                        / RUNNER_TOTAL * 100
                      )
                }%`,
              }}
            />
          </div>

          {/* Step list */}
          <div className="ba-runner-steps">
            {RUNNER_STEPS.map((s, i) => {
              const done   = runner.step > i;
              const active = runner.step === i;
              return (
                <div
                  key={i}
                  className={`ba-rs ${done ? 'ba-rs-done' : active ? 'ba-rs-active' : 'ba-rs-pending'}`}
                >
                  <span className="ba-rs-icon">
                    {done
                      ? '✓'
                      : active
                      ? <span className="ba-runner-spin" />
                      : '○'}
                  </span>
                  <div className="ba-rs-body">
                    <span className="ba-rs-label">{s.label}</span>
                    {(done || active) && <span className="ba-rs-desc">{s.desc}</span>}
                  </div>
                  <span className="ba-rs-status">
                    {done ? 'Done' : active ? 'Running…' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {apiError && <div className="ba-error-strip">{apiError}</div>}

      {/* ── RESULTS ── */}
      {result && (
        <div className="ba-results-block">

          {/* KPI strip */}
          <div className="ba-kpi-strip">
            {[
              { label: 'Total Analyzed',   val: result.total,                             color: C.purple, fmt: v => v },
              { label: 'Confirmed',        val: result.confirmed,                         color: C.green,  fmt: v => v },
              { label: 'False Positives',  val: result.false_positives,                   color: C.red,    fmt: v => v },
              { label: 'Confirm Rate',     val: result.confirm_rate * 100,                color: C.yellow, fmt: v => v.toFixed(1) + '%' },
              { label: 'Avg Confidence',   val: result.avg_confidence * 100,              color: C.blue,   fmt: v => v.toFixed(1) + '%' },
              { label: 'Avg Planet Radius',val: result.avg_radius,                        color: C.pink,   fmt: v => v.toFixed(2) + ' R⊕' },
            ].map(k => (
              <div className="ba-kpi card" key={k.label} style={{ '--kc': k.color }}>
                <p className="ba-kpi-lbl">{k.label}</p>
                <p className="ba-kpi-val" style={{ color: k.color }}>{k.fmt(k.val)}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="ba-charts-row">

            {/* Donut */}
            <div className="card ba-chart-box">
              <p className="ba-chart-ttl">Classification Split</p>
              <div className="ba-donut-wrap">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={classData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" innerRadius={58} outerRadius={88}
                      paddingAngle={4} strokeWidth={0}
                      label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent*100).toFixed(0)}%`}
                      labelLine={{ stroke: '#6b7094', strokeWidth: 1 }}
                    >
                      {classData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]}
                          style={{ filter: `drop-shadow(0 0 8px ${PIE_COLORS[i]}88)` }} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ba-donut-center">
                  <span style={{ color: C.green, fontSize: '1.25rem', fontWeight: 800 }}>
                    {(result.confirm_rate * 100).toFixed(0)}%
                  </span>
                  <span style={{ color: '#6b7094', fontSize: '.68rem' }}>confirmed</span>
                </div>
              </div>
            </div>

            {/* Radius histogram */}
            <div className="card ba-chart-box">
              <p className="ba-chart-ttl">Radius Distribution</p>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={result.radius_buckets}
                  margin={{ top: 8, right: 8, left: -10, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7094', fontSize: 10 }}
                    angle={-18} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: '#6b7094', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<DarkTip />} />
                  <Bar dataKey="count" name="Objects" radius={[5,5,0,0]}>
                    {result.radius_buckets.map((_, i) => (
                      <Cell key={i} fill={RADIUS_COLORS[i % RADIUS_COLORS.length]}
                        style={{ filter: `drop-shadow(0 0 5px ${RADIUS_COLORS[i%RADIUS_COLORS.length]}88)` }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Confidence distribution */}
            <div className="card ba-chart-box">
              <p className="ba-chart-ttl">Confidence Distribution</p>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={result.confidence_buckets}
                  margin={{ top: 8, right: 8, left: -10, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2340" vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: '#6b7094', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7094', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<DarkTip />} />
                  <Bar dataKey="count" name="Objects" radius={[5,5,0,0]}>
                    {result.confidence_buckets.map((_, i) => {
                      const clrs = [C.red, C.orange, C.yellow, C.blue, C.green];
                      return <Cell key={i} fill={clrs[i % clrs.length]}
                        style={{ filter: `drop-shadow(0 0 5px ${clrs[i%clrs.length]}55)` }} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insight callout */}
          <div className="ba-insight card">
            <span className="ba-insight-icon">💡</span>
            <p>
              Out of <strong>{result.total}</strong> objects analyzed,{' '}
              <strong style={{ color: C.green }}>{result.confirmed}</strong> ({(result.confirm_rate*100).toFixed(0)}%)
              {' '}are predicted genuine exoplanet candidates and{' '}
              <strong style={{ color: C.red }}>{result.false_positives}</strong> are likely false positives.
              The stacking ensemble assigned uncertainty bounds via quantile regression —
              check the ± column for cases needing follow-up.
              {result.row_errors?.length > 0 &&
                ` ⚠ ${result.row_errors.length} row${result.row_errors.length > 1 ? 's' : ''} skipped due to missing/invalid data.`}
            </p>
          </div>

          {/* Results table */}
          <div className="card ba-table-card">
            <div className="ba-table-topbar">
              <p className="ba-chart-ttl" style={{ marginBottom: 0 }}>
                Per-Object Results &mdash; {result.total} objects
              </p>
              <button className="ba-ghost-btn ba-sm-btn" onClick={() => exportCSV(result.results)}>
                ↓ Export CSV
              </button>
            </div>
            <div className="ba-table-scroll">
              <table className="ba-table">
                <thead>
                  <tr>
                    <THD col="row"              label="#" />
                    <THD col="label"            label="Classification" />
                    <THD col="confidence"       label="Confidence" />
                    <THD col="predicted_radius" label="Radius (R⊕)" />
                    <THD col="radius_uncertainty" label="± CI" />
                    <THD col="planet_class"     label="Class" />
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map(r => (
                    <tr key={r.row}
                      className={`ba-row ba-row-${r.label === 'CONFIRMED' ? 'conf' : 'fp'}`}>
                      <td className="ba-td ba-mono">{r.row + 1}</td>
                      <td className="ba-td">
                        <span className={`ba-badge ba-badge-${r.label === 'CONFIRMED' ? 'conf' : 'fp'}`}>
                          {r.label}
                        </span>
                      </td>
                      <td className="ba-td ba-mono">
                        <span style={{
                          color: r.confidence > 0.85 ? C.green
                               : r.confidence > 0.70 ? C.yellow : C.red,
                        }}>
                          {(r.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="ba-td ba-mono">{r.predicted_radius.toFixed(3)}</td>
                      <td className="ba-td ba-mono" style={{ color: '#5c6080' }}>
                        ±{r.radius_uncertainty.toFixed(3)}
                      </td>
                      <td className="ba-td">
                        <span className="ba-class-pill">{r.planet_class}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
