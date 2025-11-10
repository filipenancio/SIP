function mpc = case5p
% Caso teste - Sistemas Eletricos de Potencia -

mpc.version = '2';

mpc.baseMVA = 100

% Dados de Barras
% Barra Tipo_barra Pd Qd Gs Bs Area |V| teta baseKV Vmax Vmin

mpc.bus= [
1 2   0  0   0 0 1 1    0 230 1 1.05 0.95;
2 1 200 180  0 0 1 1    0 230 1 1.05 0.95;
3 1  60 150  0 0 1 1    0 230 1 1.05 0.95;
4 3   0   0  0 0 1 1.02 0 230 1 1.05 0.95;
5 1  40 130  0 0 1 1    0 230 1 1.05 0.95;
];

% Dados de geradores
% Barra Pg Qg Qmax Qmin Vg MBase status (on/off) Pmax
mpc.gen= [
1  150   0 400   -400   1     100 1  0   0 0 0 0 0 0 0 0 0 0 0 0;
4    0   0 400   -400   1.02  100 1  800 0 0 0 0 0 0 0 0 0 0 0 0;
];

% Dados de linhas
% De Para R X B ratea rateb ratec Tap status DeltaTETAmin DeltaTETAmax

mpc.branch = [
1 2 0.008   0.04 0.001  0   0   0  0 0 1 -360 360;
1 4 0.006   0.03 0.001  0   0   0  0 0 1 -360 360;
1 5 0.005   0.08 0.001  0   0   0  0 0 1 -360 360;
2 3 0.008   0.04 0.001  0   0   0  0 0 1 -360 360;
3 4 0.004   0.02 0.001  0   0   0  0 0 1 -360 360;
4 5 0.006   0.03 0.001  0   0   0  0 0 1 -360 360;
];

