function mpc = case3p
%CASE3P - personalized 3-bus test case

%% MATPOWER Case Format : Version 2
mpc.version = '2';

%%-----  Power Flow Data  -----%%
%% system MVA base
mpc.baseMVA = 100;

%% bus data
%	bus_i	type	Pd	    Qd		Gs	Bs	area	Vm		Va		baseKV	zone	Vmax	Vmin
mpc.bus = [
	1	3	0.0		0.0		0	0	1	1.05	0.0	230	1	1.1	0.9;
	2	1	40.0	20.0	0	0	1	1.0		0.0	230	1	1.1	0.9;
	3	2	25.0	15.0	0	0	1	1.04	0.0	230	1	1.1	0.9;
];

%% generator data
%	bus	Pg	Qg	Qmax	Qmin	Vg	mBase	status	Pmax	Pmin	Pc1	Pc2	Qc1min	Qc1max	Qc2min	Qc2max	ramp_agc	ramp_10	ramp_30	ramp_q	apf
mpc.gen = [
	3	35	0	100	-100	1.02	100	1	50	0	0	0	0	0	0	0	0	0	0	0	0;
	1	0	0	100	-100	1	100	1	0	0	0	0	0	0	0	0	0	0	0	0	0;
];

%% branch data
%	fbus	tbus	r	x	b	rateA	rateB	rateC	ratio	angle	status	angmin	angmax
mpc.branch = [
	1	2	0.01	0.06	0.03	250	250	250	0	0	1	-360	360;
	1	3	0.02	0.08	0.025	250	250	250	0	0	1	-360	360;
	2	3	0.015	0.07	0.02	250	250	250	0	0	1	-360	360;
];
