function mpc = caso3p
% Caso teste - Sistemas Eletricos de Potencia -

mpc.version = '2';

mpc.baseMVA = 100;

% Dados de Barras
% Barra Tipo_barra Pd Qd Gs Bs area |V| teta baseKV zone Vmax Vmin

mpc.bus = [
1 3  0  0  0 0 1 1 0 230 1 1.1 0.9;
2 2 50 25  0 0 1 1 0 230 1 1.1 0.9;
3 1 40 30  0 0 1 1 0 230 1 1.1 0.9;
];

% Dados de geradores
% Barra Pg Qg Qmax Qmin Vg(FPO) MBase status (on/off) Pmax
mpc.gen = [
1    0   0  30    -30   1 100 1 500 0 0 0 0;
2    30   0 127.5 -127.5 1 100 1 300 0 0 0 0;
3    0   0 390   -390   1 100 1 300 0 0 0 0;
];

% Dados de linhas
% De Para R X B ratea rateb ratec ratio Tap status DeltaTETAmin DeltaTETAmax

mpc.branch = [
1 2 0.0 0.2 0.0  0   0   0  0 0 1 -360 360;
1 3 0.0 0.4 0.0  0   0   0  0 0 1 -360 360;
2 3 0.0 0.25 0.0  0   0   0  0 0 1 -360 360;
];